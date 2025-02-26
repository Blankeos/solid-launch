import { db } from '@/server/db/kysely';
import { Session, User } from '../db/types';
import { generateId } from '../modules/auth/auth.utilities';

export const authDAO = {
  session: {
    createSession: async (userId: string) => {
      const sessionId = generateId();

      const session = await db
        .insertInto('Session')
        .values({
          id: sessionId,
          userId: userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
        })
        .returning(['Session.expiresAt', 'Session.id', 'Session.userId'])
        .executeTakeFirst();

      return session;
    },
    findSessionAndUserBySessionId: async (
      sessionId: string
    ): Promise<{ session?: Session; user?: User }> => {
      const result = await db
        .selectFrom('Session')
        .where('Session.id', '=', sessionId)
        .leftJoin('User', 'Session.userId', 'User.id')
        .select([
          'Session.id as session_id',
          'Session.expiresAt as session_expiresAt',
          'Session.userId as session_userId',
        ])
        .selectAll('User')
        .executeTakeFirst();

      if (!result) return { session: undefined, user: undefined };

      const { session_id, session_expiresAt, session_userId, ...joinedUser } = result;

      const session: Session = {
        id: session_id,
        expiresAt: session_expiresAt,
        userId: session_userId,
      };

      if (!joinedUser.id) {
        return { session: session, user: undefined };
      }

      const _user: User = joinedUser as unknown as User;

      return { session: session, user: _user };
    },
    validateSession: async (
      sessionId: string | null
    ): Promise<{ session?: Session; user?: User }> => {
      if (!sessionId) return { session: undefined, user: undefined };

      const { session, user } = await authDAO.session.findSessionAndUserBySessionId(sessionId);

      if (!session || !user) return { session, user };

      // Delete if expired.
      const expiresAt = new Date(session.expiresAt);
      if (Date.now() >= expiresAt.getTime()) {
        await db.deleteFrom('Session').where('Session.id', '=', sessionId).execute();
        return { session: undefined, user: undefined };
      }

      // Extend if about to expire.
      if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString();

        await db
          .updateTable('Session')
          .set({
            expiresAt: session.expiresAt,
          })
          .where('Session.id', '=', session.id)
          .execute();
      }

      return { session, user };
    },
    invalidateSession: async (sessionId: string) => {
      await db.deleteFrom('Session').where('Session.id', '=', sessionId).execute();

      return { success: true };
    },
  },
  user: {
    findByUsername: async (username: string) => {
      const user = await db
        .selectFrom('User')
        .selectAll()
        .where('User.username', '=', username)
        .executeTakeFirst();

      return user;
    },
    findByUserId: async (userId: string) => {
      const user = await db
        .selectFrom('User')
        .selectAll()
        .where('User.id', '=', userId)
        .executeTakeFirst();

      return user;
    },
    createFromUsernameAndPassword: async (username: string, passwordHash: string) => {
      const userId = generateId();

      await db
        .insertInto('User')
        .values({ id: userId, passwordHash: passwordHash, username: username })
        .execute();

      return { userId };
    },
  },
};
