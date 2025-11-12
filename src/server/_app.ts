import { Hono } from "hono"
import { testEmailRouter } from "./lib/emails/test.email"
import { authController } from "./modules/auth/auth.controller"
import { organizationController } from "./modules/organization/organization.controller"
import { paymentsController } from "./modules/payments/payments.controller"

export const appRouter = new Hono()
  // Extend routes here...
  .route("/auth", authController)
  .route("/auth/organizations", organizationController)
  .route("/payments", paymentsController)
  .route("/testmail", testEmailRouter)

export type AppRouter = typeof appRouter

// Other files you want to include in dts bundle
import type { ApiErrorResponse } from "./lib/error"
import type { UserResponseDTO } from "./modules/auth/auth.dto"
export type { ApiErrorResponse, UserResponseDTO }
