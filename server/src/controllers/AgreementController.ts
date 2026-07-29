import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { softDelete } from '../utils/softDelete'

export class AgreementController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [agreements, total] = await Promise.all([
        prisma.agreement.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.agreement.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, agreements })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const agreement = await prisma.agreement.findUnique({ where: { id: req.params.id as string } })
      if (!agreement || agreement.deletedAt) {
        res.status(404).json({ error: 'Agreement not found' })
        return
      }
      res.json(agreement)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const agreement = await prisma.agreement.create({
        data: {
          agreementNumber: body.agreementNumber || `AGR-${Date.now()}`,
          clientName: body.clientName,
          clientEmail: body.clientEmail || '',
          status: (body.status || 'PENDING').toUpperCase(),
          agreementVersion: body.agreementVersion || '1.0',
          signedDate: body.signedDate ? new Date(body.signedDate) : null,
          downloadUrl: body.downloadUrl || '',
        },
      })
      wsManager.broadcastToAll('agreement:created', agreement)
      res.json(agreement)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body }
      if (data.status) data.status = data.status.toUpperCase()
      const agreement = await prisma.agreement.update({
        where: { id: req.params.id as string },
        data,
      })
      wsManager.broadcastToAll('agreement:updated', agreement)
      res.json(agreement)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await softDelete('agreements', req.params.id as string)
      wsManager.broadcastToAll('agreement:deleted', { id: req.params.id as string })
      res.json(result)
    } catch (err) { next(err) }
  }
}

export const agreementController = new AgreementController()
