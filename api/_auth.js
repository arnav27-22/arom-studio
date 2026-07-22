import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { db } from './_db.js'

function getSecret() {
  return process.env.ADMIN_JWT_SECRET || ''
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || ''
}

const FAIL_ATTEMPTS = new Map()

export function checkRateLimit(ip) {
  const entry = FAIL_ATTEMPTS.get(ip)
  if (entry && entry.until > Date.now()) return false
  if (entry && entry.until <= Date.now()) FAIL_ATTEMPTS.delete(ip)
  return true
}

export function recordFailure(ip) {
  const entry = FAIL_ATTEMPTS.get(ip) || { count: 0, until: 0 }
  entry.count += 1
  if (entry.count >= 5) entry.until = Date.now() + 15 * 60 * 1000
  FAIL_ATTEMPTS.set(ip, entry)
}

export function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

export function signToken() {
  const secret = getSecret()
  if (!secret) return null
  return jwt.sign({ role: 'admin', iat: Math.floor(Date.now() / 1000) }, secret, { expiresIn: '8h' })
}

export function verifyToken(token) {
  const secret = getSecret()
  if (!secret) return false
  try {
    jwt.verify(token, secret)
    return true
  } catch {
    return false
  }
}

export function getCookieToken(req) {
  const cookies = (req.headers.cookie || '').split(';').map((c) => c.trim())
  for (const c of cookies) {
    if (c.startsWith('admin_token=')) return c.slice('admin_token='.length)
  }
  return null
}

export function requireAuth(req, res) {
  if (!process.env.ADMIN_JWT_SECRET) {
    res.json({ authenticated: false, error: 'Admin not configured' })
    return false
  }
  const token = getCookieToken(req)
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export function logAdminEvent(event, detail, ip) {
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
