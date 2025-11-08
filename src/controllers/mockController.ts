import { Request, Response, NextFunction } from 'express'
import { MockService } from '../services/MockService'
import { FileSystemRepository } from '../repositories/FileSystemRepository'

// Create singleton instances
const repository = new FileSystemRepository()
const mockService = new MockService(repository)

export async function getMock(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const mockIdHeader = req.headers['x-mock-id'] as string

    // Parse mock IDs from header
    const mockIds = mockService.parseMockIds(mockIdHeader)

    // Get mock response (handles random selection if multiple IDs)
    const mockResponse = await mockService.getMockResponse(mockIds)

    // Log successful retrieval
    if (req.log) {
      req.log.info(
        {
          mockIds,
          selectedCount: mockIds.length,
        },
        'Mock retrieved successfully'
      )
    }

    // Return mock response
    res.status(200).json(mockResponse)
  } catch (error) {
    // Pass error to error handler middleware
    next(error)
  }
}
