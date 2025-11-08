import { config as dotenvConfig } from 'dotenv'
import { Config } from '../types'

// Load environment variables from .env file
dotenvConfig()

function validateConfig(): Config {
  const mockRepoPath = process.env.MOCK_REPO_PATH

  if (!mockRepoPath) {
    throw new Error(
      'MOCK_REPO_PATH environment variable is required but not set'
    )
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    mockRepoPath,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  }
}

export const config = validateConfig()
