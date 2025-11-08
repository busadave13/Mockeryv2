import { createApp } from './app'
import { config } from './config'
import { FileSystemRepository } from './repositories/FileSystemRepository'
import pino from 'pino'

const logger = pino({
  level: config.logLevel,
})

async function startServer() {
  try {
    // Validate mock repository path exists
    const repository = new FileSystemRepository()
    const isValid = await repository.validateRepository()

    if (!isValid) {
      logger.error(
        { path: config.mockRepoPath },
        'Mock repository path is invalid or not accessible'
      )
      process.exit(1)
    }

    logger.info(
      { path: config.mockRepoPath },
      'Mock repository validated successfully'
    )

    // Create and start Express app
    const app = createApp()

    const server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          nodeEnv: config.nodeEnv,
          mockRepoPath: config.mockRepoPath,
        },
        'Mockery service started'
      )
    })

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info({ signal }, 'Shutdown signal received')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error: error.message }, 'Failed to start server')
    }
    process.exit(1)
  }
}

startServer()
