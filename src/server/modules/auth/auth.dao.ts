import { db } from "@/server/db/kysely"

import {
  generateId,
  generateUniqueCode,
  generateUniqueToken,
  getSimpleDeviceName,
  hashPassword,
  jsonDecode,
} from "@/server/modules/auth/auth.utilities"
import { assertDTO } from "@/server/utils/assert-dto"
import { AUTH_CONFIG } from "./auth.config"
import {
  getUserResponseMetaDTO,
  type InternalSessionDTO,
  type InternalUserDTO,
  type UserMetaDTO,
  userMetaDTO,
} from "./auth.dto"

export class AuthDAO {
  // 👉 Sessions
  async createSession(userId: string) {
    const sessionId = generateId()
    const revokeId = generateId()

    const session = await db
      .insertInto("session")
      .values({
        id: sessionId,
        revoke_id: revokeId,
        user_id: userId,
        expires_at: new Date(
          Date.now() + AUTH_CONFIG.session.expiresInDays * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .returningAll()
      .executeTakeFirst()

    return session
  }

  async getSessionAndUserBySessionId(
    sessionId: string
  ): Promise<{ session?: InternalSessionDTO; user?: InternalUserDTO }> {
    const result = await db
      .selectFrom("session")
      .where("session.id", "=", sessionId)
      .leftJoin("user", "session.user_id", "user.id")
      .select([
        "session.id as session_id",
        "revoke_id as session_revoke_id",
        "session.expires_at as session_expires_at",
        "session.user_id as session_user_id",
        "session.ip_address as session_ip_address",
        "session.user_agent_hash as session_user_agent_hash",
        "active_organization_id as session_active_organization_id",
      ])
      .selectAll("user")
      .executeTakeFirst()

    if (!result) return { session: undefined, user: undefined }

    const {
      session_id,
      session_expires_at,
      session_user_id,
      session_revoke_id,
      session_ip_address,
      session_user_agent_hash,
      session_active_organization_id,
      ...joinedUser
    } = result

    const session: InternalSessionDTO = {
      id: session_id,
      revoke_id: session_revoke_id,
      expires_at: session_expires_at,
      user_id: session_user_id,
      ip_address: session_ip_address,
      user_agent_hash: session_user_agent_hash,
      active_organization_id: session_active_organization_id,
    }

    if (!joinedUser.id) {
      return { session: session, user: undefined }
    }

    const _user: InternalUserDTO = joinedUser as unknown as InternalUserDTO

    return { session: session, user: _user }
  }

  async validateSession(
    sessionId: string | null
  ): Promise<{ session?: InternalSessionDTO; user?: InternalUserDTO }> {
    if (!sessionId) return { session: undefined, user: undefined }

    const { session, user } = await this.getSessionAndUserBySessionId(sessionId)

    if (!session || !user) return { session, user }

    // Delete if expired.
    const expiresAt = new Date(session.expires_at)
    if (Date.now() >= expiresAt.getTime()) {
      await db.deleteFrom("session").where("session.id", "=", sessionId).execute()
      return { session: undefined, user: undefined }
    }

    // Extend if about to expire
    if (
      Date.now() >=
      expiresAt.getTime() - 1000 * 60 * 60 * 24 * AUTH_CONFIG.session.renewWithinDays
    ) {
      session.expires_at = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * AUTH_CONFIG.session.expiresInDays
      ).toISOString()

      await db
        .updateTable("session")
        .set({
          expires_at: session.expires_at,
        })
        .where("session.id", "=", session.id)
        .execute()
    }

    return { session, user }
  }

  async invalidateSession(sessionId: string) {
    const result = await db
      .deleteFrom("session")
      .where("session.id", "=", sessionId)
      .executeTakeFirst()

    if (Number(result.numDeletedRows) === 0) {
      return { success: false }
    }

    return { success: true }
  }

  async invalidateAllSessionsByUser(userId: string) {
    await db.deleteFrom("session").where("session.user_id", "=", userId).execute()

    return { success: true }
  }

  async revokeSessionByRevokeId(params: { revokeId: string; userId: string }) {
    const result = await db
      .deleteFrom("session")
      .where("session.revoke_id", "=", params.revokeId)
      .where("session.user_id", "=", params.userId)
      .executeTakeFirst()

    if (Number(result.numDeletedRows) === 0) {
      return { success: false }
    }

    return { success: true }
  }

  async updateSessionIP(params: { sessionId: string; ipAddress: string | null }) {
    await db
      .updateTable("session")
      .set({
        ip_address: params.ipAddress,
      })
      .where("session.id", "=", params.sessionId)
      .execute()

    return { success: true }
  }

  async updateSessionUserAgent(params: { sessionId: string; userAgentHash: string | null }) {
    await db
      .updateTable("session")
      .set({
        user_agent_hash: params.userAgentHash,
      })
      .where("session.id", "=", params.sessionId)
      .execute()

    return { success: true }
  }

  async updateActiveOrganization(params: {
    sessionId: string
    newActiveOrganizationId: string | null
  }) {
    await db
      .updateTable("session")
      .set({
        active_organization_id: params.newActiveOrganizationId,
      })
      .where("session.id", "=", params.sessionId)
      .execute()

    return { success: true }
  }

  // 👉 User
  async getUserByUserId(userId: string) {
    const user = await db
      .selectFrom("user")
      .selectAll()
      .where("user.id", "=", userId)
      .executeTakeFirst()

    return user
  }

  async getUserByEmail(email: string) {
    const user = await db
      .selectFrom("user")
      .selectAll()
      .where("user.email", "=", email)
      .executeTakeFirst()

    return user
  }

  async getUserDetails(params: { userId: string; currentSessionId?: string }) {
    const user = await db
      .selectFrom("user")
      .selectAll()
      .where("user.id", "=", params.userId)
      .executeTakeFirst()

    if (!user) return null

    const [oauthAccounts, sessions] = await Promise.all([
      db
        .selectFrom("oauth_account")
        .select(["provider_id", "provider_user_id"])
        .where("oauth_account.user_id", "=", params.userId)
        .execute(),
      db
        .selectFrom("session")
        .select(["id", "revoke_id", "expires_at", "ip_address", "session.user_agent_hash"])
        .where("session.user_id", "=", params.userId)
        .where("session.expires_at", ">", new Date().toISOString())
        .execute(),
    ])

    const metadata = user.metadata
      ? assertDTO(jsonDecode(user.metadata as string), userMetaDTO)
      : undefined

    return {
      id: user.id,
      email: user.email,
      email_verified: Boolean(user.email_verified),
      metadata: await getUserResponseMetaDTO(metadata),
      joined_at: user.joined_at,
      updated_at: user.updated_at,
      oauth_accounts: oauthAccounts.map((acc) => ({
        provider: acc.provider_id,
        provider_user_id: acc.provider_user_id,
      })),
      active_sessions: sessions.map((s) => ({
        display_id: `***${s.id.slice(-4)}`,
        revoke_id: s.revoke_id,
        expires_at: s.expires_at,
        ip_address: s.ip_address,
        device_name: getSimpleDeviceName(s.user_agent_hash),
        is_current: params.currentSessionId ? s.id === params.currentSessionId : false,
      })),
    }
  }

  async updateUserMetadata(params: { userId: string; metadata?: Partial<UserMetaDTO> }) {
    const updates: Partial<{ metadata: string; updated_at: string }> = {
      updated_at: new Date().toISOString(),
    }

    if (params.metadata !== undefined) {
      // To update a JSON field we need the old row, merge, and overwrite
      const current = await db
        .selectFrom("user")
        .select("metadata")
        .where("user.id", "=", params.userId)
        .executeTakeFirst()

      const existingMeta = current?.metadata
        ? assertDTO(jsonDecode(current.metadata as string), userMetaDTO)
        : ({} as UserMetaDTO)

      const mergedMeta: UserMetaDTO = { ...existingMeta, ...params.metadata }

      updates.metadata = JSON.stringify(mergedMeta)
    }

    await db.updateTable("user").set(updates).where("user.id", "=", params.userId).execute()

    return { success: true }
  }

  // --- Auth Strategies ---
  // 👉 Email and Password
  async createUserFromEmailAndPassword(params: {
    email: string
    password: string
    metadata?: UserMetaDTO
  }) {
    const userId = generateId()

    const user = await db
      .insertInto("user")
      .values({
        id: userId,
        password_hash: await hashPassword(params.password),
        email: params.email,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      })
      .returningAll()
      .executeTakeFirst()

    return user
  }

  async updateUserPassword(params: { userId: string; password: string }) {
    await db
      .updateTable("user")
      .set({
        password_hash: await hashPassword(params.password),
        updated_at: new Date().toISOString(),
      })
      .where("user.id", "=", params.userId)
      .execute()

    return { success: true }
  }

  async updateUserVerifiedEmail(params: { userId: string }) {
    await db
      .updateTable("user")
      .set({
        email_verified: 1,
        updated_at: new Date().toISOString(),
      })
      .where("user.id", "=", params.userId)
      .execute()

    return { success: true }
  }

  // 👉 OAuth
  private async createUserFromOAuth(params: {
    provider: string
    providerUserId: string
    email: string
    metadata?: UserMetaDTO
  }) {
    const userId = generateId()

    const user = await db.transaction().execute(async (trx) => {
      const [newUser] = await trx
        .insertInto("user")
        .values({
          id: userId,
          email: params.email,
          email_verified: 1, // oAuth users are always really verified
          password_hash: await hashPassword(generateId()), // Just a random password, that's never guessable usually.
          metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
        })
        .returningAll()
        .execute()

      await trx
        .insertInto("oauth_account")
        .values({
          provider_id: params.provider,
          provider_user_id: params.providerUserId,
          user_id: userId,
        })
        .execute()

      return newUser
    })

    return user
  }

  private async linkOAuthAccount(params: {
    userId: string
    providerId: string
    providerUserId: string
  }) {
    await db
      .insertInto("oauth_account")
      .values({
        provider_id: params.providerId,
        provider_user_id: params.providerUserId,
        user_id: params.userId,
      })
      .execute()

    return { success: true }
  }

  private async getOAuthAccount(provider: string, providerUserId: string) {
    const account = await db
      .selectFrom("oauth_account")
      .selectAll()
      .where("oauth_account.provider_id", "=", provider)
      .where("oauth_account.provider_user_id", "=", providerUserId)
      .executeTakeFirst()

    return account
  }

  async getOrCreateUserIdForOAuth(params: {
    provider: string
    providerUserId: string
    email: string
    metadata?: UserMetaDTO
  }): Promise<string> {
    const existingAccount = await this.getOAuthAccount(params.provider, params.providerUserId)

    if (existingAccount) {
      return existingAccount.user_id
    }

    const existingUserWithEmail = await this.getUserByEmail(params.email)

    if (existingUserWithEmail) {
      await this.linkOAuthAccount({
        providerId: params.provider,
        providerUserId: params.providerUserId,
        userId: existingUserWithEmail.id,
      })

      return existingUserWithEmail.id
    }

    const newUser = await this.createUserFromOAuth({
      provider: params.provider,
      email: params.email,
      providerUserId: params.providerUserId,
      metadata: params.metadata,
    })

    return newUser.id
  }

  // 👉 OTTs: Email & Password (Forgot and Verify), OAuth (Cross-Domains OTT), OTT Login (Magic Link, OTP)
  // REFACTOR: big problem w/ this... Once you getOrCreate for the first time... The user can't create a user w/ email-pass instead.
  // alternative approach in my head is to: just use onetimetoken to pass the `email` then getOrCreate the user later. That means onetimetoken's user.id is optional.
  async getOrCreateUserFromEmail(email: string, metadata?: UserMetaDTO) {
    const existingUser = await this.getUserByEmail(email)
    if (existingUser) return existingUser

    const userId = generateId()
    const user = await db
      .insertInto("user")
      .values({
        id: userId,
        email,
        email_verified: 0,
        password_hash: await hashPassword(generateId()), // random placeholder
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      })
      .returningAll()
      .executeTakeFirst()

    return user
  }

  async getOneTimeToken(token: string) {
    const tokenRow = await db
      .selectFrom("onetime_token")
      .selectAll()
      .where("onetime_token.token", "=", token)
      .executeTakeFirst()

    return tokenRow
  }

  async createOneTimeToken(params: {
    /** Alternatively use a specific custom token. @defaultValue generateUniqueToken() */
    token?: string
    identifier: string
    purpose: string
    /** @defaultValue 300 (5 minutes) */
    expiresInSeconds?: number
    /** @defaultValue 'highentropy' uses secure token, 'shortcode' generates 6-digit code */
    tokenType?: "token" | "shortcode"
    metadata?: Record<string, any>
  }) {
    const expiresAt = new Date(Date.now() + (params.expiresInSeconds ?? 300) * 1000)

    const token = params?.token ?? generateUniqueToken()

    let code: string | undefined
    if (params.tokenType === "shortcode") {
      code = generateUniqueCode()
    }

    const result = await db
      .insertInto("onetime_token")
      .values({
        token,
        code,
        expires_at: expiresAt.toISOString(),
        identifier: params.identifier,
        purpose: params.purpose,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      })
      .returning(["token", "code"])
      .executeTakeFirst()

    if (!result) {
      throw new Error("Failed to create one-time token")
    }

    return result.code ?? result.token
  }

  async consumeOneTimeToken(params: {
    token?: string
    code?: string
    identifier?: string
    purpose?: string
  }) {
    if (!params.token && !params.code) {
      return { consumed: false, identifier: undefined, metadata: undefined }
    }

    return await db.transaction().execute(async (trx) => {
      // Build query based on token or code
      let query = trx
        .selectFrom("onetime_token")
        .selectAll()
        .where("onetime_token.expires_at", ">", new Date().toISOString())

      if (params.token) {
        query = query.where("onetime_token.token", "=", params.token)
      } else if (params.code && params.identifier) {
        query = query
          .where("onetime_token.code", "=", params.code)
          .where("onetime_token.identifier", "=", params.identifier)
      } else {
        return { consumed: false, identifier: undefined, metadata: undefined }
      }

      // If the token is not used for its purpose, make sure to not allow consumption.
      if (params.purpose) {
        query = query.where("onetime_token.purpose", "=", params.purpose)
      }

      const tokenRow = await query.executeTakeFirst()

      if (!tokenRow) {
        return { consumed: false, identifier: undefined, metadata: undefined }
      }

      // Delete the token
      await trx
        .deleteFrom("onetime_token")
        .where("onetime_token.token", "=", tokenRow.token)
        .execute()

      return { consumed: true, identifier: tokenRow.identifier, metadata: tokenRow.metadata }
    })
  }
}
