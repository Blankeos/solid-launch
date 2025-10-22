// Doc.
//
// Carlo's Principles in Good Error Management:
// 1. Standard Practices:
//  - a. A standard error lib to define all usual error types.
//     - message - must be readable and easily put into a frontend UI.
//     - code - must conform to HTTP code semantics
//     - cause - for debugging
//  - b. A standard throwing practice using the lib. (The key is that it's pleasant to use)
//  - c. A standard error response shape.
//     - Two choices: A utility OR a centralized handler that processes (I prefer centralized handler i.e. Hono's app.onError in server.ts)
//     - This makes it easy for frontend to parse and display it. (Just make sure to follow the lib definition of 'message', 'code', and 'cause')
//     - With centralized handler, we also get the benefits of adding in:
//        - 1. The opt-in sentry monitoring
//        - 2. The logger for debugging during development
//        - 3. Then finally the standard response shape

import { HTTPException } from "hono/http-exception"

type CauseType = {
  data?: any
  error?: Error
}

export class ApiError {
  static NotFound(msg: string, cause?: CauseType) {
    return new HTTPException(404, { message: msg, cause })
  }

  static Conflict(msg: string, cause?: CauseType) {
    return new HTTPException(409, { message: msg, cause })
  }

  static BadRequest(msg: string, cause?: CauseType) {
    return new HTTPException(400, { message: msg, cause })
  }

  static InternalServerError(msg: string, cause?: CauseType) {
    return new HTTPException(500, { message: msg, cause })
  }

  static BusinessLogicError(msg: string, cause?: CauseType) {
    return new HTTPException(422, { message: msg, cause })
  }

  static Unauthorized(msg: string, cause?: CauseType) {
    return new HTTPException(401, { message: msg, cause })
  }

  static Forbidden(msg: string, cause?: CauseType) {
    return new HTTPException(403, { message: msg, cause })
  }

  static TooManyRequests(msg: string, cause?: CauseType) {
    return new HTTPException(429, { message: msg, cause })
  }
}

/** The standard type returned by the central handler. */
export type ApiErrorResponse = {
  error: {
    message: string
    code: number
    cause?: CauseType
    stack?: string
  }
}

// Usage example:
// throw ApiError.NotFound('Resource not found');
// throw ApiError.BadRequest('Invalid input');
// throw ApiError.InternalError('Server error');
// throw ApiError.BusinessLogicError('Business rule violation');
// throw ApiError.Unauthorized('Access denied');
// throw ApiError.TooManyRequests('Rate limit exceeded');
