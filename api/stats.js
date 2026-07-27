import { readAll } from './_db.js'

export async function computeDashboard() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now - 7 * 86400000)
    const monthAgo = new Date(now - 30 * 86400000)
    const fiveMinAgo = new Date(now - 5 * 60000)

    const [visitors, pdfs, leads, logs, conversations] = await Promise.all([
      readAll('visitors'),
      readAll('generated_pdfs'),
      readAll('leads'),
      readAll('audit_logs'),
      readAll('ai_conversations'),
    ])

    const vArr = Array.isArray(visitors) ? visitors : []
    const pArr = Array.isArray(pdfs) ? pdfs : []
    const lArr = Array.isArray(leads) ? leads : []
    const logsArr = Array.isArray(logs) ? logs : []
    const aiArr = Array.isArray(conversations) ? conversations : []

    const todayVisits = vArr.filter(v => {
      const d = v.createdAt ? new Date(v.createdAt) : null
      return d && d >= todayStart
    })
    const weekVisits = vArr.filter(v => {
      const d = v.createdAt ? new Date(v.createdAt) : null
      return d && d >= weekAgo
    })
    const monthVisits = vArr.filter(v => {
      const d = v.createdAt ? new Date(v.createdAt) : null
      return d && d >= monthAgo
    })

    const pageCounts = {}
    vArr.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

    const activeSessions = new Set(
      vArr.filter(v => {
        const d = v.createdAt ? new Date(v.createdAt) : null
        return d && d >= fiveMinAgo
      }).map(v => v.sessionId)
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

    const pdfTodayCount = pArr.filter(p => {
      const d = p.createdAt ? new Date(p.createdAt) : null
      return d && d >= todayStart
    }).length
    const aiTodayCount = aiArr.filter(a => {
      const lastActive = a.lastActiveAt || a.createdAt
      const d = lastActive ? new Date(lastActive) : null
      return d && d >= todayStart
    }).length
    const aiTotalMessages = aiArr.reduce((sum, c) => sum + (Array.isArray(c.messages) ? c.length : 0), 0)

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
  } catch {
    const empty = () => ({ total: 0, today: 0, thisWeek: 0, thisMonth: 0, activeSessions: 0, returning: 0, new: 0, bounceRate: 0, topPage: '/', deviceBreakdown: {}, browserBreakdown: {}, countryCounts: {}, cityCounts: {}, dailyVisits: {} })
    return { visitors: empty(), pdfs: { total: 0, today: 0, avgSize: 0 }, leads: { total: 0, new: 0 }, ai: { totalConversations: 0, today: 0, totalMessages: 0, avgMessagesPerConversation: '0' }, activity: { recent: [] } }
  }
}

export async function computeAnalytics() {
  try {
    const rows = await readAll('visitors')
    const visitors = Array.isArray(rows) ? rows : []
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
  } catch {
    return { pages: [], totalUniqueSessions: 0, overallBounceRate: 0, hourlyTraffic: [] }
  }
}
