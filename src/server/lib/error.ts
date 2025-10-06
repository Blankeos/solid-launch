import { HTTPException } from 'hono/http-exception'

export class ApiError {
  static NotFound(msg: string, cause?: Error) {
    return new HTTPException(404, { message: msg, cause })
  }

  static Conflict(msg: string, cause?: Error) {
    return new HTTPException(409, { message: msg, cause })
  }

  static BadRequest(msg: string, cause?: Error) {
    return new HTTPException(400, { message: msg, cause })
  }

  static InternalServerError(msg: string, cause?: Error) {
    return new HTTPException(500, { message: msg, cause })
  }

  static BusinessLogicError(msg: string, cause?: Error) {
    return new HTTPException(422, { message: msg, cause })
  }

  static Unauthorized(msg: string, cause?: Error) {
    return new HTTPException(401, { message: msg, cause })
  }
}

// Usage example:
// throw ApiError.NotFound('Resource not found');
// throw ApiError.BadRequest('Invalid input');
// throw ApiError.InternalError('Server error');
// throw ApiError.BusinessLogicError('Business rule violation');
// throw ApiError.Unauthorized('Access denied');
