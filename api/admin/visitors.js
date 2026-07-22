import { requireAuth } from '../_auth.js'
import { getSupabase } from '../_supabase.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  const { data: visits, error } = await supabase
    .from('visits')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  if (!visits) return res.json({ total: 0, allTime: 0, visits: [], dailyChart: [], deviceBreakdown: {}, countryCounts: {} })

  const { page, country, device, from, to } = req.query

  let filtered = [...visits]
  if (from) filtered = filtered.filter((v) => v.createdAt >= from)
  if (to) filtered = filtered.filter((v) => v.createdAt <= to + 'T23:59:59')
  if (page) filtered = filtered.filter((v) => v.page === page)
  if (country) filtered = filtered.filter((v) => v.country === country)
  if (device) filtered = filtered.filter((v) => v.deviceType === device)

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    const dayVisits = visits.filter((v) => v.createdAt?.startsWith(d))
    const unique = new Set(dayVisits.map((v) => v.sessionId)).size
    return { date: d, visits: dayVisits.length, unique }
  }).reverse()

  const deviceBreakdown = {}
  visits.forEach((v) => { deviceBreakdown[v.deviceType] = (deviceBreakdown[v.deviceType] || 0) + 1 })

  const countryCounts = {}
  visits.forEach((v) => { if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1 })

  res.json({
    total: filtered.length,
    allTime: visits.length,
    visits: filtered.slice(-200).reverse(),
    dailyChart: last30,
    deviceBreakdown,
    countryCounts,
  })
}
