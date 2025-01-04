import { authDAO } from '@/server/dao/auth.dao';
import { authedProcedure, publicProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import { setSessionTokenCookie } from './auth.utilities';
import { login } from './services/login.service';
import { register } from './services/register.service';

export const authRouter = router({
  currentUser: authedProcedure.query(async ({ ctx }) => {
    return {
      user: ctx.user,
      session: ctx.session,
    };
  }),
  login: authedProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, session } = await login({
        username: input.username,
        password: input.password,
      });

      setSessionTokenCookie(ctx.honoContext, session.id, session.expiresAt);

      return {
        user: {
          id: userId,
          username: input.username,
        },
      };
    }),
  logout: authedProcedure.query(async ({ ctx }) => {
    if (ctx.session) {
      await authDAO.session.invalidateSession(ctx.session.id);
    }

    return {
      success: true,
    };
  }),
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, session } = await register({
        username: input.username,
        password: input.password,
      });

      setSessionTokenCookie(ctx.honoContext, session.id, session.expiresAt);

      return {
        user: {
          id: userId,
          username: input.username,
        },
      };
    }),
});
