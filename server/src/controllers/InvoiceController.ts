import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class InvoiceController {
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const status = req.query.status as string

    const where: Record<string, unknown> = { deletedAt: null }
    if (status && status !== 'ALL') where.status = status.toUpperCase()

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.invoice.count({ where: where as any }),
    ])
    res.json({ total, page, invoices })
  }

  async create(req: Request, res: Response) {
    const body = req.body
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: body.invoiceNumber,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone || '',
        clientCompany: body.clientCompany || '',
        currency: body.currency || 'INR',
        items: body.items || [],
        taxRate: body.taxRate || 0,
        discountRate: body.discountRate || 0,
        subtotal: body.subtotal || 0,
        taxAmount: body.taxAmount || 0,
        discountAmount: body.discountAmount || 0,
        totalAmount: body.totalAmount || 0,
        dueDate: new Date(body.dueDate || Date.now()),
        notes: body.notes || '',
      },
    })
    wsManager.broadcastToAll('invoice:created', invoice)
    res.json({ success: true, id: invoice.id })
  }

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string
    const { status } = req.body
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: status.toUpperCase() },
    })
    wsManager.broadcastToAll('invoice:updated', invoice)
    res.json({ success: true })
  }

  async delete(req: Request, res: Response) {
    await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { deletedAt: new Date() },
    })
    wsManager.broadcastToAll('invoice:deleted', { id: req.params.id as string })
    res.json({ success: true })
  }
}

export const invoiceController = new InvoiceController()
