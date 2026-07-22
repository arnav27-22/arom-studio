import { requireAuth } from '../_auth.js'
import { db } from '../_db.js'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return

  const visits = db.read('visits')

  const pages = {}

  visits.forEach((v, i) => {
    if (!pages[v.page]) {
      pages[v.page] = { views: 0, sessions: 0, totalTime: 0, totalScroll: 0, entries: 0, exits: 0, referrers: {} }
    }
    pages[v.page].views++
    if (v.timeOnPage) pages[v.page].totalTime += v.timeOnPage
    if (v.scrollDepth) pages[v.page].totalScroll += v.scrollDepth
    if (v.referrer) pages[v.page].referrers[v.referrer] = (pages[v.page].referrers[v.referrer] || 0) + 1
    if (i === 0 || visits[i - 1]?.sessionId !== v.sessionId) pages[v.page].entries++
    if (i === visits.length - 1 || visits[i + 1]?.sessionId !== v.sessionId) pages[v.page].exits++
  })

  const uniqueSessions = new Set(visits.map((v) => v.sessionId))
  const singlePageSessions = new Set()
  const sessionPages = {}
  visits.forEach((v) => {
    if (!sessionPages[v.sessionId]) sessionPages[v.sessionId] = new Set()
    sessionPages[v.sessionId].add(v.page)
  })
  Object.entries(sessionPages).forEach(([sid, pagesSet]) => {
    if (pagesSet.size <= 1) singlePageSessions.add(sid)
  })

  const hourlyTraffic = Array.from({ length: 7 }, () => Array(24).fill(0))
  visits.forEach((v) => {
    const d = new Date(v.createdAt)
    const day = d.getDay()
    const hour = d.getHours()
    if (hourlyTraffic[day]) hourlyTraffic[day][hour]++
  })

  res.json({
    pages: Object.entries(pages).map(([path, data]) => ({
      page: path,
      views: data.views,
      uniqueSessions: data.sessions,
      avgTime: data.views > 0 ? Math.round(data.totalTime / data.views) : 0,
      avgScroll: data.views > 0 ? Math.round(data.totalScroll / data.views) : 0,
      bounceRate: data.entries > 0 ? Math.round((data.exits / data.entries) * 100) : 0,
      entries: data.entries,
      exits: data.exits,
      topReferrers: Object.entries(data.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5),
    })),
    totalUniqueSessions: uniqueSessions.size,
    overallBounceRate: uniqueSessions.size > 0 ? Math.round((singlePageSessions.size / uniqueSessions.size) * 100) : 0,
    hourlyTraffic,
  })
}
