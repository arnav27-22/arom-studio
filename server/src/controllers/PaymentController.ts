import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class PaymentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.payment.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, payments })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await prisma.payment.findUnique({ where: { id: req.params.id as string } })
      if (!payment || payment.deletedAt) {
        res.status(404).json({ error: 'Payment not found' })
        return
      }
      res.json(payment)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const payment = await prisma.payment.create({
        data: {
          invoiceNumber: body.invoiceNumber,
          clientName: body.clientName,
          amount: body.amount || 0,
          dueDate: new Date(body.dueDate || Date.now()),
          paidDate: body.paidDate ? new Date(body.paidDate) : null,
          status: body.status || 'Pending',
          invoiceLink: body.invoiceLink || '',
          receiptUrl: body.receiptUrl || '',
          paymentMethod: body.paymentMethod || '',
          reminderSentCount: body.reminderSentCount || 0,
        },
      })
      wsManager.broadcastToAll('payment:created', payment)
      res.json(payment)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await prisma.payment.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('payment:updated', payment)
      res.json(payment)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.payment.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('payment:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const paymentController = new PaymentController()
