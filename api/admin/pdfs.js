import { requireAuth } from '../_auth.js'
import { getSupabase } from '../_supabase.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  const { data: pdfEvents, error } = await supabase
    .from('pdf_events')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  if (!pdfEvents) return res.json({ total: 0, pdfs: [], byDay: {}, avgSize: 0 })

  const { from, to, pdfType, country } = req.query

  let filtered = [...pdfEvents]
  if (from) filtered = filtered.filter((e) => e.createdAt >= from)
  if (to) filtered = filtered.filter((e) => e.createdAt <= to + 'T23:59:59')
  if (pdfType) filtered = filtered.filter((e) => e.pdfType === pdfType)
  if (country) filtered = filtered.filter((e) => e.country === country)

  const byDay = {}
  filtered.forEach((e) => {
    const day = e.createdAt?.slice(0, 10)
    if (!day) return
    if (!byDay[day]) byDay[day] = { count: 0, totalSize: 0 }
    byDay[day].count++
    byDay[day].totalSize += e.fileSizeKb || 0
  })

  res.json({
    total: filtered.length,
    pdfs: filtered.slice(-100).reverse(),
    byDay,
    avgSize: filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / filtered.length) : 0,
  })
}
