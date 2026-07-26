import Redis from 'ioredis'
import { CONFIG } from '../config'
import { logger } from '../utils/logger'

const RECONNECT_DELAYS = [500, 1000, 2000, 4000, 8000]

class RedisClient {
  private client: Redis | null = null
  private subscriber: Redis | null = null
  private connected = false

  async initialize(): Promise<void> {
    let lastError: Error | null = null

    for (const delay of [...RECONNECT_DELAYS, 0]) {
      try {
        this.client = new Redis(CONFIG.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 200, 5000),
          lazyConnect: true,
          enableReadyCheck: true,
          keepAlive: 10000,
        })

        this.subscriber = this.client.duplicate()

        await this.client.connect()
        await this.subscriber.connect()

        this.client.on('error', (err) => {
          logger.error('Redis client error', { error: err.message })
        })

        this.client.on('ready', () => {
          this.connected = true
          logger.info('Redis connected')
        })

        this.client.on('close', () => {
          this.connected = false
        })

        this.connected = true
        return
      } catch (err) {
        lastError = err as Error
        if (delay > 0) {
          logger.warn(`Redis connection failed, retrying in ${delay}ms`, {
            error: (err as Error).message,
          })
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    logger.error('Failed to connect to Redis after all retries')
    throw lastError || new Error('Redis connection failed')
  }

  isConnected(): boolean {
    return this.connected && this.client?.status === 'ready'
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.client) return null
    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.client) return
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (err) {
      logger.error('Redis set error', { key, error: (err as Error).message })
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return
    try {
      await this.client.del(key)
    } catch {
      // silently ignore
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.client) return
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
    } catch {
      // silently ignore
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch {
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.client) return -2
    try {
      return await this.client.ttl(key)
    } catch {
      return -2
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 0
    try {
      return await this.client.incr(key)
    } catch {
      return 0
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.client) return
    try {
      await this.client.expire(key, seconds)
    } catch {
      // silently ignore
    }
  }

  async lpush(key: string, value: unknown): Promise<void> {
    if (!this.client) return
    try {
      await this.client.lpush(key, JSON.stringify(value))
    } catch {
      // silently ignore
    }
  }

  async rpop<T = unknown>(key: string): Promise<T | null> {
    if (!this.client) return null
    try {
      const value = await this.client.rpop(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  async llen(key: string): Promise<number> {
    if (!this.client) return 0
    try {
      return await this.client.llen(key)
    } catch {
      return 0
    }
  }

  async lrange<T = unknown>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.client) return []
    try {
      const values = await this.client.lrange(key, start, stop)
      return values.map((v) => JSON.parse(v))
    } catch {
      return []
    }
  }

  async publish(channel: string, message: unknown): Promise<void> {
    if (!this.client) return
    try {
      await this.client.publish(channel, JSON.stringify(message))
    } catch {
      // silently ignore
    }
  }

  async subscribe(
    channel: string,
    handler: (message: unknown) => void
  ): Promise<void> {
    if (!this.subscriber) return
    try {
      await this.subscriber.subscribe(channel)
      this.subscriber.on('message', (_ch, msg) => {
        if (_ch === channel) {
          try {
            handler(JSON.parse(msg))
          } catch {
            handler(msg)
          }
        }
      })
    } catch {
      // silently ignore
    }
  }

  async shutdown(): Promise<void> {
    this.connected = false
    if (this.subscriber) {
      this.subscriber.disconnect()
    }
    if (this.client) {
      await this.client.quit()
    }
    logger.info('Redis disconnected')
  }

  async getConnectionInfo(): Promise<{
    connected: boolean
    latency: number
    memory: string
    uptime: number
  }> {
    if (!this.client || !this.connected) {
      return { connected: false, latency: 0, memory: '0', uptime: 0 }
    }
    const start = Date.now()
    try {
      await this.client.ping()
      const latency = Date.now() - start
      const info = await this.client.info('memory')
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
      const uptime = parseInt((await this.client.info('server')).match(/uptime_in_seconds:(\d+)/)?.[1] || '0', 10)
      return {
        connected: true,
        latency,
        memory: memoryMatch?.[1]?.trim() || '0',
        uptime,
      }
    } catch {
      return { connected: false, latency: Date.now() - start, memory: '0', uptime: 0 }
    }
  }
}

export const redisClient = new RedisClient()
export default redisClient
