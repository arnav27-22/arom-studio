import crypto from 'crypto'
import { db } from '../_db.js'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const forwarded = req.headers['x-forwarded-for'] || ''
  const ip = (forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
  const body = req.body || {}

  db.append('visits', {
    id: crypto.randomUUID(),
    sessionId: body.sessionId,
    page: body.page || '/',
    referrer: body.referrer || '',
    deviceType: body.deviceInfo?.deviceType || 'desktop',
    browser: body.deviceInfo?.browser || 'Unknown',
    os: body.deviceInfo?.os || 'Unknown',
    country: '',
    city: '',
    ipHash,
    timeOnPage: 0,
    scrollDepth: 0,
    createdAt: new Date().toISOString(),
  })

  res.json({ ok: true })
}
