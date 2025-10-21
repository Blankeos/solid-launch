import z from "zod"

// ===========================================================================
// SERVER ONLY
// ===========================================================================
// The actual DB schema for user meta (Only defined in application layer. Not defined in DB. Just a json in the db)
export const userMetaDTO = z
  .object({
    username: z.string().optional(),
    name: z.string().optional(),
    // Avatar url from oauth if possible
    avatar_url: z.string().optional(),
  })
  .optional()
  .nullable()
export type UserMetaDTO = z.infer<typeof userMetaDTO>

import type { Selectable } from "kysely"
// Server-only: User passed around in server context
import type { Session, User } from "@/server/db/types"
import { assertDTO } from "@/server/utils/assert-dto"

export type InternalUserDTO = Selectable<User>
export type InternalSessionDTO = Selectable<Session>

// ===========================================================================
// CLIENT AND SERVER: Make sure to edit as needed! ✍️
// ===========================================================================
// Frontend & Server: User passed around in client context.
export function getUserResponseDTO(user: InternalUserDTO) {
  const userMeta = assertDTO(JSON.parse(user.metadata as string), userMetaDTO) // You can also userMetaDTO.omit() if you don't want to show some meta data to the frontend

  // EDIT THIS
  return {
    id: user.id,
    email: user.email,
    email_verified: user.email_verified,
    joined_at: user.joined_at,
    updated_at: user.updated_at,
    metadata: userMeta,
  }
}
export type UserResponseDTO = ReturnType<typeof getUserResponseDTO>
