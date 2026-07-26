import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import { CONFIG } from './config'
import { logger } from './utils/logger'
import { connectDatabase, disconnectDatabase } from './database/prisma'
import { securityHeaders, corsConfig } from './middleware/security'
import { errorHandler } from './middleware/errorHandler'
import { csrfProtection } from './middleware/csrf'
import { requestIdMiddleware, responseTimingMiddleware } from './monitoring/requestId'
import { recordRequest, recordError, recordResponseTime, setupPrismaMonitoring } from './monitoring'
import routes from './routes/index'
import { wsManager } from './websocket/WebSocketManager'
import { configureRedis } from './cache'
import { startWorker } from './jobs/worker'
import { registerAllJobs } from './jobs/handlers'
import { initializeScheduler, stopScheduler } from './jobs/scheduler'

const app = express()

async function main(): Promise<void> {
  // Connect to database (refuse to start if unavailable)
  logger.info('Connecting to database...')
  await connectDatabase()

  // Setup Prisma monitoring
  setupPrismaMonitoring()

  // Configure Redis (non-fatal if unavailable)
  await configureRedis()

  app.use(securityHeaders)
  app.use(corsConfig)
  app.use(cookieParser())
  app.use(csrfProtection)
  app.use(express.json({ limit: '10mb' }))
  app.use(requestIdMiddleware)
  app.use(responseTimingMiddleware)

  // Request monitoring
  app.use((req, res, next) => {
    recordRequest()
    const originalEnd = res.end
    res.end = function (this: Response, ...args: any[]) {
      const duration = Date.now() - req.startTime
      recordResponseTime(duration)
      if (res.statusCode >= 400) {
        recordError()
      }
      return originalEnd.apply(this, args as any)
    } as typeof res.end
    next()
  })

  app.use('/api', routes)

  app.use(errorHandler)

  const server = http.createServer(app)

  wsManager.initialize(server)

  // Register job handlers and start worker
  registerAllJobs()
  startWorker()

  // Initialize scheduled tasks
  initializeScheduler()

  server.listen(CONFIG.PORT, () => {
    logger.info(`Server running on http://localhost:${CONFIG.PORT}`)
    logger.info(`Environment: ${CONFIG.NODE_ENV}`)
    logger.info(`Version: ${CONFIG.VERSION}`)
  })

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`)

    server.close(() => {
      logger.info('HTTP server closed')
    })

    stopScheduler()
    wsManager.shutdown()
    await disconnectDatabase()

    const { redisClient } = await import('./cache/redis')
    await redisClient.shutdown()

    logger.info('Graceful shutdown complete')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  // Handle uncaught errors
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack })
    shutdown('UNCAUGHT_EXCEPTION').catch(() => process.exit(1))
  })

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', {
      error: (reason as Error).message,
      stack: (reason as Error).stack,
    })
  })
}

main().catch((err) => {
  logger.error('Failed to start server', { error: (err as Error).message })
  process.exit(1)
})

export default app
