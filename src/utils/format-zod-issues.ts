import type z from "zod"

/** Helper to format Zod issues into a readable message */
export function formatZodIssues(
  // issues?: Array<{ code: string; message: string; path: string[] }>
  issues?: z.core.$ZodIssue[]
): string | undefined {
  if (!issues?.length) return undefined

  return issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ")
}
