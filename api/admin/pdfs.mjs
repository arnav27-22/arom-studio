import { requireAuth } from '../_auth.mjs'
import { db } from '../_db.mjs'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return

  const pdfEvents = db.read('pdf_events')
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
