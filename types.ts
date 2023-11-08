import { z } from 'zod';
import { postalCodeSchema } from './types/api-schemas';
import { Province, provinces } from './types/constants';

/**
 * Address data structure which contains all the information associated with a correctly formatted address.
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

// Schema's for validation of query objects

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


export type PostalNameSuggestion = {
  postalName: string;
  postalCode: string;
  province: Province;
  municipalityName?: string,
}

export type PostalCodeSuggestion = {
  postalCode: string,
  postalNames: string[], // At least one
}

export type ProvinceSuggestion = string; // For now

export { 
  searchQuerySchema,
  municipalitiesQuerySchema,
  postalCodeQuerySchema,
  provinceQuerySchema,
};



