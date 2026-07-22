import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_auth'
import { db } from '../_db'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const pdfEvents = db.read<any>('pdf_events')
  const { from, to, pdfType, country } = req.query as Record<string, string>

  let filtered = [...pdfEvents]
  if (from) filtered = filtered.filter((e) => e.createdAt >= from)
  if (to) filtered = filtered.filter((e) => e.createdAt <= to + 'T23:59:59')
  if (pdfType) filtered = filtered.filter((e) => e.pdfType === pdfType)
  if (country) filtered = filtered.filter((e) => e.country === country)

  const byDay: Record<string, { count: number; totalSize: number }> = {}
  filtered.forEach((e: any) => {
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
    avgSize: filtered.length > 0 ? Math.round(filtered.reduce((s: number, e: any) => s + (e.fileSizeKb || 0), 0) / filtered.length) : 0,
  })
}
