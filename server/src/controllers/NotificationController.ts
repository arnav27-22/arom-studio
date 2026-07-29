import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const unreadOnly = req.query.unread === 'true'

      const where: Record<string, unknown> = {}
      if (unreadOnly) where.read = false

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: where as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.notification.count({ where: where as any }),
      ])

      res.json({ total, page, notifications })
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: req.body.title || 'Notification',
          message: req.body.message || '',
          type: req.body.type || 'info',
          read: false,
        },
      })
      wsManager.broadcastToAll('notification:created', notification)
      res.json(notification)
    } catch (err) {
      next(err)
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      })
      wsManager.broadcastToAll('notification:updated', { id })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async markAllRead(_req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      })
      wsManager.broadcastToAll('notification:allread', {})
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.notification.delete({ where: { id: req.params.id as string } })
      wsManager.broadcastToAll('notification:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const notificationController = new NotificationController()
