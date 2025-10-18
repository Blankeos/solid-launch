import { Hono } from 'hono'
import { testEmailRouter } from './lib/emails/test.email'
import { authController } from './modules/auth/auth.controller'
import { paymentsController } from './modules/payments/payments.controller'

export const appRouter = new Hono()
  // Extend routes here...
  .route('/auth', authController)
  .route('/payments', paymentsController)
  .route('/testmail', testEmailRouter)

export type AppRouter = typeof appRouter
