import { db } from './_db.js'

export async function computeDashboard() {
  const [visitors, pdfs, leads, logs, aiConversations] = await Promise.all([
    db.read('real_visitors'),
    db.read('real_pdfs'),
    db.read('real_leads'),
    db.read('system_logs'),
    db.read('real_ai_conversations'),
  ])

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now - 7 * 86400000).toISOString()
  const monthAgo = new Date(now - 30 * 86400000).toISOString()
  const fiveMinAgo = new Date(now - 5 * 60000).toISOString()

  const vArr = Array.isArray(visitors) ? visitors : []
  const pArr = Array.isArray(pdfs) ? pdfs : []
  const lArr = Array.isArray(leads) ? leads : []
  const logsArr = Array.isArray(logs) ? logs : []
  const aiArr = Array.isArray(aiConversations) ? aiConversations : []

  const todayVisits = vArr.filter(v => v.createdAt?.startsWith(today))
  const weekVisits = vArr.filter(v => v.createdAt >= weekAgo)
  const monthVisits = vArr.filter(v => v.createdAt >= monthAgo)

  const pageCounts = {}
  vArr.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

  const activeSessions = new Set(
    vArr.filter(v => v.createdAt >= fiveMinAgo).map(v => v.sessionId)
  ).size

  const deviceBreakdown = {}
  vArr.forEach(v => {
    const t = v.deviceType || 'desktop'
    deviceBreakdown[t] = (deviceBreakdown[t] || 0) + 1
  })

  const browserBreakdown = {}
  vArr.forEach(v => {
    const b = v.browser || 'Unknown'
    browserBreakdown[b] = (browserBreakdown[b] || 0) + 1
  })

  const countryCounts = {}
  vArr.forEach(v => {
    if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1
  })

  const cityCounts = {}
  vArr.forEach(v => {
    if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1
  })

  const dailyVisits = {}
  vArr.forEach(v => {
    if (v.createdAt) {
      const d = v.createdAt.slice(0, 10)
      dailyVisits[d] = (dailyVisits[d] || 0) + 1
    }
  })

  const returningCount = vArr.filter(v => v.isReturning).length
  const bounceCount = vArr.filter(v => v.isBounce).length
  const bounceRate = vArr.length ? Math.round((bounceCount / vArr.length) * 100) : 0

  const pdfTodayCount = pArr.filter(p => p.createdAt?.startsWith(today)).length
  const aiTodayCount = aiArr.filter(a => {
    const lastActive = a.lastActiveAt || a.createdAt
    return lastActive?.startsWith(today)
  }).length
  const aiTotalMessages = aiArr.reduce((sum, c) => sum + (Array.isArray(c.messages) ? c.messages.length : 0), 0)

  return {
    visitors: {
      total: vArr.length,
      today: todayVisits.length,
      thisWeek: weekVisits.length,
      thisMonth: monthVisits.length,
      activeSessions,
      returning: returningCount,
      new: vArr.length - returningCount,
      bounceRate,
      topPage,
      deviceBreakdown,
      browserBreakdown,
      countryCounts,
      cityCounts,
      dailyVisits,
    },
    pdfs: {
      total: pArr.length,
      today: pdfTodayCount,
      avgSize: pArr.length > 0
        ? Math.round(pArr.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / pArr.length)
        : 0,
    },
    leads: {
      total: lArr.length,
      new: lArr.filter(l => l.status === 'New').length,
    },
    ai: {
      totalConversations: aiArr.length,
      today: aiTodayCount,
      totalMessages: aiTotalMessages,
      avgMessagesPerConversation: aiArr.length > 0
        ? (aiTotalMessages / aiArr.length).toFixed(1)
        : '0',
    },
    activity: {
      recent: [...logsArr, ...vArr.slice(-5)]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10),
    },
  }
}

export async function computeAnalytics() {
  const visitors = (await db.read('real_visitors')) || []
  const visits = visitors

  const pages = {}
  visits.forEach((v, i) => {
    if (!pages[v.page]) {
      pages[v.page] = { views: 0, totalTime: 0, totalScroll: 0, entries: 0, exits: 0, referrers: {} }
    }
    pages[v.page].views++
    if (v.timeOnPage) pages[v.page].totalTime += v.timeOnPage
    if (v.scrollDepth) pages[v.page].totalScroll += v.scrollDepth
    if (v.referrer) {
      pages[v.page].referrers[v.referrer] = (pages[v.page].referrers[v.referrer] || 0) + 1
    }
    if (i === 0 || visits[i - 1]?.sessionId !== v.sessionId) pages[v.page].entries++
    if (i === visits.length - 1 || visits[i + 1]?.sessionId !== v.sessionId) pages[v.page].exits++
  })

  const uniqueSessions = new Set(visits.map(v => v.sessionId))
  const sessionPages = {}
  visits.forEach(v => {
    if (!sessionPages[v.sessionId]) sessionPages[v.sessionId] = new Set()
    sessionPages[v.sessionId].add(v.page)
  })
  const singlePageSessions = new Set(
    Object.entries(sessionPages).filter(([, pagesSet]) => pagesSet.size <= 1).map(([sid]) => sid)
  )
  const overallBounceRate = uniqueSessions.size > 0
    ? Math.round((singlePageSessions.size / uniqueSessions.size) * 100)
    : 0

  const hourlyTraffic = Array.from({ length: 7 }, () => Array(24).fill(0))
  visits.forEach(v => {
    const d = new Date(v.createdAt)
    if (hourlyTraffic[d.getDay()]) hourlyTraffic[d.getDay()][d.getHours()]++
  })

  return {
    pages: Object.entries(pages).map(([path, data]) => ({
      page: path,
      views: data.views,
      uniqueSessions: 0,
      avgTime: data.views > 0 ? Math.round(data.totalTime / data.views) : 0,
      avgScroll: data.views > 0 ? Math.round(data.totalScroll / data.views) : 0,
      bounceRate: 0,
      entries: data.entries,
      exits: data.exits,
      topReferrers: Object.entries(data.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5),
    })),
    totalUniqueSessions: uniqueSessions.size,
    overallBounceRate,
    hourlyTraffic,
  }
}
