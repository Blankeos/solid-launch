import { privateEnv } from '@/env.private'
import { Context } from 'hono'

export function setSessionTokenCookie(context: Context, token: string, expiresAt: string): void {
  if (privateEnv.NODE_ENV === 'production') {
    context.header(
      'Set-Cookie',
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Path=/; Secure;`,
      { append: true }
    )
  } else {
    context.header(
      'Set-Cookie',
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Path=/`,
      { append: true }
    )
  }
}

export function deleteSessionTokenCookie(context: Context): void {
  if (privateEnv.NODE_ENV === 'production') {
    context.header('Set-Cookie', 'session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;')
  } else {
    context.header('Set-Cookie', 'session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/')
  }
}

export function generateId() {
  return Bun.randomUUIDv7()
}
