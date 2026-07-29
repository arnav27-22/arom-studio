import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { sseService } from '../services/SSEService'
import { storePDF, retrievePDF, verifyPDFIntegrity, generateReferenceNumber } from '../services/PDFStorageService'

export class PDFController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const search = req.query.search as string
      const status = req.query.status as string

      const where: Record<string, unknown> = { deletedAt: null }
      if (search) {
        where.OR = [
          { clientName: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { referenceNumber: { contains: search, mode: 'insensitive' } },
          { agreementId: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (status) where.status = status

      const [pdfs, total] = await Promise.all([
        prisma.generatedPDF.findMany({
          where: where as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.generatedPDF.count({ where: where as any }),
      ])

      const totalDownloads = pdfs.reduce((sum, p) => sum + p.downloadCount, 0)

      res.json({ total, page, limit, totalDownloads, pdfs })
    } catch (err) {
      next(err)
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await prisma.generatedPDF.findUnique({
        where: { id: req.params.id as string },
      })
      if (!pdf || pdf.deletedAt) {
        res.status(404).json({ error: 'PDF not found' })
        return
      }
      res.json(pdf)
    } catch (err) {
      next(err)
    }
  }

  async save(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body

      let pdfBuffer: Buffer | null = null

      if (body.pdfDataUrl) {
        const base64 = body.pdfDataUrl.replace(/^data:application\/pdf;base64,/, '')
        pdfBuffer = Buffer.from(base64, 'base64')
      } else if (body.pdfBase64) {
        pdfBuffer = Buffer.from(body.pdfBase64, 'base64')
      }

      if (!pdfBuffer || pdfBuffer.length === 0) {
        res.status(400).json({ error: 'No PDF data provided' })
        return
      }

      const clientName = body.clientName || 'Client'
      const pdfType = body.pdfType || 'Document'
      const title = body.title || body.storageKey || generateFileName(clientName, pdfType)

      const stored = await storePDF(pdfBuffer, clientName, pdfType, {
        title,
        clientEmail: body.clientEmail,
        company: body.company,
        phone: body.phone,
        agreementId: body.agreementId || body.referenceNumber,
        visitorId: body.visitorId,
        sessionId: body.sessionId,
      })

      const existingHash = await prisma.generatedPDF.findFirst({
        where: { sha256Hash: stored.sha256Hash, deletedAt: null },
      })
      if (existingHash) {
        const match = verifyPDFIntegrity(pdfBuffer, existingHash.sha256Hash || '')
        if (match) {
          res.json({ ok: true, id: existingHash.id, duplicate: true, sha256Hash: stored.sha256Hash })
          return
        }
      }

      const referenceNumber = generateReferenceNumber()

      const pdf = await prisma.generatedPDF.create({
        data: {
          pdfType,
          title,
          clientName,
          clientEmail: body.clientEmail || '',
          company: body.company || '',
          phone: body.phone || '',
          fileSizeKb: stored.fileSizeKb,
          deviceType: body.deviceType || '',
          browser: body.browser || '',
          os: body.os || '',
          pdfDataUrl: '',
          storageUrl: stored.storageUrl,
          storageProvider: stored.storageProvider,
          sha256Hash: stored.sha256Hash,
          pageCount: stored.pageCount,
          referenceNumber,
          agreementId: body.agreementId || referenceNumber,
          version: body.version || '1.0.0',
          status: 'Final',
          downloadCount: 0,
          fileName: stored.fileName,
          visitorId: body.visitorId || '',
          sessionId: body.sessionId || '',
        },
      })

      wsManager.broadcastToAll('pdf:created', pdf)
      sseService.broadcast('pdf', { action: 'created', data: pdf })
      res.json({ ok: true, id: pdf.id, sha256Hash: stored.sha256Hash, referenceNumber })
    } catch (err) {
      next(err)
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await prisma.generatedPDF.findUnique({
        where: { id: req.params.id as string },
      })
      if (!pdf || pdf.deletedAt) {
        res.status(404).json({ error: 'PDF not found' })
        return
      }

      let buffer: Buffer | null = null

      if (pdf.storageUrl) {
        buffer = await retrievePDF(pdf.storageUrl)
      }

      if (!buffer && pdf.pdfDataUrl) {
        const base64 = pdf.pdfDataUrl.replace(/^data:application\/pdf;base64,/, '')
        buffer = Buffer.from(base64, 'base64')
      }

      if (!buffer) {
        res.status(404).json({ error: 'PDF data not available' })
        return
      }

      const hashOk = pdf.sha256Hash ? verifyPDFIntegrity(buffer, pdf.sha256Hash) : true

      await prisma.generatedPDF.update({
        where: { id: pdf.id },
        data: { downloadCount: { increment: 1 } },
      })

      const downloadName = pdf.fileName || `${(pdf.title || pdf.pdfType).replace(/\s+/g, '_')}.pdf`

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)
      res.setHeader('Content-Length', buffer.length)
      if (pdf.sha256Hash) {
        res.setHeader('X-SHA256-Hash', pdf.sha256Hash)
        res.setHeader('X-Integrity-Verified', hashOk ? 'true' : 'false')
      }
      res.end(buffer)
    } catch (err) {
      next(err)
    }
  }

  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await prisma.generatedPDF.findUnique({
        where: { id: req.params.id as string },
      })
      if (!pdf || pdf.deletedAt) {
        res.status(404).json({ error: 'PDF not found' })
        return
      }

      let buffer: Buffer | null = null

      if (pdf.storageUrl) {
        buffer = await retrievePDF(pdf.storageUrl)
      }

      if (!buffer && pdf.pdfDataUrl) {
        const base64 = pdf.pdfDataUrl.replace(/^data:application\/pdf;base64,/, '')
        buffer = Buffer.from(base64, 'base64')
      }

      if (!buffer) {
        res.status(404).json({ error: 'PDF data not available' })
        return
      }

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${pdf.fileName || 'document.pdf'}"`)
      res.setHeader('Content-Length', buffer.length)
      res.end(buffer)
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const pdf = await prisma.generatedPDF.findUnique({ where: { id } })
      if (!pdf) {
        res.status(404).json({ error: 'PDF not found' })
        return
      }

      await prisma.generatedPDF.update({
        where: { id },
        data: { deletedAt: new Date() },
      })

      wsManager.broadcastToAll('pdf:deleted', { id })
      res.json({ success: true, recycleItem: pdf })
    } catch (err) {
      next(err)
    }
  }
}

function generateFileName(clientName: string, pdfType: string): string {
  const date = new Date().toISOString().split('T')[0]
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  return `${safe(pdfType)}_${safe(clientName)}_${date}.pdf`
}

export const pdfController = new PDFController()
