import crypto from 'crypto'
import { db } from '../_db.js'

function getBody(req) {
  return new Promise((resolve) => {
    if (req.body) return resolve(req.body)
    let data = ''
    req.on('data', (c) => data += c)
    req.on('end', () => {
      try { resolve(JSON.parse(data)) } catch { resolve({}) }
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const forwarded = req.headers['x-forwarded-for'] || ''
  const ip = (forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
  const b = await getBody(req)

  db.append('visits', {
    id: crypto.randomUUID(),
    sessionId: b.sessionId,
    page: b.page || '/',
    referrer: b.referrer || '',
    deviceType: b.deviceInfo?.deviceType || 'desktop',
    browser: b.deviceInfo?.browser || 'Unknown',
    os: b.deviceInfo?.os || 'Unknown',
    country: '',
    city: '',
    ipHash,
    timeOnPage: 0,
    scrollDepth: 0,
    createdAt: new Date().toISOString(),
  })

  res.json({ ok: true })
}
