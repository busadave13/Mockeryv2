import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../errors'

export function validateMockIdHeader(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const mockIdHeader = req.headers['x-mock-id']

  if (!mockIdHeader) {
    return next(
      new ValidationError('Missing X-Mock-ID header', 'MISSING_MOCK_ID')
    )
  }

  if (typeof mockIdHeader !== 'string') {
    return next(
      new ValidationError('Invalid X-Mock-ID header format', 'INVALID_MOCK_ID')
    )
  }

  // Validation passed
  next()
}
