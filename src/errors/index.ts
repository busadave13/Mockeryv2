export class ValidationError extends Error {
  public readonly statusCode: number = 400
  public readonly code: string

  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message)
    this.name = 'ValidationError'
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends Error {
  public readonly statusCode: number = 404
  public readonly code: string
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    code: string = 'NOT_FOUND',
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'NotFoundError'
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ServerError extends Error {
  public readonly statusCode: number = 500
  public readonly code: string

  constructor(message: string, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'ServerError'
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}
