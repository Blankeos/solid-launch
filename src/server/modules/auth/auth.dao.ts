import { db } from "@/server/db/kysely"

import { generateId, getSimpleDeviceName } from "@/server/modules/auth/auth.utilities"
import { assertDTO } from "@/server/utils/assert-dto"
import { AUTH_CONFIG } from "./auth.config"
import {
  type InternalSessionDTO,
  type InternalUserDTO,
  type UserMetaDTO,
  userMetaDTO,
} from "./auth.dto"

export class AuthDAO {
  // Sessions
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
      ...joinedUser
    } = result

    const session: InternalSessionDTO = {
      id: session_id,
      revoke_id: session_revoke_id,
      expires_at: session_expires_at,
      user_id: session_user_id,
      ip_address: session_ip_address,
      user_agent_hash: session_user_agent_hash,
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

  // User
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

  async getUserDetails(userId: string) {
    const user = await db
      .selectFrom("user")
      .selectAll()
      .where("user.id", "=", userId)
      .executeTakeFirst()

    if (!user) return null

    const [oauthAccounts, sessions] = await Promise.all([
      db
        .selectFrom("oauth_account")
        .select(["provider_id", "provider_user_id"])
        .where("oauth_account.user_id", "=", userId)
        .execute(),
      db
        .selectFrom("session")
        .select(["id", "revoke_id", "expires_at", "ip_address", "session.user_agent_hash"])
        .where("session.user_id", "=", userId)
        .where("session.expires_at", ">", new Date().toISOString())
        .execute(),
    ])

    return {
      id: user.id,
      email: user.email,
      email_verified: Boolean(user.email_verified),
      metadata: user.metadata
        ? assertDTO(JSON.parse(user.metadata as string), userMetaDTO)
        : undefined,
      joined_at: user.joined_at,
      updated_at: user.updated_at,
      oauth_accounts: oauthAccounts.map((acc) => ({
        provider: acc.provider_id,
        provider_user_id: acc.provider_user_id,
      })),
      active_sessions: sessions.map((s) => ({
        display_id: "***" + s.id.slice(-4),
        revoke_id: s.revoke_id,
        expires_at: s.expires_at,
        ip_address: s.ip_address,
        device_name: getSimpleDeviceName(s.user_agent_hash),
      })),
    }
  }

  async updateUserProfile(params: { userId: string; metadata?: Partial<UserMetaDTO> }) {
    const updates: Partial<{ metadata: string }> = {}

    if (params.metadata !== undefined) {
      // To update a JSON field we need the old row, merge, and overwrite
      const current = await db
        .selectFrom("user")
        .select("metadata")
        .where("user.id", "=", params.userId)
        .executeTakeFirst()

      const existingMeta = current?.metadata
        ? assertDTO(JSON.parse(current.metadata as string), userMetaDTO)
        : ({} as UserMetaDTO)

      const mergedMeta: UserMetaDTO = { ...existingMeta, ...params.metadata }

      updates.metadata = JSON.stringify(mergedMeta)
    }

    await db.updateTable("user").set(updates).where("user.id", "=", params.userId).execute()

    return { success: true }
  }

  // --- Auth Strategies ---
  // - Email and Password
  async createUserFromEmailAndPassword(params: {
    email: string
    passwordHash: string
    metadata?: UserMetaDTO
  }) {
    const userId = generateId()

    const user = await db
      .insertInto("user")
      .values({
        id: userId,
        password_hash: params.passwordHash,
        email: params.email,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      })
      .returningAll()
      .executeTakeFirst()

    return user
  }

  // - OAuth
  async createUserFromOAuth(params: {
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
          password_hash: generateId(), // Just a random password, that's never guessable usually.
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

  async linkOAuthAccount(params: { userId: string; providerId: string; providerUserId: string }) {
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

  async getOAuthAccount(provider: string, providerUserId: string) {
    const account = await db
      .selectFrom("oauth_account")
      .selectAll()
      .where("oauth_account.provider_id", "=", provider)
      .where("oauth_account.provider_user_id", "=", providerUserId)
      .executeTakeFirst()

    return account
  }

  // - Magic Links, OTPs, Cross-Domain (OAuth Login), Forgot Password
  async createOneTimeToken(params: {
    userId: string
    purpose: string
    /** @defaultValue 300 (5 minutes) */
    expiresInSeconds?: number
    /** @defaultValue 'highentropy' ensures `token` uniqueness in the db. shortcode is a 6 digit token (number) so uniqueness is just based on `token+userId`. */
    tokenType?: "highentropy" | "shortcode"
  }) {
    const tokenType = params.tokenType ?? "highentropy"
    const expiresAt = new Date(Date.now() + (params.expiresInSeconds ?? 300) * 1000)

    return await db.transaction().execute(async (trx) => {
      let token: string = ""
      if (tokenType === "shortcode") {
        // Simple shortcode; uniqueness not enforced
        token = Math.floor(100000 + Math.random() * 900000).toString()
      } else {
        // High-entropy token; ensure uniqueness inside the transaction
        let isUnique = false
        while (!isUnique) {
          const candidate = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(36).padStart(2, "0"))
            .join("")

          const exists = await trx
            .selectFrom("onetime_token")
            .select("token")
            .where("onetime_token.token", "=", candidate)
            .executeTakeFirst()

          if (!exists) {
            token = candidate
            isUnique = true
          }
        }
      }

      await trx
        .insertInto("onetime_token")
        .values({
          token,
          expires_at: expiresAt.toISOString(),
          user_id: params.userId,
          purpose: params.purpose,
        })
        .execute()

      return token
    })
  }

  async consumeOneTimeToken(params: { token: string; userId?: string; purpose?: string }) {
    // Using a transaction because it works for sqlite, mariadb, and postgres. (Returning a deleted only works in postgres atm)
    return await db.transaction().execute(async (trx) => {
      // First, select the token to get user_id
      const tokenRow = await trx
        .selectFrom("onetime_token")
        .selectAll()
        .where("onetime_token.token", "=", params.token)
        .where("onetime_token.expires_at", ">", new Date().toISOString())
        .$if(!!params.userId, (qb) => qb.where("onetime_token.user_id", "=", params.userId!))
        .$if(!!params.purpose, (qb) => qb.where("onetime_token.purpose", "=", params.purpose!))
        .executeTakeFirst()

      if (!tokenRow) {
        return { consumed: false, userId: undefined }
      }

      // Delete the token
      await trx
        .deleteFrom("onetime_token")
        .where("onetime_token.token", "=", params.token)
        .execute()

      return { consumed: true, userId: tokenRow.user_id }
    })
  }

  // --- Updates ---
  async updateUserPassword(params: { userId: string; passwordHash: string }) {
    await db
      .updateTable("user")
      .set({
        password_hash: params.passwordHash,
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
      })
      .where("user.id", "=", params.userId)
      .execute()

    return { success: true }
  }
}
