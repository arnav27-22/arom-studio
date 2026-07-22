import { requireAuth } from '../_auth.js'
import { getSupabase } from '../_supabase.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  const { data: logs, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  if (!logs) return res.json({ total: 0, logs: [] })

  const { type: typeFilter, severity, from, to } = req.query

  let filtered = [...logs]
  if (from) filtered = filtered.filter((l) => l.timestamp >= from)
  if (to) filtered = filtered.filter((l) => l.timestamp <= to + 'T23:59:59')
  if (typeFilter) filtered = filtered.filter((l) => l.type === typeFilter)
  if (severity) filtered = filtered.filter((l) => l.severity === severity)

  res.json({
    total: filtered.length,
    logs: filtered.slice(-200).reverse(),
  })
}
