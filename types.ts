import { z } from 'zod';

const provinces = [
  'West-Vlaanderen' ,
  'Oost-Vlaanderen' ,
  'Antwerpen' ,
  'Vlaams-Brabant',
  'Limburg'
] as const;

export type Province = typeof provinces[number];

/**
 * Address data structure which contains all the information
 */
export type Address = {
    country: string;
    province: string;
    municipality: string;
    postalCode: string;
    street: string;
    houseNumber: string;
    boxNumber: string | null;
}

/**
 * Data structure modeling the resut of the fuzzy address search.
 * This can be sent back to the microservice when a user selects one of these adresses in the search box
 * 
 */
const locationInFlandersSchema = z.object({
  municipality: z.string(),
  street: z.string(),
  housenumber: z.string(),
  postalCode: z.string(),
});

/**
 * Data structure modeling the parts of the JSON LD output we are interested in when we
 * get back address match results
 */
const addressMatchResultSchema = z.object({
  adresMatches: z.array(z.object({
    gemeente: z.object({
      gemeentenaam: z.object({
        geografischeNaam: z.object({
          spelling: z.string()
        })
      })
    }),
    postinfo: z.object({
      objectId: z.string()
    }),
    straatnaam: z.object({
      straatnaam: z.object({
        geografischeNaam: z.object({
          spelling: z.string()
        })
      })
    }),
    huisnummer: z.string(),
    busnummer: z.string().optional(),
  }))
});

export { locationInFlandersSchema, addressMatchResultSchema };

export type LocationInFlanders = z.infer<typeof locationInFlandersSchema>;
export type AddressMatchResult = z.infer<typeof addressMatchResultSchema>;
