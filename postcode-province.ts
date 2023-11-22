import { Province } from "./types/constants";

const postalCodeRegex = /^[0-9]{4}$/;

/**
 * Calculates the province from the postal code in Flanders
 * Source: https://nl.wikipedia.org/wiki/Postcode
 * @param postalCode 
 * @returns province
 */
function postalCodeToProvince(postalCode: string): Province {
  if (!postalCodeRegex.test(postalCode)) throw new Error(`Postalcode ${postalCode} is the wrong format`);
  const p = Number.parseInt(postalCode);
  if ((1500 <= p && p < 2000) || (3000 <= p && p < 3500)) return 'Vlaams-Brabant';
  if (2000 <= p && p < 3000) return 'Antwerpen';
  if (3500 <= p && p < 4000) return 'Limburg';
  if (8000 <= p && p < 9000) return 'West-Vlaanderen';
  if (9000 <= p && p < 10000) return 'Oost-Vlaanderen';
  throw new Error(`Postalcode ${postalCode} is not in Flanders`);
}

/**
 * Returns true when the postal code is associated with a province, false when it is not.
 * The Belgian senate has its own postcode, but it is not associated with an address
 * @param postalCode 
 * @returns boolean
 */
function isValidFlamishPostalCodeAssociatedWithProvince(postalCode: string): boolean {
  try {
    postalCodeToProvince(postalCode);
    return true;
  } catch (e) {
    if (e instanceof Error) return false;
    throw e;
  }
}

export {
  postalCodeToProvince,
  isValidFlamishPostalCodeAssociatedWithProvince
}