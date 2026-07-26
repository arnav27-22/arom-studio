import { redisClient } from './redis'
import { logger } from '../utils/logger'

const DEFAULT_TTL = 300
const DASHBOARD_TTL = 60
const STATISTICS_TTL = 120
const SESSION_TTL = 28800

async function invalidateOnWrite(patterns: string[]): Promise<void> {
  for (const pattern of patterns) {
    await redisClient.delPattern(pattern)
  }
}

export { redisClient, DEFAULT_TTL, DASHBOARD_TTL, STATISTICS_TTL, SESSION_TTL, invalidateOnWrite }

export async function configureRedis(): Promise<void> {
  try {
    if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
      await redisClient.initialize()
      logger.info('Redis cache initialized')
    } else {
      logger.warn('Redis not configured - running without cache')
    }
  } catch (err) {
    logger.warn('Redis initialization failed - running without cache', {
      error: (err as Error).message,
    })
  }
}
