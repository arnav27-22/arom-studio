import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class RecycleController {
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50

    const [items, total] = await Promise.all([
      prisma.recycleBin.findMany({
        orderBy: { deletedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.recycleBin.count(),
    ])

    res.json({ total, page, items })
  }

  async restore(req: Request, res: Response) {
    const { id } = req.body
    const record = await prisma.recycleBin.findUnique({ where: { id } })

    if (!record) {
      res.status(404).json({ error: 'Record not found in recycle bin' })
      return
    }

    const collection = record.originalCollection
    const itemData = record.itemData as Record<string, unknown>

    // Restore to original collection
    switch (collection) {
      case 'VISITORS':
        await prisma.visitor.upsert({
          where: { id: itemData.id as string },
          update: { deletedAt: null },
          create: itemData as any,
        })
        break
      case 'PDFS':
        await prisma.generatedPDF.upsert({
          where: { id: itemData.id as string },
          update: { deletedAt: null },
          create: itemData as any,
        })
        break
      case 'LEADS':
        await prisma.lead.upsert({
          where: { id: itemData.id as string },
          update: { deletedAt: null },
          create: itemData as any,
        })
        break
      default:
        // Generic restore - create if not exists
        await prisma.recycleBin.update({
          where: { id },
          data: { restoredAt: new Date() },
        })
        break
    }

    await prisma.recycleBin.delete({ where: { id } })
    wsManager.broadcastToAll('recycle:restored', { id, collection })
    res.json({ success: true })
  }

  async permanentDelete(req: Request, res: Response) {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [req.body.id]

    await prisma.recycleBin.deleteMany({
      where: { id: { in: ids } },
    })

    wsManager.broadcastToAll('recycle:deleted', { ids })
    res.json({ success: true })
  }

  async empty(_req: Request, res: Response) {
    await prisma.recycleBin.deleteMany({})
    wsManager.broadcastToAll('recycle:emptied', {})
    res.json({ success: true })
  }
}

export const recycleController = new RecycleController()
