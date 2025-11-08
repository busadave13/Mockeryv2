import { Request } from 'express'

export interface Config {
  port: number
  mockRepoPath: string
  nodeEnv: string
  logLevel: string
}

export interface MockRequest extends Request {
  mockIds?: string[]
}

export interface ErrorResponse {
  error: {
    message: string
    code: string
    details?: Record<string, unknown>
  }
}

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  mockRepoAccessible?: boolean
  message?: string
}
