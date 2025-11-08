import pinoHttp from 'pino-http'
import pino from 'pino'
import { config } from '../config'

const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})

export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, error) => {
    if (res.statusCode >= 500 || error) {
      return 'error'
    }
    if (res.statusCode >= 400) {
      return 'warn'
    }
    return 'info'
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`
  },
  customErrorMessage: (req, res, error) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`
  },
})
