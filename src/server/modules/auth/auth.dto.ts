import z from 'zod'

// User response & read by frontend.
export const userDTO = z.object({
  id: z.string(),
})
export type UserDTO = z.infer<typeof userDTO>

// User passed around in context.
import { Session, User } from '@/server/db/types'
import { Selectable } from 'kysely'

export type InternalUserDTO = Selectable<User>
export type InternalSessionDTO = Selectable<Session>
