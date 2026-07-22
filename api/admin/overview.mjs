import { requireAuth } from '../_auth.mjs'
import { db } from '../_db.mjs'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return

  const visits = db.read('visits')
  const pdfs = db.read('pdf_events')
  const leads = db.read('form_submissions')
  const logs = db.read('system_logs')

  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)
  const thisWeek = new Date(Date.now() - 7 * 86400000).toISOString()

  const todayVisits = visits.filter((v) => v.createdAt?.startsWith(today))
  const weekVisits = visits.filter((v) => v.createdAt >= thisWeek)
  const activeSessions = new Set(
    visits.filter((v) => now - new Date(v.createdAt).getTime() < 300000).map((v) => v.sessionId)
  ).size

  const pageCounts = {}
  visits.forEach((v) => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

  res.json({
    todayVisits: todayVisits.length,
    weekVisits: weekVisits.length,
    monthVisits: visits.filter((v) => v.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).length,
    allTimeVisits: visits.length,
    activeSessions,
    totalPDFs: pdfs.length,
    todayPDFs: pdfs.filter((p) => p.createdAt?.startsWith(today)).length,
    totalLeads: leads.length,
    topPage,
    recentEvents: [...logs, ...visits.slice(-5)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
  })
}
