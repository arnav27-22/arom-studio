import { requireAuth } from '../_auth.js'
import { getSupabase } from '../_supabase.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now - 7 * 86400000).toISOString()
  const monthAgo = new Date(now - 30 * 86400000).toISOString()
  const fiveMinAgo = new Date(now - 5 * 60000).toISOString()

  const [visitsRes, pdfsRes, leadsRes, logsRes, recentRes] = await Promise.all([
    supabase.from('visits').select('id, sessionId, page, createdAt').gte('createdAt', monthAgo),
    supabase.from('pdf_events').select('id, createdAt, fileSizeKb'),
    supabase.from('form_submissions').select('id, createdAt'),
    supabase.from('system_logs').select('id, type, event, detail, severity, createdAt, timestamp').order('createdAt', { ascending: false }).limit(5),
    supabase.from('visits').select('id, sessionId, page, createdAt').order('createdAt', { ascending: false }).limit(10),
  ])

  const visits = visitsRes.data || []
  const pdfs = pdfsRes.data || []
  const leads = leadsRes.data || []
  const logs = logsRes.data || []
  const recentVisits = recentRes.data || []

  const todayVisits = visits.filter((v) => v.createdAt?.startsWith(today))
  const weekVisits = visits.filter((v) => v.createdAt >= weekAgo)
  const activeSessions = new Set(visits.filter((v) => v.createdAt >= fiveMinAgo).map((v) => v.sessionId)).size

  const pageCounts = {}
  visits.forEach((v) => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

  const recentEvents = [...logs, ...recentVisits]
    .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
    .slice(0, 5)

  res.json({
    todayVisits: todayVisits.length,
    weekVisits: weekVisits.length,
    monthVisits: visits.length,
    allTimeVisits: visits.length,
    activeSessions,
    totalPDFs: pdfs.length,
    todayPDFs: pdfs.filter((p) => p.createdAt?.startsWith(today)).length,
    totalLeads: leads.length,
    topPage,
    recentEvents,
  })
}
