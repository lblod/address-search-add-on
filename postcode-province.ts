import { Province } from './types';

const postalCodeRegex = /^[0-9]{4}$/;

//Source: https://nl.wikipedia.org/wiki/Postcode
export default function postalCodeToProvince(postalCode: string): Province {
  if (!postalCodeRegex.test(postalCode)) throw new Error(`Postalcode ${postalCode} is the wrong format`);
  const p = Number.parseInt(postalCode);
  if ((1500 <= p && p < 2000) || (3000 <= p && p < 3500)) return 'Vlaams-Brabant';
  if (2000 <= p && p < 3000) return 'Antwerpen';
  if (3500 <= p && p < 4000) return 'Limburg';
  if (8000 <= p && p < 9000) return 'West-Vlaanderen';
  if (9000 <= p && p < 10000) return 'Oost-Vlaanderen';
  throw new Error(`Postalcode ${postalCode} is not in Flanders`);
}