import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class LeadController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string

      const where: Record<string, unknown> = { deletedAt: null }
      if (status && status !== 'ALL') {
        where.status = status.toUpperCase()
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where: where as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.lead.count({ where: where as any }),
      ])

      res.json({ total, page, leads })
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const lead = await prisma.lead.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone || '',
          company: body.company || '',
          service: body.service || '',
          budget: body.budget || '',
          message: body.message || '',
          country: body.country || '',
        },
      })
      wsManager.broadcastToAll('lead:created', lead)
      res.json({ success: true, id: lead.id })
    } catch (err) {
      next(err)
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const { status } = req.body

      const lead = await prisma.lead.update({
        where: { id },
        data: { status: status.toUpperCase() },
      })

      wsManager.broadcastToAll('lead:updated', lead)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      await prisma.lead.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('lead:deleted', { id })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const leadController = new LeadController()
