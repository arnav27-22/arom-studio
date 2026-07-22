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

  const body = await getBody(req)
  const { type, label, page, sessionId } = body

  await supabase.from('click_events').insert({
    id: crypto.randomUUID(),
    sessionId,
    type: type || 'unknown',
    label: label || '',
    page: page || '/',
    createdAt: new Date().toISOString(),
  })

  res.json({ ok: true })
}
