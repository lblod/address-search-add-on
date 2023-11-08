// When starting the server we will query all municipalities and cache them

import config from "./config";
import postalCodeToProvince from "./postcode-province";
import { MunicipalitySuggestion, Province, municipalityGetPostInfoResultSchema, municipalitySearchResultSchema, postalCodeMoreInformationSchema } from "./types";
import { z } from 'zod';

async function getMunicipalityByPostalCode(postalCode:string): Promise<MunicipalitySuggestion> {
    const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}/${postalCode}`);
    const result = postalCodeMoreInformationSchema.parse(await response.json());
    const name = result.gemeente.gemeentenaam.geografischeNaam.spelling;
    return {
        name,
        province: postalCodeToProvince(postalCode),
        postalInfo: result.postnamen.map((info)=>{
            return {
                postalCode,
                alernateName: info.geografischeNaam.spelling,
            }
        }).filter((postalInfo)=>postalInfo.alernateName.toLowerCase()!==name.toLowerCase())
    }
}

export async function getAllMunicipalitiesFromApi(): Promise<string[]> {
    const response = await fetch(`${config.BASISREGISTER_MUNICIPALITY_SEARCH_URL}?status=inGebruik&gewest=vlaams&limit=500`);
    const result = municipalitySearchResultSchema.parse(await response.json());
    return result.gemeenten.map((municipalityResult)=>municipalityResult.gemeentenaam.geografischeNaam.spelling);
}

// type PostInfoObjecten = (z.infer<typeof municipalityGetPostInfoResultSchema>)['postInfoObjecten'];


// async function getAllMunicipalitySuggestions():Promise<MunicipalitySuggestion[]> {
//     const response = await fetch(`${config.BASISREGISTER_POSTALCODE_SEARCH_URL}?limit=500`);
//     const postInfoObjects = municipalityGetPostInfoResultSchema.parse(await response.json()).postInfoObjecten;
//     const municipalityNames = await getAllMunicipalitiesFromApi();
//     return municipalityNames.map<MunicipalitySuggestion>((name)=>{
//         // Find all the postInfo's where the municipality name features
//         const postInfosForMunicipality = postInfoObjects.filter((postInfoObject)=>postInfoObject.postnamen.find((postnaam)=>postnaam.geografischeNaam.spelling.toLowerCase()===name.toLowerCase()));
//         if (!postInfosForMunicipality[0]) throw new Error(`No post information found for municipality ${name}`);
//         const firstPostcode = postInfosForMunicipality[0].identificator.objectId;
//         const post

//         return {
//             name,
//             province: postalCodeToProvince(firstPostcode),
//             postalInfo: postInfosForMunicipality.reduce((infoAcc, infoCurrent)=>{

//             },[]);
//         }
//     });
// }


export async function getMunicipalitySuggestions(
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
        throw new Error('Invalid combination of arguments. One of the two parameters must be defined at least in order to run this function')
    }

}



