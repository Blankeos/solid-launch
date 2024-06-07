import { initTRPC, TRPCError } from '@trpc/server';
import { getCookie } from 'hono/cookie';
import { createContext } from './context';
import { lucia } from './lucia';
import { validateSession } from './utils/validateSession';

// ===========================================================================
// Basic TRPC Setup
// ===========================================================================

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createContext>().create();

// ===========================================================================
// Exports (routers and procedures)
// ===========================================================================

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;

export const mergeRouters = t.mergeRouters;

/**
 * A public procedure does not authentication.
 */
export const publicProcedure = t.procedure;

/**
 * An authed procedure supplies user and session in the context.
 */
export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  // 1. Check cookie.session.
  const sessionId = getCookie(opts.ctx.honoContext, lucia.sessionCookieName) ?? null;

  // 2. Validate session. (This is what I personally think Lucia's validateSession should be doing).
  const { user, session, sessionCookie } = await validateSession(sessionId);

  // use `header()` instead of setCookie to avoid TS errors
  if (sessionCookie) {
    opts.ctx.honoContext.header('Set-Cookie', sessionCookie.serialize(), {
      append: true
    });
  }

  opts.ctx.user = user;
  opts.ctx.session = session;

  return opts.next();
});

/**
 * A protected procedure prevents unauthorized users from performing a procedure.
 */
export const protectedProcedure = authedProcedure.use(async function isRequired(opts) {
  if (!opts.ctx.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    });
  }

  return opts.next();
});
