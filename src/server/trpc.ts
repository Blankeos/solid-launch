import { initTRPC, TRPCError } from '@trpc/server';
import { getCookie } from 'hono/cookie';
import { createContext } from './context';
import { authDAO } from './dao/auth.dao';
import { Session, User } from './db/types';
import { deleteSessionTokenCookie, setSessionTokenCookie } from './modules/auth/auth.utilities';

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
  const sessionId = getCookie(opts.ctx.honoContext, 'session') ?? null;

  // 2. Validate session.
  const { user, session } = await authDAO.session.validateSession(sessionId);

  // 3. Set session
  if (session) {
    setSessionTokenCookie(opts.ctx.honoContext, session.id, session.expiresAt);
  } else {
    deleteSessionTokenCookie(opts.ctx.honoContext);
  }

  opts.ctx.user = user ?? null;
  opts.ctx.session = session ?? null;

  return opts.next();
});

/**
 * A protected procedure prevents unauthorized users from performing a procedure.
 */
export const protectedProcedure = authedProcedure.use<{ user: User; session: Session }>(
  async function isRequired(opts) {
    if (!opts.ctx.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }

    return opts.next();
  }
);
