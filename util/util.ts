/**
 * Handy fuction to encode alle values of an object to URL encoding
 * @param input Any object
 * @returns An object of the same shape but with all values URL encoded
 */
export function encodeValuesURI<T extends object>(input: T): T {
    const keys = Object.keys(input);
    return keys.reduce(
      (acc, current) => {
        const original = (input as Record<string,string>)[current];
        if (!original) return acc;
        if (typeof original !== 'string') return acc;
        (acc as Record<string,string>)[current] = encodeURIComponent(original);
        return acc;
      },
      { ...input }
    );
  }