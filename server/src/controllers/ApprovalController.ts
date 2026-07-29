import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { softDelete } from '../utils/softDelete'

export class ApprovalController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [approvals, total] = await Promise.all([
        prisma.designApproval.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.designApproval.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, approvals })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const approval = await prisma.designApproval.findUnique({ where: { id: req.params.id as string } })
      if (!approval || approval.deletedAt) {
        res.status(404).json({ error: 'Approval not found' })
        return
      }
      res.json(approval)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const approval = await prisma.designApproval.create({
        data: {
          projectName: body.projectName,
          clientName: body.clientName,
          status: body.status || 'Waiting Approval',
          approvalDate: body.approvalDate ? new Date(body.approvalDate) : null,
          previewUrl: body.previewUrl || '',
          comments: body.comments || [],
          version: body.version || '1.0',
        },
      })
      wsManager.broadcastToAll('approval:created', approval)
      res.json(approval)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const approval = await prisma.designApproval.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('approval:updated', approval)
      res.json(approval)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await softDelete('approvals', req.params.id as string)
      wsManager.broadcastToAll('approval:deleted', { id: req.params.id as string })
      res.json(result)
    } catch (err) { next(err) }
  }
}

export const approvalController = new ApprovalController()
