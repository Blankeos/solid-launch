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
