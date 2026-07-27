import { Request, Response, NextFunction } from 'express'
import { statisticsService } from '../services/StatisticsService'
import { prisma } from '../database/prisma'

export class DashboardController {
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statisticsService.getDashboard()
      res.json({
        todayVisits: stats.visitors.today,
        weekVisits: stats.visitors.thisWeek,
        monthVisits: stats.visitors.thisMonth,
        allTimeVisits: stats.visitors.total,
        activeSessions: stats.visitors.activeSessions,
        totalPDFs: stats.pdfs.total,
        todayPDFs: stats.pdfs.today,
        totalLeads: stats.leads.total,
        topPage: stats.visitors.topPage,
        recentEvents: stats.activity.recent,
      })
    } catch (err) {
      next(err)
    }
  }

  async getActivity(_req: Request, res: Response, next: NextFunction) {
    try {
      const recent = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      res.json({ events: recent })
    } catch (err) {
      next(err)
    }
  }
}

export const dashboardController = new DashboardController()
