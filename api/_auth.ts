import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET not set')
  return secret
}

function getPassword(): string {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) throw new Error('ADMIN_PASSWORD not set')
  return pw
}

const FAIL_ATTEMPTS = new Map<string, { count: number; until: number }>()

export function checkRateLimit(ip: string): boolean {
  const entry = FAIL_ATTEMPTS.get(ip)
  if (entry && entry.until > Date.now()) return false
  if (entry && entry.until <= Date.now()) FAIL_ATTEMPTS.delete(ip)
  return true
}

export function recordFailure(ip: string) {
  const entry = FAIL_ATTEMPTS.get(ip) || { count: 0, until: 0 }
  entry.count += 1
  if (entry.count >= 5) entry.until = Date.now() + 15 * 60 * 1000
  FAIL_ATTEMPTS.set(ip, entry)
}

export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

export function signToken(): string {
  return jwt.sign({ role: 'admin', iat: Math.floor(Date.now() / 1000) }, getSecret(), { expiresIn: '8h' })
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export function getCookieToken(req: VercelRequest): string | null {
  const cookies = (req.headers.cookie || '').split(';').map((c) => c.trim())
  for (const c of cookies) {
    if (c.startsWith('admin_token=')) return c.slice('admin_token='.length)
  }
  return null
}

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  const token = getCookieToken(req)
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export function logAdminEvent(event: string, detail: string, ip: string) {
  const { db } = require('./_db')
  db.append('system_logs', {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: 'admin',
    event,
    detail,
    severity: event.includes('fail') ? 'warn' : 'info',
    ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
  })
}
