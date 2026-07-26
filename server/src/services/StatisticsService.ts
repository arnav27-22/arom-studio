import { Prisma } from '../generated/prisma/client'
import { prisma } from '../database/prisma'
import { redisClient, DASHBOARD_TTL, STATISTICS_TTL } from '../cache'

interface DashboardStats {
  visitors: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    activeSessions: number
    returning: number
    new: number
    bounceRate: number
    topPage: string
    deviceBreakdown: Record<string, number>
    browserBreakdown: Record<string, number>
    countryCounts: Record<string, number>
    cityCounts: Record<string, number>
    dailyVisits: Record<string, number>
  }
  pdfs: { total: number; today: number; avgSize: number }
  leads: { total: number; new: number }
  ai: { totalConversations: number; today: number; totalMessages: number; avgMessagesPerConversation: string }
  activity: { recent: unknown[] }
}

export class StatisticsService {
  async getDashboard(): Promise<DashboardStats> {
    const cacheKey = 'stats:dashboard'
    const cached = await redisClient.get<DashboardStats>(cacheKey)
    if (cached) return cached

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const monthAgo = new Date(now.getTime() - 30 * 86400000)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000)

    const whereActive = { deletedAt: null }

    const [
      totalVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
      activeSessionsResult,
      returningCount,
      bounceCount,
      topPageResult,
      deviceGroup,
      browserGroup,
      countryGroup,
      cityGroup,
      dailyVisitsRaw,
      totalPdfs,
      todayPdfs,
      pdfAgg,
      totalLeads,
      newLeads,
      totalConversations,
      todayConversations,
      totalMessages,
      recentLogs,
    ] = await Promise.all([
      prisma.visitor.count({ where: whereActive }),
      prisma.visitor.count({ where: { ...whereActive, createdAt: { gte: todayStart } } }),
      prisma.visitor.count({ where: { ...whereActive, createdAt: { gte: weekAgo } } }),
      prisma.visitor.count({ where: { ...whereActive, createdAt: { gte: monthAgo } } }),
      prisma.visitor.groupBy({
        by: ['sessionId'],
        where: { ...whereActive, createdAt: { gte: fiveMinAgo }, sessionId: { not: null } },
        _count: { sessionId: true },
      }),
      prisma.visitor.count({ where: { ...whereActive, isReturning: true } }),
      prisma.visitor.count({ where: { ...whereActive, isBounce: true } }),
      prisma.visitor.groupBy({
        by: ['page'],
        where: whereActive,
        _count: { page: true },
        orderBy: { _count: { page: 'desc' } },
        take: 1,
      }),
      prisma.visitor.groupBy({
        by: ['deviceType'],
        where: whereActive,
        _count: { deviceType: true },
      }),
      prisma.visitor.groupBy({
        by: ['browser'],
        where: whereActive,
        _count: { browser: true },
      }),
      prisma.visitor.groupBy({
        by: ['country'],
        where: { ...whereActive, country: { not: '' } },
        _count: { country: true },
      }),
      prisma.visitor.groupBy({
        by: ['city'],
        where: { ...whereActive, city: { not: null } },
        _count: { city: true },
      }),
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(created_at)::text as date, COUNT(*)::int as count
        FROM "Visitor"
        WHERE deleted_at IS NULL
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
      prisma.generatedPDF.count({ where: whereActive }),
      prisma.generatedPDF.count({ where: { ...whereActive, createdAt: { gte: todayStart } } }),
      prisma.generatedPDF.aggregate({
        where: whereActive,
        _avg: { fileSizeKb: true },
      }),
      prisma.lead.count({ where: whereActive }),
      prisma.lead.count({ where: { ...whereActive, status: 'NEW' } }),
      prisma.aIConversation.count({ where: whereActive }),
      prisma.aIConversation.count({
        where: {
          ...whereActive,
          lastActiveAt: { gte: todayStart },
        },
      }),
      prisma.aIMessage.count(),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ])

    const activeSessions = activeSessionsResult.length
    const topPage = topPageResult[0]?.page || '/'

    const deviceBreakdown: Record<string, number> = {}
    deviceGroup.forEach(g => { deviceBreakdown[g.deviceType.toLowerCase()] = g._count.deviceType })

    const browserBreakdown: Record<string, number> = {}
    browserGroup.forEach(g => { browserBreakdown[g.browser || 'Unknown'] = g._count.browser })

    const countryCounts: Record<string, number> = {}
    countryGroup.forEach(g => { countryCounts[g.country] = g._count.country })

    const cityCounts: Record<string, number> = {}
    cityGroup.forEach(g => { if (g.city) cityCounts[g.city] = g._count.city })

    const dailyVisits: Record<string, number> = {}
    dailyVisitsRaw.forEach((row: any) => { dailyVisits[row.date] = Number(row.count) })

    const bounceRate = totalVisitors > 0 ? Math.round((bounceCount / totalVisitors) * 100) : 0

    const aiTodayCount = todayConversations
    const aiTotalMessages = totalMessages

    const result: DashboardStats = {
      visitors: {
        total: totalVisitors,
        today: todayVisitors,
        thisWeek: weekVisitors,
        thisMonth: monthVisitors,
        activeSessions,
        returning: returningCount,
        new: totalVisitors - returningCount,
        bounceRate,
        topPage,
        deviceBreakdown,
        browserBreakdown,
        countryCounts,
        cityCounts,
        dailyVisits,
      },
      pdfs: {
        total: totalPdfs,
        today: todayPdfs,
        avgSize: pdfAgg._avg.fileSizeKb ? Math.round(pdfAgg._avg.fileSizeKb) : 0,
      },
      leads: {
        total: totalLeads,
        new: newLeads,
      },
      ai: {
        totalConversations,
        today: aiTodayCount,
        totalMessages: aiTotalMessages,
        avgMessagesPerConversation:
          totalConversations > 0
            ? (aiTotalMessages / totalConversations).toFixed(1)
            : '0',
      },
      activity: {
        recent: recentLogs,
      },
    }

