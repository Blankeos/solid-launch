import type { ValidationTargets } from "hono"
import { validator as honoValidator } from "hono-openapi"
import type { ZodType } from "zod"
import { ApiError } from "./error"

/**
 * Drop-in for `hono-openapi`'s `validator` that throws `ApiError.BadRequest`
 * on validation failure instead of returning a 400 response from the hook.
 *
 * Why bother — two payoffs:
 *
 *  1. Single error envelope. Every failure (validation, auth, business logic)
 *     flows through the central `app.onError` in `server.ts` and comes out as
 *     `ApiErrorResponse`. The default validator returns a different shape and
 *     steals the response from the central handler.
 *
 *  2. Clean RPC types. The default validator's auto-response leaks a
 *     `{ success: false, ... }` branch into Hono's `InferResponseType`, so the
 *     RPC client's response type becomes a success/validation-failure union on
 *     every validated route. Throwing keeps each route single-typed.
 *
 * OpenAPI docs still generate because we delegate to `hono-openapi`'s
 * validator — only the failure path changes.
 */
export const zValidator = <Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema
) =>
  honoValidator(target, schema, (result) => {
    if (!result.success) {
      throw ApiError.BadRequest(`invalid ${target}`, { data: result.error })
    }
  })
