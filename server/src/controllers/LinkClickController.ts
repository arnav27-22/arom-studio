import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class LinkClickController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const type = req.query.type as string

      const where: Record<string, unknown> = {}
      if (type) where.type = type

      const [clicks, total] = await Promise.all([
        prisma.linkClick.findMany({
          where: where as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.linkClick.count({ where: where as any }),
      ])

      const byLabel: Record<string, number> = {}
      clicks.forEach(c => {
        if (c.label) byLabel[c.label] = (byLabel[c.label] || 0) + 1
      })

      res.json({ total, page, clicks, byLabel })
    } catch (err) {
      next(err)
    }
  }

  async track(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, label, page, sessionId } = req.body

      const click = await prisma.linkClick.create({
        data: {
          url: label || '',
          type: type || 'click',
          label: label || '',
          page: page || '',
          sessionId: sessionId || '',
          browser: req.headers['user-agent'] || '',
        },
      })

      wsManager.broadcastToAll('linkclick:created', click)
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      await prisma.linkClick.delete({ where: { id } })
      wsManager.broadcastToAll('linkclick:deleted', { id })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const linkClickController = new LinkClickController()