    await redisClient.set(cacheKey, result, DASHBOARD_TTL)
    return result
  }

  async getAnalytics(page = 1, limit = 50) {
    const cacheKey = `stats:analytics:${page}:${limit}`
    const cached = await redisClient.get(cacheKey)
    if (cached) return cached

    const whereActive = { deletedAt: null }

    const pageGroups = await prisma.visitor.groupBy({
      by: ['page'],
      where: whereActive,
      _count: { id: true, page: true },
      _sum: { timeOnPage: true, scrollDepth: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
      skip: (page - 1) * limit,
    })

    const pageNames = pageGroups.map((g) => g.page)
    const referrerGroups = pageGroups.length > 0
      ? await prisma.visitor.groupBy({
          by: ['page', 'referrer'],
          where: { ...whereActive, page: { in: pageNames }, referrer: { not: '' } },
          _count: { referrer: true },
        })
      : []

    const referrerMap: Record<string, Record<string, number>> = {}
    referrerGroups.forEach((g) => {
      if (!referrerMap[g.page]) referrerMap[g.page] = {}
      referrerMap[g.page][g.referrer] = g._count.referrer
    })

    const uniqueSessionsCount = await prisma.visitor.groupBy({
      by: ['sessionId'],
      where: { ...whereActive, sessionId: { not: null } },
      _count: { sessionId: true },
    })

    const singlePageSessionRaw = await prisma.$queryRaw<
      Array<{ session_id: string; page_count: bigint }>
    >(Prisma.sql`
      SELECT session_id, COUNT(DISTINCT page)::int as page_count
      FROM "Visitor"
      WHERE deleted_at IS NULL AND session_id IS NOT NULL
      GROUP BY session_id
      HAVING COUNT(DISTINCT page) <= 1
    `)

    const overallBounceRate =
      uniqueSessionsCount.length > 0
        ? Math.round((singlePageSessionRaw.length / uniqueSessionsCount.length) * 100)
        : 0

    const hourlyTrafficRaw = await prisma.$queryRaw<
      Array<{ day: number; hour: number; count: bigint }>
    >(Prisma.sql`
      SELECT
        EXTRACT(DOW FROM created_at)::int as day,
        EXTRACT(HOUR FROM created_at)::int as hour,
        COUNT(*)::int as count
      FROM "Visitor"
      WHERE deleted_at IS NULL
      GROUP BY day, hour
      ORDER BY day, hour
    `)

    const hourlyTraffic = Array.from({ length: 7 }, () => Array(24).fill(0))
    hourlyTrafficRaw.forEach((row: any) => {
      const d = Number(row.day)
      const h = Number(row.hour)
      if (hourlyTraffic[d]) hourlyTraffic[d][h] = Number(row.count)
    })

    const pageEntries: Record<string, { entries: number; exits: number }> = {}
    if (pageNames.length > 0) {
      const sessionPageGroups = await prisma.visitor.groupBy({
        by: ['sessionId', 'page'],
        where: {
          ...whereActive,
          page: { in: pageNames },
          sessionId: { not: null },
        },
        _min: { createdAt: true },
        _max: { createdAt: true },
      })

      const firstLastPerSession: Record<
        string,
        { first: { page: string; time: Date }; last: { page: string; time: Date } }
      > = {}
      sessionPageGroups.forEach((sp) => {
        const sid = sp.sessionId!
        const minTime = sp._min.createdAt
        const maxTime = sp._max.createdAt
        if (!minTime || !maxTime) return
        if (!firstLastPerSession[sid]) {
          firstLastPerSession[sid] = {
            first: { page: sp.page, time: minTime },
            last: { page: sp.page, time: maxTime },
          }
        } else {
          if (minTime < firstLastPerSession[sid].first.time) {
            firstLastPerSession[sid].first = { page: sp.page, time: minTime }
          }
          if (maxTime > firstLastPerSession[sid].last.time) {
            firstLastPerSession[sid].last = { page: sp.page, time: maxTime }
          }
        }
      })

      Object.values(firstLastPerSession).forEach((fl) => {
        if (!pageEntries[fl.first.page]) pageEntries[fl.first.page] = { entries: 0, exits: 0 }
        if (!pageEntries[fl.last.page]) pageEntries[fl.last.page] = { entries: 0, exits: 0 }
        pageEntries[fl.first.page].entries++
        pageEntries[fl.last.page].exits++
      })
    }

    const result = {
      pages: pageGroups.map((g) => ({
        page: g.page,
        views: g._count.id,
        uniqueSessions: 0,
        avgTime: g._count.id > 0 ? Math.round((g._sum.timeOnPage || 0) / g._count.id) : 0,
        avgScroll: g._count.id > 0 ? Math.round((g._sum.scrollDepth || 0) / g._count.id) : 0,
        entries: pageEntries[g.page]?.entries || 0,
        exits: pageEntries[g.page]?.exits || 0,
        topReferrers: Object.entries(referrerMap[g.page] || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
      })),
      totalUniqueSessions: uniqueSessionsCount.length,
      overallBounceRate,
      hourlyTraffic,
      page: page + 1,
      hasMore: pageGroups.length === limit,
    }

    await redisClient.set(cacheKey, result, STATISTICS_TTL)
    return result
  }
}

export const statisticsService = new StatisticsService()

