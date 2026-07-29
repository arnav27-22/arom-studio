import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { softDelete } from '../utils/softDelete'

export class ContentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [items, total] = await Promise.all([
        prisma.contentCollection.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.contentCollection.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, items })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await prisma.contentCollection.findUnique({ where: { id: req.params.id as string } })
      if (!item || item.deletedAt) {
        res.status(404).json({ error: 'Content item not found' })
        return
      }
      res.json(item)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const item = await prisma.contentCollection.create({
        data: {
          clientName: body.clientName,
          projectName: body.projectName || '',
          status: body.status || 'Pending',
          completionPercentage: body.completionPercentage || 0,
          downloadUrl: body.downloadUrl || '',
          checklist: body.checklist || [],
        },
      })
      wsManager.broadcastToAll('content:created', item)
      res.json(item)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await prisma.contentCollection.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('content:updated', item)
      res.json(item)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await softDelete('content', req.params.id as string)
      wsManager.broadcastToAll('content:deleted', { id: req.params.id as string })
      res.json(result)
    } catch (err) { next(err) }
  }
}

export const contentController = new ContentController()
