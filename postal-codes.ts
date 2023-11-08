// When starting the server we will query all municipalities and cache them

import config from "./config";
import { PostalCodeSuggestion, Province, municipalityGetPostInfoResultSchema } from "./types";

async function getPostalInformationByMunicipality(municipality: string): Promise<PostalCodeSuggestion[]> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}?gemeentenaam${municipality}`);
    const result = municipalityGetPostInfoResultSchema.parse(await response.json());
    return result.postInfoObjecten.map((info)=>{
        return {
            postalCode: info.identificator.objectId,
            alternateNames: info.postnamen.map((name)=>name.geografischeNaam.spelling),
        }
    });
}

export default async function getPostalCodeSuggestions(
    municipality: string | undefined, 
    province: Province | undefined
): Promise<PostalCodeSuggestion[]> {
    if (province) throw new Error('Province not implemented yet')
    if (municipality) {
        const result = await getPostalInformationByMunicipality(municipality);
        return result;
    } else {
        throw new Error('At least one of the two parameters must be defined;')
    }

}



