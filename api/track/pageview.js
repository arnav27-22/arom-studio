import crypto from 'crypto'
import { getSupabase } from '../_supabase.js'

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
  const supabase = getSupabase()
  if (!supabase) return res.json({ ok: true })

  const forwarded = req.headers['x-forwarded-for'] || ''
  const ip = (forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
  const body = await getBody(req)

  await supabase.from('visits').insert({
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
