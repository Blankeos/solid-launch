import type { z } from "zod"
import { ApiError } from "../lib/error"

export function assertDTO<T extends z.ZodType<any>>(data: any, schema: T): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw ApiError.InternalServerError(`Invalid DTO: ${JSON.stringify(result.error)}`)
  }

  return result.data as z.infer<T>
}
