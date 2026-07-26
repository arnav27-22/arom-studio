import { logger } from '../utils/logger'
import { redisClient } from '../cache/redis'

interface Job {
  id: string
  type: string
  data: unknown
  retries: number
  maxRetries: number
  scheduledAt: string
}

const QUEUE_KEY = 'job:queue'
const MAX_CONCURRENT = 5
const RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000]
const JOB_TYPES = new Map<string, (data: unknown) => Promise<void>>()

export function registerJob(type: string, handler: (data: unknown) => Promise<void>): void {
  JOB_TYPES.set(type, handler)
}

async function processJob(job: Job): Promise<void> {
  const handler = JOB_TYPES.get(job.type)
  if (!handler) {
    logger.warn('Unknown job type', { type: job.type })
    return
  }

  try {
    await handler(job.data)
    logger.debug('Job completed', { id: job.id, type: job.type })
  } catch (err) {
    if (job.retries < job.maxRetries) {
      const delay = RETRY_DELAYS[job.retries] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
      logger.warn('Job failed, will retry', {
        id: job.id,
        type: job.type,
        retry: job.retries + 1,
        delay,
        error: (err as Error).message,
      })
      const retryJob: Job = {
        ...job,
        retries: job.retries + 1,
        scheduledAt: new Date(Date.now() + delay).toISOString(),
      }
      await enqueueJob(retryJob)
    } else {
      logger.error('Job failed permanently', {
        id: job.id,
        type: job.type,
        error: (err as Error).message,
      })
    }
  }
}

async function dequeueJob(): Promise<Job | null> {
  if (redisClient.isConnected()) {
    const job = await redisClient.rpop<Job>(QUEUE_KEY)
    return job
  }
  return null
}

export async function enqueueJob(job: Job): Promise<void> {
  if (redisClient.isConnected()) {
    await redisClient.lpush(QUEUE_KEY, job)
  }
}

export async function enqueue(type: string, data: unknown, maxRetries = 3): Promise<void> {
  const job: Job = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    data,
    retries: 0,
    maxRetries,
    scheduledAt: new Date().toISOString(),
  }
  await enqueueJob(job)
}

function processQueue(): void {
  let processing = 0

  const tick = async () => {
    if (processing >= MAX_CONCURRENT) return

    processing++
    try {
      const job = await dequeueJob()
      if (job) {
        if (new Date(job.scheduledAt) <= new Date()) {
          await processJob(job)
        } else {
          await enqueueJob(job)
        }
      }
    } catch (err) {
      logger.error('Queue processing error', { error: (err as Error).message })
    } finally {
      processing--
    }
  }

  setInterval(tick, 200)
}

let running = false

export function startWorker(): void {
  if (running) return
  running = true
  logger.info('Background worker started')
  processQueue()
}

export function stopWorker(): void {
  running = false
  logger.info('Background worker stopped')
}
