/**
 * This a minimal tRPC server
 */
import { authRouter } from './modules/auth/auth.controller.js';
import { router } from './trpc.js';

export const appRouter = router({
  auth: authRouter,
  // Extend other routers here.
});

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter;
