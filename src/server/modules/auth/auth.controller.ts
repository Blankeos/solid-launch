import { lucia } from '@/server/lucia';
import { authedProcedure, publicProcedure, router } from '@/server/trpc';
import { z } from 'zod';
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
      const { userId, sessionCookie } = await login({
        username: input.username,
        password: input.password,
      });

      // use `header()` instead of setCookie to avoid TS errors
      ctx.honoContext.header('Set-Cookie', sessionCookie.serialize(), {
        append: true,
      });

      return {
        user: {
          id: userId,
          username: input.username,
        },
      };
    }),
  logout: authedProcedure.query(async ({ ctx, input }) => {
    if (ctx.session) {
      await lucia.invalidateSession(ctx.session.id);
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
      const { userId, sessionCookie } = await register({
        username: input.username,
        password: input.password,
      });

      // use `header()` instead of setCookie to avoid TS errors
      ctx.honoContext.header('Set-Cookie', sessionCookie.serialize(), {
        append: true,
      });

      return {
        user: {
          id: userId,
          username: input.username,
        },
      };
    }),
});
