import { z } from 'zod';
import config from './config';
import { ApiError } from './types';
import prettyError from './util/errors';

const locationResultSchema = z.object({
    Municipality: z.string(),
    Zipcode: z.string(),
    Thoroughfarename: z.string(),
    Housenumber: z.string(),
    FormattedAddress: z.string(),
});

type LocationResult = z.infer<typeof locationResultSchema>;

export type LocationInFlanders = {
    municipality: string;
    street: string;
    housenumber: string;
    postalCode: string;
}

const validResponseSchema = z.array(locationResultSchema);

async function getLocations(fuzzyQuery:string): Promise<LocationResult[]> {
    const response = await fetch(fuzzySearchUrl(fuzzyQuery));
    if (response.status !== 200) {
        throw new ApiError(response.status,await response.text());
    }
    const result = validResponseSchema.safeParse((await response.json()).LocationResult);
    if (!result.success) {
        throw new ApiError(result.error, `Schema parsing failed\n${prettyError(result.error)}`)
    }
    return result.data;
}

function fuzzySearchUrl(fuzzyQuery:string):string {
    return `${config.FUZZY_SEARCH_API_URL}?q=${encodeURIComponent(fuzzyQuery)}&c=10&type=Housenumber`
}

function locationResultToLocationInFlanders(location:LocationResult):LocationInFlanders {
    return {
        municipality: location.Municipality,
        street: location.Thoroughfarename,
        housenumber: location.Housenumber,
        postalCode: location.Zipcode,
    }
}

/**
 * Queries the fuzzy address search API to search for locations in Flanders using a fuzzy search string
 * @param fuzzyQuery The query in string format
 * @returns An array of locations
 */
export default async function fuzzySearch(fuzzyQuery:string): Promise<LocationInFlanders[]> {
    const locations = await getLocations(fuzzyQuery);
    return locations.map(locationResultToLocationInFlanders);
}