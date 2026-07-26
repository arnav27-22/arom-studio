import { Request, Response } from 'express'
import { searchService } from '../services/SearchService'

export class SearchController {
  async globalSearch(req: Request, res: Response) {
    const query = req.query.q as string
    if (!query || query.length < 2) {
      res.json({ results: [] })
      return
    }

    const limit = parseInt(req.query.limit as string) || 20
    const results = await searchService.globalSearch(query, limit)
    res.json({ results })
  }
}

export const searchController = new SearchController()
