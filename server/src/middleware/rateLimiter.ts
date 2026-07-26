import { Request, Response, NextFunction } from 'express'
import { CONFIG } from '../config'
import { redisClient } from '../cache/redis'

const localAttempts = new Map<string, { count: number; until: number }>()

type Tier = 'anonymous' | 'authenticated' | 'admin'

const TIER_LIMITS: Record<Tier, { window: number; max: number }> = {
  anonymous: { window: CONFIG.RATE_LIMIT_WINDOW, max: 30 },
  authenticated: { window: CONFIG.RATE_LIMIT_WINDOW, max: CONFIG.RATE_LIMIT_MAX },
  admin: { window: CONFIG.RATE_LIMIT_WINDOW, max: 500 },
}

function getTier(req: Request): Tier {
  if (req.admin?.role) return 'admin'
  if (req.admin) return 'authenticated'
  return 'anonymous'
}

function getKey(ip: string, tier: Tier, endpoint: string): string {
  return `ratelimit:${ip}:${tier}:${endpoint}`
}

export async function rateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const endpoint = req.path
  const tier = getTier(req)
  const { window, max } = TIER_LIMITS[tier]
  const key = getKey(ip, tier, endpoint)

  if (redisClient.isConnected()) {
    const count = await redisClient.incr(key)
    if (count === 1) {
      await redisClient.expire(key, Math.ceil(window / 1000))
    }
    if (count > max) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(window / 1000),
        limit: max,
        remaining: 0,
      })
      return
    }
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count))
    next()
    return
  }

  const entry = localAttempts.get(key)
  const now = Date.now()

  if (entry && entry.until > now) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((entry.until - now) / 1000),
    })
    return
  }

  if (entry && entry.until <= now) {
    localAttempts.delete(key)
  }

  const newEntry = localAttempts.get(key) || { count: 0, until: now + window }
  newEntry.count++
  localAttempts.set(key, newEntry)

  if (newEntry.count > max) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(window / 1000),
    })
    return
  }

  next()
}

export async function strictRateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const key = `ratelimit:strict:${ip}:${req.path}`

  if (redisClient.isConnected()) {
    const count = await redisClient.incr(key)
    if (count === 1) {
      await redisClient.expire(key, 60)
    }
    if (count > 10) {
      res.status(429).json({ error: 'Too many requests. Please slow down.' })
      return
    }
    next()
    return
  }

  const entry = localAttempts.get(key)
  const now = Date.now()

  if (entry && entry.until > now) {
    res.status(429).json({ error: 'Too many requests. Please slow down.' })
    return
  }

  if (entry && entry.until <= now) {
    localAttempts.delete(key)
  }

  const newEntry = localAttempts.get(key) || { count: 0, until: now + 60000 }
  newEntry.count++
  localAttempts.set(key, newEntry)

  if (newEntry.count > 10) {
    res.status(429).json({ error: 'Too many requests. Please slow down.' })
    return
  }

  next()
}

export async function loginRateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const key = `ratelimit:login:${ip}`

  if (redisClient.isConnected()) {
    const count = await redisClient.incr(key)
    if (count === 1) {
      await redisClient.expire(key, 900)
    }
    if (count > CONFIG.LOGIN_RATE_LIMIT_MAX) {
      res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' })
      return
    }
    next()
    return
  }

  const entry = localAttempts.get(key)
  const now = Date.now()

  if (entry && entry.until > now) {
    res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' })
    return
  }

  if (entry && entry.until <= now) {
    localAttempts.delete(key)
  }

  const newEntry = localAttempts.get(key) || { count: 0, until: now + 900000 }
  newEntry.count++
  localAttempts.set(key, newEntry)

  if (newEntry.count > CONFIG.LOGIN_RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' })
    return
  }

  next()
}
