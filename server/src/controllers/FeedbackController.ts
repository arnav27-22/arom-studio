import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class FeedbackController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [feedbacks, total] = await Promise.all([
        prisma.feedback.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.feedback.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, feedbacks })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const feedback = await prisma.feedback.findUnique({ where: { id: req.params.id as string } })
      if (!feedback || feedback.deletedAt) {
        res.status(404).json({ error: 'Feedback not found' })
        return
      }
      res.json(feedback)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const feedback = await prisma.feedback.create({
        data: {
          clientName: body.clientName,
          company: body.company || '',
          rating: body.rating || 0,
          review: body.review || '',
          testimonialApproved: body.testimonialApproved || false,
          portfolioPermission: body.portfolioPermission || false,
          clientSuggestions: body.clientSuggestions || '',
        },
      })
      wsManager.broadcastToAll('feedback:created', feedback)
      res.json(feedback)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const feedback = await prisma.feedback.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('feedback:updated', feedback)
      res.json(feedback)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.feedback.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('feedback:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const feedbackController = new FeedbackController()
