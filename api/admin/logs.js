import { requireAuth } from '../_auth.js'
import { getSupabase, toCamel } from '../_supabase.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  const { data: logs, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  const decoded = toCamel(logs || [])
  if (!decoded.length) return res.json({ total: 0, logs: [] })

  const { type: typeFilter, severity, from, to } = req.query

  let filtered = [...decoded]
  if (from) filtered = filtered.filter((l) => l.createdAt >= from)
  if (to) filtered = filtered.filter((l) => l.createdAt <= to + 'T23:59:59')
  if (typeFilter) filtered = filtered.filter((l) => l.type === typeFilter)
  if (severity) filtered = filtered.filter((l) => l.severity === severity)

  res.json({
    total: filtered.length,
    logs: filtered.slice(-200).reverse(),
  })
}
