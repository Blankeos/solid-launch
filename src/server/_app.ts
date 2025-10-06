import { Hono } from 'hono'
import { authController } from './modules/auth/auth.controller'
import { paymentsController } from './modules/payments/payments.controller'

export const appRouter = new Hono()
  // Extend routes here...
  .route('/auth', authController)
  .route('/payments', paymentsController)

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter
