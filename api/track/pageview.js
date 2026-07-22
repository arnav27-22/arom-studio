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
  const b = await getBody(req)

  await supabase.from('visits').insert({
    id: crypto.randomUUID(),
    session_id: b.sessionId,
    page: b.page || '/',
    referrer: b.referrer || '',
    device_type: b.deviceInfo?.deviceType || 'desktop',
    browser: b.deviceInfo?.browser || 'Unknown',
    os: b.deviceInfo?.os || 'Unknown',
    country: '',
    city: '',
    ip_hash: ipHash,
    time_on_page: 0,
    scroll_depth: 0,
    created_at: new Date().toISOString(),
  })

  res.json({ ok: true })
}
