import { db } from './_db.js'
import { verifyToken, signToken, timingSafeEqual, checkRateLimit, recordFailure } from './_auth.js'

function j(res, data) {
  try { res.end(JSON.stringify(data)) } catch {}
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname

  // Auth check
  if (p === '/api/admin/auth' && req.method === 'GET') {
    const cookies = (req.headers.cookie || '').split(';').map(c => c.trim())
    const token = cookies.find(c => c.startsWith('admin_token='))?.slice(12)
    return j(res, { authenticated: !!(token && verifyToken(token)) })
  }

  // Login
  if (p === '/api/admin/auth' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    await new Promise(r => req.on('end', r))
    const b = JSON.parse(body || '{}')

    if (b.action === 'login') {
      if (!process.env.ADMIN_PASSWORD) return j(res, { error: 'ADMIN_PASSWORD not configured' })
      if (!timingSafeEqual(b.password || '', process.env.ADMIN_PASSWORD)) return j(res, { error: 'Incorrect password' })
      const token = signToken()
      if (!token) return j(res, { error: 'ADMIN_JWT_SECRET not configured' })
      res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`)
      return j(res, { success: true })
    }
    return j(res, { error: 'Invalid' })
  }

  // Ping
  if (p === '/api/ping') return j(res, { ok: true })

  j(res, { error: 'not found', path: p })
}
