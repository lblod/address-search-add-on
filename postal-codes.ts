// When starting the server we will query all municipalities and cache them

import config from "./config";
import { z } from 'zod';
import { municipalityGetPostInfoResultSchema, postalCodeMoreInformationSchema } from "./types/api-schemas";
import { ApiError } from "./types";
import prettyError from "./util/errors";

async function getPostalInformation(limit:number,offset:number):Promise<z.infer<typeof municipalityGetPostInfoResultSchema>> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}?limit=${limit}&offset=${offset}`);
    if (response.status !== 200) {
        throw new ApiError(response.status,await response.text());
    }
    return municipalityGetPostInfoResultSchema.parse(await response.json());
}

async function getSpecificPostalInformation(postalCode: string):Promise<z.infer<typeof postalCodeMoreInformationSchema>> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}/${postalCode}`);
    if (response.status !== 200) {
        throw new ApiError(response.status,await response.text());
    }
    const result = postalCodeMoreInformationSchema.safeParse(await response.json());
    if (!result.success) {
        throw new ApiError(result.error, `Schema parsing failed\n${prettyError(result.error)}`)
    }
    return result.data;
}

export {
    getPostalInformation,
    getSpecificPostalInformation
}
