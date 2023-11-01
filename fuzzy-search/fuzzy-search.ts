import { z } from 'zod';
import config from '../config/config';
import { LocationInFlanders } from '../types';

const locationResultSchema = z.object({
    Municipality: z.string(),
    Zipcode: z.string(),
    Thoroughfarename: z.string(),
    Housenumber: z.string(),
    FormattedAddress: z.string(),
});

type LocationResult = z.infer<typeof locationResultSchema>;

const validResponseSchema = z.array(locationResultSchema);
async function getLocations(fuzzyQuery:string): Promise<LocationResult[]> {
    const response = await fetch(fuzzySearchUrl(fuzzyQuery));
    const locationResult = validResponseSchema.parse((await response.json()).LocationResult);
    return locationResult;
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

export default async function fuzzySearch(fuzzyQuery:string): Promise<LocationInFlanders[]> {
    const locations = await getLocations(fuzzyQuery);
    return locations.map(locationResultToLocationInFlanders);
}