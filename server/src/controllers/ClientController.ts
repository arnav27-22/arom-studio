import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class ClientController {
  async getAll(req: Request, res: Response) {
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
  }

  async create(req: Request, res: Response) {
    const client = await prisma.client.create({ data: req.body })
    wsManager.broadcastToAll('client:created', client)
    res.json(client)
  }

  async update(req: Request, res: Response) {
    const client = await prisma.client.update({
      where: { id: req.params.id as string },
      data: req.body,
    })
    wsManager.broadcastToAll('client:updated', client)
    res.json(client)
  }

  async delete(req: Request, res: Response) {
    await prisma.client.update({
      where: { id: req.params.id as string },
      data: { deletedAt: new Date() },
    })
    wsManager.broadcastToAll('client:deleted', { id: req.params.id as string })
    res.json({ success: true })
  }
}

export const clientController = new ClientController()
