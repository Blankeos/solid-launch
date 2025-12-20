import type { z } from "zod"
import { formatZodIssues } from "@/utils/format-zod-issues"
import { ApiError } from "../lib/error"

export function assertDTO<T extends z.ZodType<any>>(
  data: any,
  schema: T,
  error?: string | Error
): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    if (error instanceof Error) {
      throw error
    }
    throw ApiError.InternalServerError(
      error || `Invalid DTO: ${formatZodIssues(result.error.issues)}`
    )
  }

  return result.data as z.infer<T>
}
