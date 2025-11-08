import { Request, Response, NextFunction } from 'express'
import { ValidationError, NotFoundError, ServerError } from '../errors'
import { ErrorResponse } from '../types'

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  // Default to 500 if not a custom error
  let statusCode = 500
  let code = 'INTERNAL_ERROR'
  let details: Record<string, unknown> | undefined

  // Map custom errors to appropriate status codes
  if (error instanceof ValidationError) {
    statusCode = error.statusCode
    code = error.code
  } else if (error instanceof NotFoundError) {
    statusCode = error.statusCode
    code = error.code
    details = error.details
  } else if (error instanceof ServerError) {
    statusCode = error.statusCode
    code = error.code
  }

  // Log error for debugging
  if (req.log) {
    req.log.error(
      {
        error: error.message,
        stack: error.stack,
        code,
        statusCode,
      },
      'Request error'
    )
  }

  // Send error response
  const response: ErrorResponse = {
    error: {
      message: error.message,
      code,
      ...(details && { details }),
    },
  }

  res.status(statusCode).json(response)
}
