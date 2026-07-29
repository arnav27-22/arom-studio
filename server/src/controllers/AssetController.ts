import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class AssetController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where: { deletedAt: null },
          orderBy: { uploadDate: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.asset.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, assets })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await prisma.asset.findUnique({ where: { id: req.params.id as string } })
      if (!asset || asset.deletedAt) {
        res.status(404).json({ error: 'Asset not found' })
        return
      }
      res.json(asset)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const asset = await prisma.asset.create({
        data: {
          clientName: body.clientName,
          projectName: body.projectName || '',
          googleDriveLink: body.googleDriveLink || '',
          folderStatus: body.folderStatus || 'Needs Files',
          missingFilesCount: body.missingFilesCount || 0,
          uploadDate: body.uploadDate || new Date().toISOString(),
          checklist: body.checklist || [],
        },
      })
      wsManager.broadcastToAll('asset:created', asset)
      res.json(asset)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await prisma.asset.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('asset:updated', asset)
      res.json(asset)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.asset.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('asset:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const assetController = new AssetController()
