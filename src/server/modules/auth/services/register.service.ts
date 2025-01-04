import { authDAO } from '@/server/dao/auth.dao';
import { hash } from '@node-rs/argon2';
import { TRPCError } from '@trpc/server';

type RegisterParams = {
  username: string;
  password: string;
};

export async function register(params: RegisterParams) {
  const { username, password } = params;

  if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid username' });
  }

  if (!password || password.length < 6 || password.length > 255) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' });
  }

  const existingUsername = await authDAO.user.findByUsername(username);

  if (existingUsername) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Username ${username} already exists.`,
    });
  }

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const { userId } = await authDAO.user.createFromUsernameAndPassword(username, passwordHash);

  const session = await authDAO.session.createSession(userId);
  if (!session) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong, no session was created. Try refreshing or logging in again.',
    });
  }

  return {
    userId,
    session,
  };
}
