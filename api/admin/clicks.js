import { requireAuth } from '../_auth.js'
import { getSupabase, toCamel } from '../_supabase.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  const { data: clicks, error } = await supabase
    .from('click_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  const decoded = toCamel(clicks || [])
  if (!decoded.length) return res.json({ total: 0, clicks: [], byLabel: {} })

  const { type, from, to } = req.query

  let filtered = [...decoded]
  if (from) filtered = filtered.filter((c) => c.createdAt >= from)
  if (to) filtered = filtered.filter((c) => c.createdAt <= to + 'T23:59:59')
  if (type) filtered = filtered.filter((c) => c.type === type)

  const byLabel = {}
  filtered.forEach((c) => { byLabel[c.label || c.type] = (byLabel[c.label || c.type] || 0) + 1 })

  res.json({
    total: filtered.length,
    clicks: filtered.slice(-200).reverse(),
    byLabel,
  })
}
