import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class ProposalController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.proposal.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, proposals })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const proposal = await prisma.proposal.findUnique({ where: { id: req.params.id as string } })
      if (!proposal || proposal.deletedAt) {
        res.status(404).json({ error: 'Proposal not found' })
        return
      }
      res.json(proposal)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const proposal = await prisma.proposal.create({
        data: {
          proposalNumber: body.proposalNumber || `PROP-${Date.now()}`,
          clientName: body.clientName,
          clientEmail: body.clientEmail || '',
          title: body.title,
          amount: body.amount || 0,
          status: body.status || 'DRAFT',
          validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 86400000),
          downloadUrl: body.downloadUrl || '',
          scopeSummary: body.scopeSummary || '',
        },
      })
      wsManager.broadcastToAll('proposal:created', proposal)
      res.json(proposal)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const proposal = await prisma.proposal.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('proposal:updated', proposal)
      res.json(proposal)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.proposal.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('proposal:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const proposalController = new ProposalController()
