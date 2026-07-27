import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { sseService } from '../services/SSEService'

export class DiscoveryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const [items, total] = await Promise.all([
        prisma.discoveryForm.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.discoveryForm.count({ where: { deletedAt: null } }),
      ])

      res.json({ total, page, questionnaires: items })
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const form = await prisma.discoveryForm.create({
        data: {
          fullName: body.fullName,
          company: body.company || '',
          email: body.email,
          phone: body.phone || '',
          website: body.website || '',
          budget: body.budget || '',
          urgency: body.urgency || '',
          preferredLaunchDate: body.preferredLaunchDate || '',
          contentProvider: body.contentProvider || '',
          fullData: body.fullData ? JSON.parse(JSON.stringify(body.fullData)) : undefined,
        },
      })
      wsManager.broadcastToAll('discovery:created', form)
      sseService.broadcast('discovery', { action: 'created', data: form })
      res.json({ success: true, id: form.id })
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.discoveryForm.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('discovery:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const discoveryController = new DiscoveryController()
