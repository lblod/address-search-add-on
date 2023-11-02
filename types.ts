import { z } from 'zod';

const provinces = [
  'West-Vlaanderen' ,
  'Oost-Vlaanderen' ,
  'Antwerpen' ,
  'Vlaams-Brabant',
  'Limburg'
] as const;

const europeanCountries = [
  "België",
  "Bulgarije",
  "Cyprus",
  "Denemarken",
  "Duitsland",
  "Estland",
  "Finland",
  "Frankrijk",
  "Griekenland",
  "Hongarije",
  "Ierland",
  "Italië",
  "Kroatië",
  "Letland",
  "Litouwen",
  "Luxemburg",
  "Malta",
  "Nederland",
  "Oostenrijk",
  "Polen",
  "Portugal",
  "Roemenië",
  "Slovenië",
  "Slowakije",
  "Spanje",
  "Tsjechië",
  "Zweden",
] as const;

export type Province = typeof provinces[number];
export type Country = typeof europeanCountries[number];

const postalCodeSchema = z.string().regex(/^[0-9]{4}$/);

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

const searchQuerySchema = z.object({
  query: z.string(),
});

const municipalitiesQuerySchema = z.object({
  postalCode: postalCodeSchema.optional(),
  province: z.enum(provinces).optional(),
});

const postalCodeQuerySchema = z.object({
  municipality: z.string().optional(),
  province: z.enum(provinces).optional(),
});

const provinceQuerySchema = z.object({
  postalCode: postalCodeSchema.optional(),
  municipality: z.string().optional(),
});

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

const municipalitySearchResultSchema = z.object({
  gemeenten: z.array(z.object({
    gemeentenaam: z.object({geografischeNaam:z.object({spelling:z.string()})}),
    detail: z.string(),
  }))
})

const postalCodeGetResultSchema = z.object({
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
})

export type MunicipalitySuggestion = {
  name: string;
  province: Province;
  postalCode: string;
  alternateNames: string[] | undefined,
}

export type PostalCodeSuggestion = {
  postalCode: string,
  alternateNames: string[],
}

export { 
  provinces,
  europeanCountries,
  locationInFlandersSchema, 
  addressMatchResultSchema, 
  searchQuerySchema, 
  municipalitySearchResultSchema,
  postalCodeSchema,
  postalCodeQuerySchema,
  municipalitiesQuerySchema,
  provinceQuerySchema,
  postalCodeGetResultSchema,
  municipalityGetPostInfoResultSchema,
};

export type LocationInFlanders = z.infer<typeof locationInFlandersSchema>;
export type AddressMatchResult = z.infer<typeof addressMatchResultSchema>;
