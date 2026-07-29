import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { restoreFromRecycle } from '../utils/restoreFromRecycle'

export class RecycleController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (err) {
      next(err)
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, recycleIds, bulk } = req.body

      if (bulk && Array.isArray(recycleIds)) {
        const restoredItems: any[] = []
        for (const recycleId of recycleIds) {
          const record = await prisma.recycleBin.findUnique({ where: { id: recycleId } })
          if (record) {
            const success = await restoreFromRecycle(record)
            if (success) {
              await prisma.recycleBin.delete({ where: { id: recycleId } })
              restoredItems.push({ recycleId, originalCollection: record.originalCollection, itemData: record.itemData })
            }
          }
        }
        wsManager.broadcastToAll('recycle:restored', { ids: recycleIds })
        res.json({ success: true, restoredItems })
        return
      }

      const record = await prisma.recycleBin.findUnique({ where: { id } })
      if (!record) {
        res.status(404).json({ error: 'Record not found in recycle bin' })
        return
      }

      const success = await restoreFromRecycle(record)
      if (!success) {
        await prisma.recycleBin.update({
          where: { id },
          data: { restoredAt: new Date() },
        })
      }

      await prisma.recycleBin.delete({ where: { id } })
      wsManager.broadcastToAll('recycle:restored', { id, collection: record.originalCollection })
      res.json({ success: true, originalCollection: record.originalCollection, itemData: record.itemData })
    } catch (err) {
      next(err)
    }
  }

  async permanentDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = Array.isArray(req.body.ids) ? req.body.ids : [req.body.id]

      await prisma.recycleBin.deleteMany({
        where: { id: { in: ids } },
      })

      wsManager.broadcastToAll('recycle:deleted', { ids })
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async empty(_req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.recycleBin.deleteMany({})
      wsManager.broadcastToAll('recycle:emptied', {})
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const recycleController = new RecycleController()
