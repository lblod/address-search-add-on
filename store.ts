/**
 * This module acts like a small database wich caches the results of the basisregister API
 */

import { getAllMunicipalitiesFromApi } from "./municipalities";
import { 
    getPostalInformation as loadPostalInformationFromApi,
    getSpecificPostalInformation as loadSpecificPostalInformationFromApi,
} from "./postal-codes";
import { municipalityGetPostInfoResultSchema, postalCodeMoreInformationSchema } from "./types/api-schemas";
import { z } from 'zod';
import fs from 'node:fs/promises';
import { isValidFlamishPostalCodeAssociatedWithProvince, postalCodeToProvince } from "./postcode-province";
import { ApiError, ClientError, PostalCodeSuggestion, PostalNameSuggestion } from "./types";
import { Province, provinces } from "./types/constants";
import { envStringToBoolean } from "./util/util";

const DISABLE_CACHE = envStringToBoolean(process.env["DISABLE_CACHE"] ?? 'false')

function delay(millis:number):Promise<void> {
    return new Promise((resolve)=>setTimeout(resolve,millis));
}

const notInitializedError = new Error('Store not initialised');

const initialized = false;

let municipalityNames: null | Set<string> = null;
let postalNames: null | Set<string> = null;
let postalCodes: null | Set<string> = null;

let postalNameStore: null | Record<string,PostalNameSuggestion> = null;
let postalCodeStore: null | Record<string,PostalCodeSuggestion> = null;

type PostInfoResult = z.infer<typeof municipalityGetPostInfoResultSchema>;

// Async generator to get all postal names
async function* postalInformationGenerator() {
    let done = false;
    let offset = 0;
    const limit = 50;
    while (!done) {
        const results = await loadPostalInformationFromApi(limit,offset);
        console.log(`Got ${results.postInfoObjecten.length} results using offset ${offset} and limit ${limit} from API.`)
        done = !results.volgende;
        offset += limit;
        yield results;
        await delay(500); // Delay to prevent us from flooding the api
    }
    return;
}

// Async generator to get all postal code detail information
async function* postalCodeDetailGenerator(postalCodes: Set<string>) {
    const remainingPostalCodes = [...postalCodes];
    while (remainingPostalCodes.length > 0) {
        const current = remainingPostalCodes.pop();
        if (!current) break;
        let success = false;
        let retries = 0;
        while (!success) {
            try {
                console.log(`Getting detailed info for postalcode ${current} from API.`)
                const results = await loadSpecificPostalInformationFromApi(current);
                yield results;
                await delay(2000); // Delay to prevent us from flooding the api
                success = true;
            } catch (e) {
                if (e instanceof ApiError) {
                    // We got thrown off. Wait 5 minutes. If we retried too many times bail out anyway
                    console.log(`Got status ${e.status} from API with message: \n${e.message}\nRetrying in 5 minutes.`);
                    if (retries >= 3) throw e; // No retry if too many tries
                    // if (e.zodError) throw e; // No retry if we got 200 but failed to parse
                    await delay(1000 * 60 * 5);
                    success = false;
                    retries++;
                } else {
                    throw e;
                }
            }
        }
    }
    return;
}


function isInitialized():boolean {
    return initialized;
}

function capitalize(input:string):string {
    if (!input.length) return "";
    if (input.length === 1) return input.toUpperCase();
    const cap = input.slice(0,1).toUpperCase();
    const rest = input.slice(1).toLowerCase();
    return cap + rest;
}

type PostalInformation = PostInfoResult['postInfoObjecten'][number];

async function loadPostalInformation():Promise<PostalInformation[]> {
    // Try a file
    try {
        if (DISABLE_CACHE) throw new Error('No cache allowed.');
        const postalInformation = await fs.readFile('/app/cache/postal-information.json',{encoding:'utf-8'});
        console.log('Got postal information from cache');
        return JSON.parse(postalInformation) as PostalInformation[];
    } catch (e) {
        if (!(e instanceof Error)) throw e;
        const postalInformation: PostalInformation[] = [];
        for await (const batch of postalInformationGenerator()) {
            postalInformation.push(...batch.postInfoObjecten.filter((info)=>isValidFlamishPostalCodeAssociatedWithProvince(info.identificator.objectId)))
        }
        // Save this result for next time
        await fs.writeFile('/app/cache/postal-information.json',JSON.stringify(postalInformation, undefined, 3),{encoding:'utf-8'});
        return postalInformation;
    }
}

async function loadMunicipalityNames():Promise<string[]> {
    // Try a file
    try {
        if (DISABLE_CACHE) throw new Error('No cache allowed.');
        const municipalities = await fs.readFile('/app/cache/municipalities.json',{encoding:'utf-8'});
        console.log('Got municipalities from cache');
        return JSON.parse(municipalities);
    } catch (e) {
        if (!(e instanceof Error)) throw e;
        const municipalities = await getAllMunicipalitiesFromApi(); // Populate list of 300 names
        // Save this result for next time
        await fs.writeFile('/app/cache/municipalities.json',JSON.stringify(municipalities, undefined, 3),{encoding:'utf-8'});
        return municipalities;
    }
}

type PostDetail = z.infer<typeof postalCodeMoreInformationSchema>;

