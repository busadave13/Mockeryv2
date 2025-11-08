import { randomInt } from 'crypto'
import { FileSystemRepository } from '../repositories/FileSystemRepository'
import { ValidationError, NotFoundError } from '../errors'

export class MockService {
  private readonly repository: FileSystemRepository

  constructor(repository: FileSystemRepository) {
    this.repository = repository
  }

  parseMockIds(headerValue: string): string[] {
    if (!headerValue || headerValue.trim() === '') {
      throw new ValidationError('Mock ID header is empty', 'EMPTY_MOCK_ID')
    }

    // Split by comma and trim whitespace
    const ids = headerValue
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

    if (ids.length === 0) {
      throw new ValidationError(
        'No valid mock IDs provided',
        'NO_VALID_MOCK_IDS'
      )
    }

    return ids
  }

  selectRandomId(ids: string[]): string {
    if (ids.length === 0) {
      throw new ValidationError(
        'Cannot select from empty array',
        'EMPTY_ID_ARRAY'
      )
    }

    if (ids.length === 1) {
      return ids[0]
    }

    // Use crypto.randomInt for secure random selection
    const randomIndex = randomInt(0, ids.length)
    return ids[randomIndex]
  }

  async getMockResponse(mockIds: string[]): Promise<unknown> {
    if (!mockIds || mockIds.length === 0) {
      throw new ValidationError('No mock IDs provided', 'NO_MOCK_IDS')
    }

    // Try each mock ID until we find one that exists
    const validMocks: string[] = []
    const errors: string[] = []

    for (const mockId of mockIds) {
      try {
        const exists = await this.repository.exists(mockId)
        if (exists) {
          validMocks.push(mockId)
        } else {
          errors.push(mockId)
        }
      } catch (error) {
        // Invalid mock ID format - skip it
        errors.push(mockId)
      }
    }

    // If no valid mocks found, throw error
    if (validMocks.length === 0) {
      throw new NotFoundError(
        `No valid mocks found`,
        'NO_VALID_MOCKS',
        { attemptedIds: mockIds }
      )
    }

    // Select random mock from valid ones
    const selectedId = this.selectRandomId(validMocks)

    // Read and return the mock
    return await this.repository.readMock(selectedId)
  }
}
