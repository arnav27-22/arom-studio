import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_auth'
import { db } from '../_db'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const visits = db.read<any>('visits')
  const { page, country, device, from, to } = req.query as Record<string, string>

  let filtered = [...visits]

  if (from) filtered = filtered.filter((v) => v.createdAt >= from)
  if (to) filtered = filtered.filter((v) => v.createdAt <= to + 'T23:59:59')
  if (page) filtered = filtered.filter((v) => v.page === page)
  if (country) filtered = filtered.filter((v) => v.country === country)
  if (device) filtered = filtered.filter((v) => v.deviceType === device)

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    const dayVisits = visits.filter((v: any) => v.createdAt?.startsWith(d))
    const unique = new Set(dayVisits.map((v: any) => v.sessionId)).size
    return { date: d, visits: dayVisits.length, unique }
  }).reverse()

  const deviceBreakdown: Record<string, number> = {}
  visits.forEach((v: any) => { deviceBreakdown[v.deviceType] = (deviceBreakdown[v.deviceType] || 0) + 1 })

  const countryCounts: Record<string, number> = {}
  visits.forEach((v: any) => { if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1 })

  res.json({
    total: filtered.length,
    allTime: visits.length,
    visits: filtered.slice(-200).reverse(),
    dailyChart: last30,
    deviceBreakdown,
    countryCounts,
  })
}
