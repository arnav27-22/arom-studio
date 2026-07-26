import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class PDFController {
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50

    const [pdfs, total] = await Promise.all([
      prisma.generatedPDF.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.generatedPDF.count({ where: { deletedAt: null } }),
    ])

    res.json({ total, page, pdfs })
  }

  async getOne(req: Request, res: Response) {
    const pdf = await prisma.generatedPDF.findUnique({
      where: { id: req.params.id as string },
    })
    if (!pdf || pdf.deletedAt) {
      res.status(404).json({ error: 'PDF not found' })
      return
    }
    res.json(pdf)
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string
    await prisma.generatedPDF.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    wsManager.broadcastToAll('pdf:deleted', { id })
    res.json({ success: true })
  }

  async save(req: Request, res: Response) {
    const body = req.body
    const pdf = await prisma.generatedPDF.create({
      data: {
        pdfType: body.pdfType || 'Document',
        title: body.title || body.storageKey || 'PDF Document',
        clientName: body.clientName || 'Client',
        clientEmail: body.clientEmail || '',
        fileSizeKb: body.fileSizeKb || 180,
        deviceType: body.deviceType || 'desktop',
        browser: body.browser || '',
        os: body.os || '',
        pdfDataUrl: body.pdfDataUrl || '',
      },
    })
    wsManager.broadcastToAll('pdf:created', pdf)
    res.json({ ok: true, id: pdf.id })
  }
}

export const pdfController = new PDFController()
