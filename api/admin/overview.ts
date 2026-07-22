import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_auth'
import { db } from '../_db'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const visits = db.read<any>('visits')
  const pdfs = db.read<any>('pdf_events')
  const leads = db.read<any>('form_submissions')
  const logs = db.read<any>('system_logs')

  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)
  const thisWeek = new Date(Date.now() - 7 * 86400000).toISOString()

  const todayVisits = visits.filter((v: any) => v.createdAt?.startsWith(today))
  const weekVisits = visits.filter((v: any) => v.createdAt >= thisWeek)
  const activeSessions = new Set(
    visits.filter((v: any) => now - new Date(v.createdAt).getTime() < 300000).map((v: any) => v.sessionId)
  ).size

  const pageCounts: Record<string, number> = {}
  visits.forEach((v: any) => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

  res.json({
    todayVisits: todayVisits.length,
    weekVisits: weekVisits.length,
    monthVisits: visits.filter((v: any) => v.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).length,
    allTimeVisits: visits.length,
    activeSessions,
    totalPDFs: pdfs.length,
    todayPDFs: pdfs.filter((p: any) => p.createdAt?.startsWith(today)).length,
    totalLeads: leads.length,
    topPage,
    recentEvents: [...logs, ...visits.slice(-5)].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
  })
}
