import { query, readAll } from './_db.js'

export async function computeDashboard() {
  try {
    const timezone = 'Asia/Kolkata'

    const [visitorCounts, deviceRows, browserRows, countryRows, cityRows, dailyRows, returningBounce, pdfInfo, leadInfo, aiInfo, logsArr, vArr] = await Promise.all([
      query(`SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at AT TIME ZONE 'UTC' AT TIME ZONE $1 >= (CURRENT_TIMESTAMP AT TIME ZONE $1)::date)::int AS today,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS this_month,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes')::int AS recent_count
      FROM visitors`, [timezone]),
      query(`SELECT COALESCE(device_type, 'desktop') AS k, COUNT(*)::int AS c FROM visitors GROUP BY k`),
      query(`SELECT COALESCE(browser, 'Unknown') AS k, COUNT(*)::int AS c FROM visitors GROUP BY k`),
      query(`SELECT country AS k, COUNT(*)::int AS c FROM visitors WHERE country IS NOT NULL AND country != '' GROUP BY k ORDER BY c DESC`),
      query(`SELECT city AS k, COUNT(*)::int AS c FROM visitors WHERE city IS NOT NULL AND city != '' GROUP BY k ORDER BY c DESC`),
      query(`SELECT created_at::date::text AS d, COUNT(*)::int AS c FROM visitors GROUP BY d ORDER BY d`),
      query(`SELECT COALESCE(is_returning, FALSE) AS returning, COUNT(*)::int AS c FROM visitors GROUP BY is_returning`),
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE created_at AT TIME ZONE 'UTC' AT TIME ZONE $1 >= (CURRENT_TIMESTAMP AT TIME ZONE $1)::date)::int AS today, COALESCE(AVG(file_size_kb), 0)::int AS avg_size FROM generated_pdfs`, [timezone]),
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'New')::int AS new_count FROM leads`),
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE COALESCE(updated_at, created_at) AT TIME ZONE 'UTC' AT TIME ZONE $1 >= (CURRENT_TIMESTAMP AT TIME ZONE $1)::date)::int AS today, SUM(CASE WHEN messages IS NOT NULL AND jsonb_typeof(messages) = 'array' THEN jsonb_array_length(messages) ELSE 0 END)::int AS total_messages FROM ai_conversations`, [timezone]),
      readAll('audit_logs', 'created_at DESC', 10),
      readAll('visitors', 'created_at DESC', 10),
    ])

    const v = visitorCounts.rows[0]
    const deviceMap = {}
    deviceRows.rows.forEach(r => { deviceMap[r.k] = r.c })
    const browserMap = {}
    browserRows.rows.forEach(r => { browserMap[r.k] = r.c })
    const countryMap = {}
    countryRows.rows.forEach(r => { countryMap[r.k] = r.c })
    const cityMap = {}
    cityRows.rows.forEach(r => { cityMap[r.k] = r.c })
    const dailyMap = {}
    dailyRows.rows.forEach(r => { dailyMap[r.d] = r.c })

    const pageQ = await query(`SELECT page, COUNT(*)::int AS c FROM visitors GROUP BY page ORDER BY c DESC LIMIT 1`)
    const topPage = pageQ.rows[0]?.page || '/'

    const activeSessionsQ = await query(`SELECT COUNT(DISTINCT session_id)::int AS c FROM visitors WHERE created_at >= NOW() - INTERVAL '5 minutes'`)
    const activeSessions = activeSessionsQ.rows[0]?.c || 0

    let returningCount = 0
    let totalVisits = v.total
    returningBounce.rows.forEach(r => { if (r.returning) returningCount = r.c })

    const bounceQ = await query(`SELECT COUNT(*)::int AS c FROM visitors WHERE is_bounce = TRUE`)
    const bounceCount = bounceQ.rows[0]?.c || 0
    const bounceRate = totalVisits ? Math.round((bounceCount / totalVisits) * 100) : 0

    const p = pdfInfo.rows[0]
    const l = leadInfo.rows[0]
    const a = aiInfo.rows[0]

    const logsArray = Array.isArray(logsArr) ? logsArr : []
    const visitorsArray = Array.isArray(vArr) ? vArr : []

    return {
      visitors: {
        total: v.total,
        today: v.today,
        thisWeek: v.this_week,
        thisMonth: v.this_month,
        activeSessions,
        returning: returningCount,
        new: totalVisits - returningCount,
        bounceRate,
        topPage,
        deviceBreakdown: deviceMap,
        browserBreakdown: browserMap,
        countryCounts: countryMap,
        cityCounts: cityMap,
        dailyVisits: dailyMap,
      },
      pdfs: {
        total: p.total,
        today: p.today,
        avgSize: p.avg_size,
      },
      leads: {
        total: l.total,
        new: l.new_count,
      },
      ai: {
        totalConversations: a.total,
        today: a.today,
        totalMessages: a.total_messages,
        avgMessagesPerConversation: a.total > 0 ? (a.total_messages / a.total).toFixed(1) : '0',
      },
      activity: {
        recent: [...logsArray, ...visitorsArray]
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
