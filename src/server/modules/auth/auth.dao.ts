import { db } from '@/server/db/kysely'
import { Session, User } from '../db/types'
import { generateId } from '../modules/auth/auth.utilities'

export class AuthDAO {
  // Sessions
  async createSession(userId: string) {
    const sessionId = generateId()

    const session = await db
      .insertInto('session')
      .values({
        id: sessionId,
        user_id: userId,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
      })
      .returning(['session.expires_at', 'session.id', 'session.user_id'])
      .executeTakeFirst()

    return session
  }

  async getSessionAndUserBySessionId(
    sessionId: string
  ): Promise<{ session?: Session; user?: User }> {
    const result = await db
      .selectFrom('session')
      .where('session.id', '=', sessionId)
      .leftJoin('user', 'session.user_id', 'user.id')
      .select([
        'session.id as session_id',
        'session.expires_at as session_expires_at',
        'session.user_id as session_user_id',
      ])
      .selectAll('user')
      .executeTakeFirst()

    if (!result) return { session: undefined, user: undefined }

    const { session_id, session_expires_at, session_user_id, ...joinedUser } = result

    const session: Session = {
      id: session_id,
      expires_at: session_expires_at,
      user_id: session_user_id,
    }

    if (!joinedUser.id) {
      return { session: session, user: undefined }
    }

    const _user: User = joinedUser as unknown as User

    return { session: session, user: _user }
  }

  async validateSession(sessionId: string | null): Promise<{ session?: Session; user?: User }> {
    if (!sessionId) return { session: undefined, user: undefined }

    const { session, user } = await this.getSessionAndUserBySessionId(sessionId)

    if (!session || !user) return { session, user }

    // Delete if expired.
    const expiresAt = new Date(session.expires_at)
    if (Date.now() >= expiresAt.getTime()) {
      await db.deleteFrom('session').where('session.id', '=', sessionId).execute()
      return { session: undefined, user: undefined }
    }

    // Extend if about to expire.
    if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()

      await db
        .updateTable('session')
        .set({
          expires_at: session.expires_at,
        })
        .where('session.id', '=', session.id)
        .execute()
    }

    return { session, user }
  }

  async invalidateSession(sessionId: string) {
    await db.deleteFrom('session').where('session.id', '=', sessionId).execute()

    return { success: true }
  }

  // User
  async getUserByUsername(username: string) {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('user.username', '=', username)
      .executeTakeFirst()

    return user
  }

  async getUserByUserId(userId: string) {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('user.id', '=', userId)
      .executeTakeFirst()

    return user
  }

  async getUserByEmail(email: string) {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('user.email', '=', email)
      .executeTakeFirst()

    return user
  }

  async createUserFromUsernameEmailAndPassword(params: {
    username: string
    passwordHash: string
    email: string
  }) {
    const userId = generateId()

    await db
      .insertInto('user')
      .values({
        id: userId,
        password_hash: params.passwordHash,
        username: params.username,
        email: params.email,
      })
      .execute()

    return { userId }
  }

  // --- Auth Strategies ---
  // - OAuth
  async createUserFromOAuth(params: {
    provider: string
    providerUserId: string
    email: string
    username?: string
  }) {
    const userId = generateId()

    const user = await db.transaction().execute(async (trx) => {
      const [newUser] = await trx
        .insertInto('user')
        .values({
          id: userId,
          username: params.username ?? params.email,
          email: params.email,
          password_hash: generateId(), // Just a random password, that's never guessable usually.
        })
        .returningAll()
        .execute()

      await trx
        .insertInto('oauth_account')
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
      .insertInto('oauth_account')
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
      .selectFrom('oauth_account')
      .selectAll()
      .where('oauth_account.provider_id', '=', provider)
      .where('oauth_account.provider_user_id', '=', providerUserId)
      .executeTakeFirst()

    return account
  }

  // - Magic Links, OTPs, Cross-Domain (OAuth Login), Forgot Password
  async createOneTimeToken(userId: string, purpose: string) {
    const token = generateId()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 2) // 2 minutes

    await db
      .insertInto('onetime_token')
      .values({
        token,
        expires_at: expiresAt.toISOString(),
        user_id: userId,
        purpose,
      })
      .execute()

    return token
  }

  async consumeOneTimeToken(token: string, purpose?: string) {
    let query = db
      .deleteFrom('onetime_token')
      .where('onetime_token.token', '=', token)
      .where('onetime_token.expires_at', '>', new Date().toISOString())

    if (purpose) {
      query = query.where('onetime_token.purpose', '=', purpose)
    }

    const [result] = await query.returningAll().execute()

    return result
  }
}
