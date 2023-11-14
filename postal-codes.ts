// When starting the server we will query all municipalities and cache them

import config from "./config";
import { z } from 'zod';
import { municipalityGetPostInfoResultSchema, postalCodeMoreInformationSchema } from "./types/api-schemas";
import { ApiError } from "./types";
import prettyError from "./util/errors";

/**
 * Queries the Basisregisters API to get information about postal codes. This information is presented as a list and each list item does not contain exactly the information of a detailed query
 * @param limit 
 * @param offset 
 * @returns 
 */
async function getPostalInformation(limit:number,offset:number):Promise<z.infer<typeof municipalityGetPostInfoResultSchema>> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}?limit=${limit}&offset=${offset}`);
    if (response.status !== 200) {
        throw new ApiError(response.status,await response.text());
    }
    return municipalityGetPostInfoResultSchema.parse(await response.json());
}

/**
 * Queries the basisregister API for detailed information concerning a specific postcode.
 * @param postalCode 
 * @returns A datastructure with more information
 */
async function getSpecificPostalInformation(postalCode: string):Promise<z.infer<typeof postalCodeMoreInformationSchema>> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}/${postalCode}`);
    if (response.status !== 200) {
        throw new ApiError(response.status,await response.text());
    }
    const body = await response.json();
    const result = postalCodeMoreInformationSchema.safeParse(body);
    if (!result.success) {
        throw new ApiError(result.error, `Schema parsing failed\n${prettyError(result.error)}\nBody was:\n${JSON.stringify(body,undefined,3)}`)
    }
    return result.data;
}

export {
    getPostalInformation,
    getSpecificPostalInformation
}
