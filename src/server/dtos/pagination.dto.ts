import z from "zod"

export const paginationDTO = z.object({
  /** Starts at 1. Defaults at 1. */
  page: z.coerce.number().int().min(1).default(1),
  /** 0 means no limit. Defaults to 10. */
  limit: z.coerce.number().int().min(0).max(100).default(10),
})
export type PaginationOptionsDTO = z.infer<typeof paginationDTO>
export const DEFAULT_PAGINATION_OPTIONS: PaginationOptionsDTO = {
  page: 1,
  limit: 10,
}

export const paginatedResponseDTO = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    /** Array of items for the current page */
    items: z.array(itemSchema),
    /** Indicates if more pages are available */
    hasMore: z.boolean(),
    /** Total number of items across all pages */
    total: z.number().int().min(0),
    /** Current page number (starts at 1) */
    page: z.number().int().min(1),
    /** Number of items per page */
    limit: z.number().int().min(0),
  })

export type PaginatedResponseDTO<T> = {
  items: T[]
  hasMore: boolean
  total: number
  page: number
  limit: number
}
