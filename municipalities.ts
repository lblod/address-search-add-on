import config from "./config";
import { municipalitySearchResultSchema } from "./types/api-schemas";
import { ApiError } from "./types";
import prettyError from "./util/errors";

/**
 * Gets all municipality names from basisregister
 * @returns A list of municipality names
 */
export async function getAllMunicipalitiesFromApi(): Promise<string[]> {
    const response = await fetch(`${config.BASISREGISTER_MUNICIPALITY_SEARCH_URL}?status=inGebruik&gewest=vlaams&limit=500`);
    if (response.status !== 200) {
        throw new ApiError(response.status,await response.text());
    }
    const result = municipalitySearchResultSchema.safeParse(await response.json());
    if (!result.success) {
        throw new ApiError(result.error, `Schema parsing failed\n${prettyError(result.error)}`)
    }
    return result.data.gemeenten.map((municipalityResult)=>municipalityResult.gemeentenaam.geografischeNaam.spelling);
}
