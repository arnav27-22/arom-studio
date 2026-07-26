import { Request, Response } from 'express'
import { statisticsService } from '../services/StatisticsService'

export class DashboardController {
  async get(_req: Request, res: Response) {
    const stats = await statisticsService.getDashboard()
    res.json(stats)
  }

  async getOverview(_req: Request, res: Response) {
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
  }

  async getActivity(_req: Request, res: Response) {
    const stats = await statisticsService.getDashboard()
    res.json({ events: stats.activity.recent })
  }
}

export const dashboardController = new DashboardController()
