import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class HandoverController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [handovers, total] = await Promise.all([
        prisma.handover.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.handover.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, handovers })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const handover = await prisma.handover.findUnique({ where: { id: req.params.id as string } })
      if (!handover || handover.deletedAt) {
        res.status(404).json({ error: 'Handover not found' })
        return
      }
      res.json(handover)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const handover = await prisma.handover.create({
        data: {
          projectName: body.projectName,
          clientName: body.clientName,
          status: body.status || 'Ready',
          downloadZipUrl: body.downloadZipUrl || '',
          githubLink: body.githubLink || '',
          adminLoginUrl: body.adminLoginUrl || '',
          adminUsername: body.adminUsername || '',
          domain: body.domain || '',
          hosting: body.hosting || '',
          warrantyPeriodMonths: body.warrantyPeriodMonths || 0,
          supportExpiryDate: body.supportExpiryDate ? new Date(body.supportExpiryDate) : null,
          handoverDate: new Date(body.handoverDate || Date.now()),
        },
      })
      wsManager.broadcastToAll('handover:created', handover)
      res.json(handover)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const handover = await prisma.handover.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('handover:updated', handover)
      res.json(handover)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.handover.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('handover:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const handoverController = new HandoverController()
