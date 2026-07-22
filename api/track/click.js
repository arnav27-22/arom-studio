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

  const b = await getBody(req)

  await supabase.from('click_events').insert({
    id: crypto.randomUUID(),
    session_id: b.sessionId,
    type: b.type || 'unknown',
    label: b.label || '',
    page: b.page || '/',
    created_at: new Date().toISOString(),
  })

  res.json({ ok: true })
}
