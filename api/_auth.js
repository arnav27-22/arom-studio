import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { insertRow } from './_db.js'

export function getSecret() {
  if (!process.env.ADMIN_JWT_SECRET) return null
  return process.env.ADMIN_JWT_SECRET
}

export function getPassword() {
  if (!process.env.ADMIN_PASSWORD) return null
  return process.env.ADMIN_PASSWORD
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
  const bufA = Buffer.from(a || '')
  const bufB = Buffer.from(b || '')
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

export function verifyAdminPassword(input) {
  const expected = getPassword()
  if (!expected) return false
  return timingSafeEqual(input || '', expected)
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
  const token = getCookieToken(req)
  if (!token || !verifyToken(token)) {
    try { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Unauthorized' })) } catch {}
    return false
  }
  return true
}

export async function logAdminEvent(event, detail, ip) {
  await insertRow('audit_logs', {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    type: 'admin',
    event,
    detail,
    severity: event.includes('fail') ? 'warn' : 'info',
    ip_hash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
  })
}
