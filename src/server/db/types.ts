import type { ColumnType } from "kysely"
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
  /**
   * Always populated, globally unique
   */
  token: string
  /**
   * Optional shorter digit alias, scoped to user (so not globally unique)
   */
  code: string | null
  expires_at: string
  identifier: string
  /**
   * e.g. 'password_reset', 'magic_link', 'otp', etc. (managed in application layer)
   */
  purpose: string
  /**
   * Might be needed for data consumption i.e. a phone number
   */
  metadata: unknown | null
}
export type Organization = {
  id: string
  name: string
  /**
   * Optional URL-friendly identifier
   */
  slug: string | null
  logo_object_id: string | null
  /**
   * For additional metadata i.e. org settings, billing, features, handled in application layer
   */
  metadata: unknown | null
  created_at: Generated<string>
  updated_at: Generated<string>
}
export type OrganizationInvitation = {
  id: string
  organization_id: string
  email: string
  role: Generated<string>
  invited_by_id: string
  expires_at: string
  accepted_at: string | null
  rejected_at: string | null
  created_at: Generated<string>
}
export type OrganizationMember = {
  user_id: string
  organization_id: string
  /**
   * owner, admin, member (handled in application layer)
   */
  role: Generated<string>
  created_at: Generated<string>
  updated_at: Generated<string>
}
export type Session = {
  /**
   * Never send this to the frontend (except http-only cookie)
   */
  id: string
  user_id: string
  expires_at: string
  /**
   * an alternative id strictly for revoking (not validating) so it's safe to send to frontend
   */
  revoke_id: string
  active_organization_id: string | null
  /**
   * For "new device login" emails
   */
  ip_address: string | null
  /**
   * Hashed user agent string for device fingerprinting in "new device login" emails
   */
  user_agent_hash: string | null
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
  organization: Organization
  organization_invitation: OrganizationInvitation
  organization_member: OrganizationMember
  session: Session
  user: User
}
