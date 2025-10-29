import { z } from "zod"

/** A DTO that makes sure it's a string and parses it into a number. The type output is still number. Useful for numbers in url queries and params.*/
export const numericString = z.string().regex(/^\d+$/, "Must be a numeric string").transform(Number)
