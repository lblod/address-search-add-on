import { ZodError, z } from 'zod';
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

const postalNamesQuerySchema = z.object({
  postalCode: postalCodeSchema.optional(),
  province: z.enum(provinces).optional(),
});

const postalCodesQuerySchema = z.object({
  postalName: z.string().optional(),
  province: z.enum(provinces).optional(),
});

const provinceQuerySchema = z.object({
  postalCode: postalCodeSchema.optional(),
  postalName: z.string().optional(),
});

class ClientError extends Error {
  constructor(
    public readonly status: number, 
    message?:string, 
    options?:ConstructorParameters<typeof Error>[1],
  ) {
    super(message,options)
  }
}

class ServerError extends ClientError {
  constructor(
    message?:string, 
    options?:ConstructorParameters<typeof Error>[1]
  ) {
    super(500,message,options)
  }
}

/*
    public readonly status: number,
    public readonly schemaError?:ZodError,
    message?:string, 
    options?:ConstructorParameters<typeof Error>[1],
*/

type ApiArgs = 
  [ number | ZodError ,string, ConstructorParameters<typeof Error>[1]? ];

class ApiError extends Error {
  readonly status: number;
  readonly zodError: ZodError | undefined;
  constructor(...args: ApiArgs) {
    super(args[1],args[2])
    if (args[0] instanceof ZodError) {
      this.status = 200;
      this.zodError = args[0]
    } else {
      this.status = args[0];
      this.zodError = undefined;
    }
  }
}

export type PostalNameSuggestion = {
  postalName: string;
  postalCode: string;
  province: Province;
  isMunicipality: boolean,
  associatedMunicipality: string | undefined,
}

export type PostalCodeSuggestion = {
  postalCode: string,
  province: Province,
  postalNames: {
    name: string,
    isMunicipality: boolean,
  }[],
}

export type ProvinceSuggestion = string; // For now

export { 
  searchQuerySchema,
  postalNamesQuerySchema,
  postalCodesQuerySchema,
  provinceQuerySchema,
  ClientError,
  ServerError,
  ApiError,
};



