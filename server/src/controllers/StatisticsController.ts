import { Request, Response } from 'express'
import { statisticsService } from '../services/StatisticsService'

export class StatisticsController {
  async getDashboard(_req: Request, res: Response) {
    const stats = await statisticsService.getDashboard()
    res.json(stats)
  }

  async getAnalytics(_req: Request, res: Response) {
    const analytics = await statisticsService.getAnalytics()
    res.json(analytics)
  }
}

export const statisticsController = new StatisticsController()
