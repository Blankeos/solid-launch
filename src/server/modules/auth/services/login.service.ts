import { authDAO } from '@/server/dao/auth.dao';
import { lucia } from '@/server/lucia';
import { verify } from '@node-rs/argon2';
import { TRPCError } from '@trpc/server';

type LoginParams = {
  username: string;
  password: string;
};

export async function login(params: LoginParams) {
  const { username, password } = params;

  if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid username' });
  }

  if (!password || password.length < 6 || password.length > 255) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid password' });
  }

  const existingUser = await authDAO.user.findByUsername(username);

  if (!existingUser) {
    // Lie for extra security.
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Incorrect username or password.' });
  }

  const validPassword = await verify(existingUser.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });

  if (!validPassword) {
    // Vague for extra security.
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Incorrect username or password.' });
  }

  const session = await lucia.createSession(existingUser.id, {});

  const sessionCookie = lucia.createSessionCookie(session.id);

  return {
    userId: existingUser.id,
    sessionId: session.id,
    sessionCookie: sessionCookie
  };
}
