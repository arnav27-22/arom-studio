import { checkRateLimit, recordFailure, timingSafeEqual, signToken, verifyToken, getCookieToken } from '../_auth.js'

export default function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex')

  if (req.method === 'GET') {
    const token = getCookieToken(req)
    return res.json({ authenticated: !!token && verifyToken(token) })
  }

  if (req.method === 'POST') {
    const { action } = req.body || {}

    if (action === 'login') {
      const forwarded = req.headers['x-forwarded-for'] || ''
      const ip = (forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
      if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many attempts. Try again later.' })
      }

      const { password } = req.body || {}
      const adminPw = process.env.ADMIN_PASSWORD

      if (!adminPw) {
        return res.status(500).json({ error: 'ADMIN_PASSWORD not configured on server' })
      }

      const match = timingSafeEqual(password || '', adminPw)

      if (!match) {
        recordFailure(ip)
        return res.status(401).json({ error: 'Incorrect password' })
      }

      const token = signToken()
      res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`)
      return res.json({ success: true })
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
      return res.json({ success: true })
    }
  }

  return res.status(400).json({ error: 'Invalid request' })
}
