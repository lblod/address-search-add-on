import { z } from 'zod';

const postalCodeSchema = z.string().regex(/^[0-9]{4}$/);

/**
 * Data structure modeling the resut of the fuzzy address search.
 * This can be sent back to the microservice when a user selects one of these adresses in the search box
 * URL: https://geo.api.vlaanderen.be/geolocation/v4/Location
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
 * URL: https://api.basisregisters.vlaanderen.be/v2/adresmatch + query params
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

/**
 * We call this endpoint to search for municipalities
 * URL: https://api.basisregisters.vlaanderen.be/v2/gemeenten + query params
 */
const municipalitySearchResultSchema = z.object({
    gemeenten: z.array(z.object({
        gemeentenaam: z.object({geografischeNaam:z.object({spelling:z.string()})}),
        detail: z.string(),
    }))
    })

/**
 * We call this endpoint to receive information associated with ta single postalcode
 * URL https://api.basisregisters.vlaanderen.be/v2/postinfo/{:postcode}
 */
const postalCodeMoreInformationSchema = z.object({
    identificator: z.object({
        objectId: z.string(),
    }),
    gemeente: z.object({
        gemeentenaam: z.object({
        geografischeNaam: z.object({
            spelling: z.string(),
        }),
        }),
    }),
    postnamen: z.array(z.object({
        geografischeNaam: z.object({
        spelling: z.string(),
        }),
    }))
    });

/**
 * We call this endpoint to search for post information associated with a specific postal name
 * URL https://api.basisregisters.vlaanderen.be/v2/postinfo + query params
 */
const municipalityGetPostInfoResultSchema = z.object({
    postInfoObjecten: z.array(z.object({
        identificator: z.object({
        objectId:z.string(),
        }),
        postnamen: z.array(z.object({
        geografischeNaam: z.object({
            spelling: z.string(),
        }),
        }))
    }))
    });

export {
    postalCodeSchema,
    locationInFlandersSchema,
    addressMatchResultSchema,
    municipalitySearchResultSchema,
    postalCodeMoreInformationSchema,
    municipalityGetPostInfoResultSchema,

}

