import { promises as fs } from 'fs'
import * as path from 'path'
import { config } from '../config'
import { NotFoundError, ServerError } from '../errors'

export class FileSystemRepository {
  private readonly mockRepoPath: string

  constructor() {
    this.mockRepoPath = config.mockRepoPath
  }

  async validateRepository(): Promise<boolean> {
    try {
      await fs.access(this.mockRepoPath)
      const stats = await fs.stat(this.mockRepoPath)
      return stats.isDirectory()
    } catch (error) {
      return false
    }
  }

  async exists(mockId: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(mockId)
      await fs.access(filePath)
      return true
    } catch (error) {
      return false
    }
  }

  async readMock(mockId: string): Promise<unknown> {
    try {
      const filePath = this.getFilePath(mockId)

      // Check if file exists
      const fileExists = await this.exists(mockId)
      if (!fileExists) {
        throw new NotFoundError(`Mock not found: ${mockId}`, 'MOCK_NOT_FOUND')
      }

      // Read file content
      const fileContent = await fs.readFile(filePath, 'utf-8')

      // Check file size (reject files > 10MB)
      const stats = await fs.stat(filePath)
      const fileSizeInMB = stats.size / (1024 * 1024)
      if (fileSizeInMB > 10) {
        throw new ServerError(
          `Mock file too large: ${mockId} (${fileSizeInMB.toFixed(2)}MB)`,
          'MOCK_TOO_LARGE'
        )
      }

      // Parse JSON
      try {
        return JSON.parse(fileContent)
      } catch (parseError) {
        throw new ServerError(
          `Failed to parse mock file: ${mockId}`,
          'INVALID_MOCK_FORMAT'
        )
      }
    } catch (error) {
      // Re-throw our custom errors
      if (
        error instanceof NotFoundError ||
        error instanceof ServerError
      ) {
        throw error
      }

      // Handle unexpected errors
      throw new ServerError(
        `Error reading mock file: ${mockId}`,
        'FILE_READ_ERROR'
      )
    }
  }

  private getFilePath(mockId: string): string {
    // Validate mock ID to prevent path traversal
    this.validateMockId(mockId)
    return path.join(this.mockRepoPath, `${mockId}.json`)
  }

  private validateMockId(mockId: string): void {
    // Only allow alphanumeric characters, hyphens, and underscores
    const validMockIdRegex = /^[a-zA-Z0-9_-]+$/
    if (!validMockIdRegex.test(mockId)) {
      throw new ServerError(
        `Invalid mock ID format: ${mockId}`,
        'INVALID_MOCK_ID'
      )
    }
  }
}
