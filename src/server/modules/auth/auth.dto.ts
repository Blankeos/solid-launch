import type { Selectable } from "kysely"
import z from "zod"
import { publicEnv } from "@/env.public"
import { initHonoClient } from "@/lib/hono-client"
import type { Session, User } from "@/server/db/types"
import { assertDTO } from "@/server/utils/assert-dto"
import { jsonDecode } from "./auth.utilities"

// ===========================================================================
// SERVER ONLY
// ===========================================================================

/** Make sure to edit as needed ✍️ */
const _baseUserMetaDTO = z.object({
  username: z.string().optional(),
  name: z.string().optional(),
  /** Public avatar url from oauth if possible. */
  avatar_url: z.string().optional(),
  /**
   * Object id from own bucket. Higher priority to show over avatar_url, if uploadable images are a thing.
   * This is separate because S3 buckets are generally "private", and only send signed urls.
   */
  avatar_object_id: z.string().optional(),
})

/** What the user can input during sign-in/sign-up. */
export const userMetaClientInputDTO = _baseUserMetaDTO.omit({ avatar_url: true })
export type UserMetaClientInputDTO = z.infer<typeof userMetaClientInputDTO>

export const userMetaDTO = _baseUserMetaDTO.optional().nullable()
export type UserMetaDTO = z.infer<typeof userMetaDTO>

// Server-only: User passed around in server context
export type InternalUserDTO = Selectable<User>
export type InternalSessionDTO = Selectable<Session>

// ===========================================================================
// CLIENT AND SERVER: Make sure to edit this and the userMetaDTO as needed! ✍️
// ===========================================================================

// Frontend & Server: User passed around in client context.
//
export async function getUserResponseDTO(user: InternalUserDTO, session: InternalSessionDTO) {
  const userMeta = assertDTO(jsonDecode(user.metadata as string), userMetaDTO) // You can also userMetaDTO.omit() if you don't want to show some meta data to the frontend

  // EDIT THIS
  return {
    id: user.id,
    email: user.email,
    email_verified: user.email_verified,
    joined_at: user.joined_at,
    updated_at: user.updated_at,
    metadata: await getUserResponseMetaDTO(userMeta),
    active_organization_id: session.active_organization_id,
  }
}
export type UserResponseDTO = Awaited<ReturnType<typeof getUserResponseDTO>>

export async function getUserResponseMetaDTO(
  userMeta: UserMetaDTO
): Promise<{ name?: string; avatar_url?: string }> {
  // When the user has uploaded, don't return the oauth avatar.
  const avatar_url: string | undefined = userMeta?.avatar_object_id
    ? initHonoClient(publicEnv.PUBLIC_BASE_URL)
        .auth.profile.avatar[":uniqueId"].$url({ param: { uniqueId: userMeta.avatar_object_id } })
        ?.toString()
    : userMeta?.avatar_url

  return {
    name: userMeta?.name,
    avatar_url,
  }
}
export type UserResponseMetaDTO = Awaited<ReturnType<typeof getUserResponseMetaDTO>>

// ===========================================================================
// Other DTOs
// ===========================================================================
export const passwordDTO = z.string().min(8, "Password must be at least 6 characters long")
// .regex(/[a-z]/, "Password must contain at least one lowercase letter")
// .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
// .regex(/[0-9]/, "Password must contain at least one number")
// .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