async function loadPostCodeDetails(postcodes:Set<string>):Promise<Record<string,PostDetail>> {
    // Try a file
    const cachedDetails: Record<string,PostDetail> = await (async()=>{
        if (DISABLE_CACHE) return {};
        try {
            const detailsText = await fs.readFile('/app/cache/post-details.json',{encoding:'utf-8'});
            return JSON.parse(detailsText) as Record<string,PostDetail>;
        } catch (e) {
            if (!(e instanceof Error)) throw e;
            return {}
        }
    })();
    // Get the remaining postcodes from the api.
    const remainingPostcodes = new Set([...postcodes]);
    Object.keys(cachedDetails).forEach((postalCode)=>remainingPostcodes.delete(postalCode));
    if (remainingPostcodes.size) {
        console.log(`We could not get every post code detail from the cache. Still need to query ${remainingPostcodes.size} postcodes.`);
        // There are still postcodes remaining we need to query
        try {
            for await (const detail of postalCodeDetailGenerator(remainingPostcodes)) {
                const postcode = detail.identificator.objectId;
                cachedDetails[postcode] = detail;
            }
        } catch (e) {
            // Ignore API errors. Generator has retry mechanism. Any other error should throw this function out.
            if (!(e instanceof ApiError)) throw e;
        }
        // We may have found some additional codes before it errored out.
        // Save this result for next time
        await fs.writeFile('/app/cache/post-details.json',JSON.stringify(cachedDetails, undefined, 3),{encoding:'utf-8'});
    }

    return cachedDetails;
}


/**
 * Query data from basisregisters or get it from the cache to build some data structures to query into.
 * This function needs to be completed or the functions getPostalNames, getPostalCodes, getProvinces wil not work
 */
async function initializeStore() {
    console.log('INITIALIZING SERVICE BY GATHERING DATA FROM THE CACHE OR BASISREGISTERS API.');
    municipalityNames = new Set(await loadMunicipalityNames());
    console.log(`Got list of ${municipalityNames.size} unique municipality names from the basisregisters API`);
    const postalInformation = await loadPostalInformation();

    // Extract all unique postal codes and names
    postalCodes = new Set(postalInformation.map((info)=>info.identificator.objectId));
    postalNames = new Set(postalInformation.reduce<string[]>((acc,current)=>{
        acc.push(...current.postnamen.map((postNaam)=>capitalize(postNaam.geografischeNaam.spelling)));
        return acc;
    },[]))
    console.log(`Got ${postalCodes.size} unique postal codes and ${postalNames.size} unique postal names from a collection of ${postalInformation.length} objects returned by the basisregisters API.`);

    // Get the postal details:
    const postalDetails = await loadPostCodeDetails(postalCodes);

    console.log(`Queried the details of ${Object.keys(postalDetails).length} postal codes from the basisregisters API`)

    // Now we start building some data stores.
    postalNameStore = [...postalNames].reduce<Record<string,PostalNameSuggestion>>((acc,current)=>{
        const postalCode = postalInformation.find((info)=>info.postnamen.map((postnaam)=>capitalize(postnaam.geografischeNaam.spelling)).includes(current))?.identificator.objectId;
        if (!postalCode) throw new Error(`Impossible. Postal code for ${current} not found.`);
        const postalCodeDetailInformation = postalDetails[postalCode];
        if (!postalCodeDetailInformation) throw new Error(`Impossible. Postal code defatil information for ${current} with postal code ${postalCode} not found.`);
        const isMunicipality =  municipalityNames!.has(current);
        const associatedMunicipality = postalCodeDetailInformation.gemeente?.gemeentenaam.geografischeNaam.spelling;
        acc[current] = {
            postalName: current,
            postalCode,
            province: postalCodeToProvince(postalCode),
            isMunicipality,
            associatedMunicipality,
        }
        return acc;
    },{});

    postalCodeStore = [...postalCodes].reduce<Record<string,PostalCodeSuggestion>>((acc,current)=>{
        const postalCodeDetailInformation = postalDetails[current];
        if (!postalCodeDetailInformation) throw new Error(`Impossible. Postal information for ${current} not found.`);
        acc[current] = {
            postalCode: current,
            province: postalCodeToProvince(current),
            postalNames: postalCodeDetailInformation.postnamen.map((postNaam)=>{
                const name = capitalize(postNaam.geografischeNaam.spelling);
                return {
                    name,
                    isMunicipality: municipalityNames!.has(name)
                }
            }),
        }
        return acc;
    },{});


}

function getPostalNames(postalCode?: string, province?: Province):PostalNameSuggestion[] {
    if (!postalNameStore) throw notInitializedError;
    // Return all if no province and no postalCode is given
    let result = Object.values(postalNameStore);
    if (province) {
        result = result.filter((suggestion)=>suggestion.province === province);
    }
    if (postalCode) {
        result = result.filter((suggestion)=>suggestion.postalCode === postalCode);
    }
    return result;
}

function getPostalCodes(postalName?: string, province?:Province):PostalCodeSuggestion[] {
    if (!postalCodeStore) throw notInitializedError;
    // Return all if no province and no postalCode is given
    let result = Object.values(postalCodeStore);
    if (postalName) {
        result = result.filter((suggestion)=>suggestion.postalNames.find((postalNameInSuggestion)=>postalNameInSuggestion.name===postalName))
    }
    if (province) {
        result = result.filter((suggestion)=>suggestion.province===province);
    }

    return result;
}

function getProvinces(postalCode?: string, postalName?:string):Province[] {
    if (!postalNameStore) throw notInitializedError;
    if (postalName && !postalCode) {
        const postalNameInfo = postalNameStore[postalName];
        if (!postalNameInfo) throw new ClientError(404,`Postalname ${postalName} not found.`);
        return [postalNameInfo.province];
    }
    if (postalCode) return [postalCodeToProvince(postalCode)];
    return (provinces as unknown) as Province[];
}

export {
    isInitialized,
    initializeStore,
    getPostalNames,
    getPostalCodes,
    getProvinces,
}

export type MunicipalityInformation = {
    name: string,
    postalCodes: string[],
    postalNames: string[],
}

export type PostalNameInformation = {
    postalName: string;
    postalCode: string;
    municipality: MunicipalityInformation;
}

