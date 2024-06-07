import { db } from '@/server/db/kysely';
import { generateIdFromEntropySize } from 'lucia';

export const authDAO = {
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
        .where('User.username', '=', userId)
        .executeTakeFirst();

      return user;
    },
    createFromUsernameAndPassword: async (username: string, passwordHash: string) => {
      const userId = generateIdFromEntropySize(10); // 16 characters long

      await db
        .insertInto('User')
        .values({ id: userId, passwordHash: passwordHash, username: username })
        .execute();

      return { userId };
    }
  }
};
