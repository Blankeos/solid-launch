import z from "zod"

export const paginationDTO = z.object({
  /** Starts at 1. Defaults at 1. (Server Note: this is converted to offset, starting at 0, so this var is not used for db query) */
  page: z.number().int().min(1).default(1),
  /** 0 means no limit. Defaults to 10. */
  limit: z.coerce.number().int().min(0).max(100).default(10),
})
export type PaginationDTO = z.infer<typeof paginationDTO>
export const DEFAULT_PAGINATION_OPTIONS: PaginationDTO = {
  page: 1,
  limit: 10,
}

export const paginatedResponseDTO = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    /** Array of items for the current page */
    items: z.array(itemSchema),
    /** The next page, if null, no more next page. */
    nextPage: z.number().int().min(1).nullable(),
    /** Indicates if more pages are available */
    hasMore: z.boolean(),
    /** Total number of items across all pages */
    total: z.number().int().min(0),
    /** Current page number (starts at 1) */
    page: z.number().int().min(1),
    /** Number of items per page */
    limit: z.number().int().min(0),
  })
export type PaginatedResponseDTO<T> = z.infer<ReturnType<typeof paginatedResponseDTO<z.ZodType<T>>>>

/** Turns into easy-to-use properties for the db. */
export function getDefaultPagination(
  override?: Partial<PaginationDTO>
): PaginationDTO & { offset: number } {
  const pagination = {
    page: 1,
    limit: 10,
    ...override,
  }

  return {
    ...pagination,
    offset: (pagination.page - 1) * pagination.limit,
  }
}
