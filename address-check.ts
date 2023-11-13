import config from './config';
import { LocationInFlanders } from './fuzzy-search';
import { postalCodeToProvince } from './postcode-province';
import { Address } from './types';
import { addressMatchResultSchema } from './types/api-schemas';
import { encodeValuesURI } from './util/util';

export default async function getAllVerifiedAddresses(
  location: LocationInFlanders
): Promise<Address[]> {
  console.log(`Request:${getAllAddressesSearchUrl(location)}`);
  const response = await fetch(getAllAddressesSearchUrl(location));
  const jsonLdBody = addressMatchResultSchema.parse(await response.json());
  const addresses = jsonLdBody.adresMatches.map<Address>((match)=>{
    return {
      country: 'België',
      province: postalCodeToProvince(match.postinfo.objectId),
      municipality: match.gemeente.gemeentenaam.geografischeNaam.spelling,
      postalCode: match.postinfo.objectId,
      street: match.straatnaam.straatnaam.geografischeNaam.spelling,
      houseNumber: match.huisnummer,
      boxNumber: match.busnummer ?? null,
    };
  });

  return addresses;
}

function getAllAddressesSearchUrl(location: LocationInFlanders) {
  const uriEncodedLocation = encodeValuesURI(location);
  return `${config.BASISREGISTER_ADDRESSES_SEARCH_URL}?gemeentenaam=${uriEncodedLocation.municipality}&postcode=${uriEncodedLocation.postalCode}&straatnaam=${uriEncodedLocation.street}&huisnummer=${uriEncodedLocation.housenumber}`;
}
