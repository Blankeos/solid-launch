import z from "zod"

/** Mainly used for GET requests queries because it only takes in strings, just like numeric is. */
export const literalBool = z.enum(["true", "false"]).transform((val) => val === "true")
