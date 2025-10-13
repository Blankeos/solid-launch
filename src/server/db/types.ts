import type { ColumnType } from 'kysely'
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>
export type Timestamp = ColumnType<Date, Date | string, Date | string>

export type OAuthAccount = {
  /**
   * i.e. 'google', 'github' (managed in application layer)
   */
  provider_id: string
  provider_user_id: string
  user_id: string
}
export type OneTimeToken = {
  token: string
  expires_at: string
  user_id: string
  purpose: string
}
export type Session = {
  id: string
  user_id: string
  expires_at: string
}
export type User = {
  id: string
  email: string
  email_verified: Generated<number>
  password_hash: string
  metadata: unknown | null
  joined_at: Generated<string>
  updated_at: Generated<string>
}
export type DB = {
  oauth_account: OAuthAccount
  onetime_token: OneTimeToken
  session: Session
  user: User
}
