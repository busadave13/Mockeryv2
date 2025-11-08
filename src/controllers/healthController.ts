import { Request, Response } from 'express'
import { FileSystemRepository } from '../repositories/FileSystemRepository'
import { HealthResponse } from '../types'

// Create singleton instance
const repository = new FileSystemRepository()

export async function getHealth(req: Request, res: Response) {
  try {
    // Check if mock repository is accessible
    const isAccessible = await repository.validateRepository()

    if (isAccessible) {
      const response: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        mockRepoAccessible: true,
      }

      if (req.log) {
        req.log.info('Health check passed')
      }

      res.status(200).json(response)
    } else {
      const response: HealthResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        mockRepoAccessible: false,
        message: 'Mock repository not accessible',
      }

      if (req.log) {
        req.log.warn('Health check failed: repository not accessible')
      }

      res.status(503).json(response)
    }
  } catch (error) {
    const response: HealthResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
    }

    if (req.log) {
      req.log.error({ error }, 'Health check error')
    }

    res.status(503).json(response)
  }
}
