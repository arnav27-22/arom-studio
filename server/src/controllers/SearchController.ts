import { Request, Response, NextFunction } from 'express'
import { searchService } from '../services/SearchService'

export class SearchController {
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string
      if (!query || query.length < 2) {
        res.json({ results: [] })
        return
      }

      const limit = parseInt(req.query.limit as string) || 20
      const results = await searchService.globalSearch(query, limit)
      res.json({ results })
    } catch (err) {
      next(err)
    }
  }
}

export const searchController = new SearchController()
