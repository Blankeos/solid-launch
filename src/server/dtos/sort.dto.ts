import z from "zod"

export const sortDTO = z.object({
  /** Field to sort by. Defaults to "created_at". */
  by: z.string().default("created_at"),
  /** Sort order. Defaults to "asc". */
  order: z.enum(["asc", "desc"]).default("asc"),
})
export type SortDTO = z.infer<typeof sortDTO>

export function getDefaultSort(override?: Partial<SortDTO>): SortDTO {
  return {
    by: "created_at",
    order: "asc",
    ...override,
  }
}
