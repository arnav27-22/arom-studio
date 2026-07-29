import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { softDelete } from '../utils/softDelete'

export class ClientController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.client.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, clients })
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await prisma.client.create({ data: req.body })
      wsManager.broadcastToAll('client:created', client)
      res.json(client)
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await prisma.client.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('client:updated', client)
      res.json(client)
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await softDelete('clients', req.params.id as string)
      wsManager.broadcastToAll('client:deleted', { id: req.params.id as string })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

export const clientController = new ClientController()
