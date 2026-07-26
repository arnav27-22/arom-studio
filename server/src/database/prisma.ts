import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { logger } from '../utils/logger'

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
})

pool.on('error', (err) => {
  logger.error('Unexpected pool error', { error: err.message })
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

;(prisma as any).$on('error', (e: any) => {
  logger.error('Prisma error', { message: e.message, target: e.target })
})

;(prisma as any).$on('warn', (e: any) => {
  logger.warn('Prisma warning', { message: e.message, target: e.target })
})

export async function connectDatabase(): Promise<void> {
  let lastError: Error | null = null

  for (const delay of [...RECONNECT_DELAYS, 0]) {
    try {
      await prisma.$connect()
      logger.info('Database connected')
      return
    } catch (err) {
      lastError = err as Error
      if (delay > 0) {
        logger.warn(`Database connection failed, retrying in ${delay}ms`, {
          error: (err as Error).message,
        })
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  logger.error('Failed to connect to database after all retries')
  throw lastError || new Error('Database connection failed')
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  await pool.end()
  logger.info('Database disconnected')
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  latency: number
  poolStatus: { totalCount: number; idleCount: number; waitingCount: number }
}> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    return {
      connected: true,
      latency,
      poolStatus: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      },
    }
  } catch {
    return {
      connected: false,
      latency: Date.now() - start,
      poolStatus: { totalCount: 0, idleCount: 0, waitingCount: 0 },
    }
  }
}

export default prisma
