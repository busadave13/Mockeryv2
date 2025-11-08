import express, { Application } from 'express'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler } from './middleware/errorHandler'
import mockRoutes from './routes/mockRoutes'
import healthRoutes from './routes/healthRoutes'

export function createApp(): Application {
  const app = express()

  // Middleware
  app.use(requestLogger)
  app.use(express.json())

  // Routes
  app.use('/api', mockRoutes)
  app.use(healthRoutes)

  // Error handler (must be last)
  app.use(errorHandler)

  return app
}
