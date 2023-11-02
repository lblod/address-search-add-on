// When starting the server we will query all municipalities and cache them

import config from "../config/config";
import postalCodeToProvince from "../postcode-province/postcode-province";
import { MunicipalitySuggestion, Province, municipalityGetPostInfoResultSchema, municipalitySearchResultSchema, postalCodeGetResultSchema } from "../types";
import fs from 'fs/promises'

type MunicipalitiesPostalCodesRecord = {
    municipality: string,
    postalCodes: string[]
};

// let municipalitiesPostalCodesStore: MunicipalitiesPostalCodesRecord[] | null = null;

// (async()=>{
//     // Try to read the store from a file
//     try {
//         municipalitiesPostalCodesStore = JSON.parse(await fs.readFile(config.MUNICIPALITY_STORE_FILE_PATH, {encoding:'utf-8'}));
//     } catch (e) {
//         // We have no cached value we'll have to get everything from the API
//         // Get all municipalities
//         const response = await fetch(`${config.BASISREGISTER_MUNICIPALITY_SEARCH_URL}?gewest=vlaams&status=inGebruik&limit=500`);
//         const result = municipalitySearchResultSchema.parse(await response.json());
//         const municipalities = result.gemeenten.map((gemeente)=>gemeente.gemeentenaam.geografischeNaam.spelling);
//         // For all municipalities, get her postal info
//         for (const municipality of municipalities) {

//         }

//     }

    
//     // state = 'ready';
// })();



async function getMunicipalityByPostalCode(postalCode:string): Promise<MunicipalitySuggestion> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_GET_URL}/${postalCode}`);
    const result = postalCodeGetResultSchema.parse(await response.json());
    return {
        name: result.gemeente.gemeentenaam.geografischeNaam.spelling,
        province: postalCodeToProvince(postalCode),
        postalCode: postalCode,
        alternateNames: result.postnamen.map((postnaam)=>postnaam.geografischeNaam.spelling),
    }
}

export default async function getMunicipalitySuggestions(
    postalCode: string | undefined, 
    province: Province | undefined
): Promise<MunicipalitySuggestion[]> {
    if (postalCode) {
        // If the user entered a postal code there can only be one municipality
        if (province) {
            const checkProvince = postalCodeToProvince(postalCode)
            if (checkProvince !== province) {
                throw new Error(`Impossible combination of province and postcode received.`);
            }
        }
        return [await getMunicipalityByPostalCode(postalCode)];
    }
    else if (province && !postalCode) {
        // If the user entered a province but not a postal code then we must list all the municipalities in the province
        throw new Error('Province search not implemented yet');
    } else {
        throw new Error('Invalid combination of arguments. One of the two parameters must be defined at least.')
    }

}



