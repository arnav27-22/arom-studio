import { Request, Response, NextFunction } from 'express'
import { statisticsService } from '../services/StatisticsService'

export class StatisticsController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dateFrom = req.query.dateFrom as string | undefined
      const dateTo = req.query.dateTo as string | undefined
      const stats = await statisticsService.getDashboard(dateFrom, dateTo)
      res.json(stats)
    } catch (err) {
      next(err)
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const analytics = await statisticsService.getAnalytics(page, limit)
      res.json(analytics)
    } catch (err) {
      next(err)
    }
  }
}

export const statisticsController = new StatisticsController()
