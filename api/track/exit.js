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
  const { sessionId, page, timeOnPage, scrollDepth } = b
  if (!sessionId || !page) return res.status(400).json({ error: 'Missing fields' })

  await supabase
    .from('visits')
    .update({ time_on_page: timeOnPage || 0, scroll_depth: scrollDepth || 0 })
    .eq('session_id', sessionId)
    .eq('page', page)

  res.json({ ok: true })
}
