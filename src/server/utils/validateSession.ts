import { lucia } from '@/server/lucia';
import { Cookie, Session, User } from 'lucia';

type ValidateSessionReturnType = {
  /**
   * This is the reliable variable to check if user is authenticated.
   *
   * - When not authenticated: `null`
   * - When Authenticated: **exists**.
   */
  session: Session | null;
  /**
   * I have not tested. But probably:
   * - When not authenticated: `null`.
   * - When session was found, but expired: **exists**.
   * - When Authenticated: **exists**.
   */
  user: User | null;
  /**
   * This **exists** in two cases:
   * - Lucia has refreshed a "nearly expired" token.
   * - Session is invalid.
   *
   * In both cases, make sure to send this to the response.
   */
  sessionCookie: Cookie | null;
};

/**
 * A utility function for easily checking if authorized.
 *
 * Can be used in the middleware or in a resolver.
 *
 * When `sessionCookie` is not null, make sure to send this to the response.
 * As Lucia prolongs "nearly expired" cookies under the hood.
 *
 * @example
 * const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
 *
 * const { user, session, sessionCookie } = await validateSession(sessionId);
 */
export async function validateSession(
  sessionId: string | null
): Promise<ValidateSessionReturnType> {
  if (!sessionId) {
    return {
      user: null,
      session: null,
      sessionCookie: null
    };
  }

  // 2. Validate session.
  const { session, user } = await lucia.validateSession(sessionId);

  // 2.1 User authenticated with a "nearly expired" (less than half until the actual expiration) of the token.
  // Lucia refreshed it under the hood. Here's the new token:
  if (session && session.fresh) {
    console.log('Lucia refreshed token');
    return {
      session: session,
      user: user,
      sessionCookie: lucia.createSessionCookie(session.id)
    };
  }

  // 2.2 Session is invalid.
  if (!session) {
    return {
      session: session,
      user: user,
      sessionCookie: lucia.createBlankSessionCookie()
    };
  }

  // 2.3 User is authenticated, no need to refresh.
  return {
    session: session,
    user: user,
    sessionCookie: null
  };
}
