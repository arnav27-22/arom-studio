import { Request, Response } from 'express'
import { auditService } from '../services/AuditService'

export class LogController {
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const module = req.query.module as string
    const action = req.query.action as string
    const severity = req.query.severity as string

    const result = await auditService.search({
      module,
      action,
      severity,
      limit,
      offset: (page - 1) * limit,
    })

    res.json({ total: result.total, page, logs: result.logs })
  }
}

export const logController = new LogController()
