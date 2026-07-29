import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'

export class CmsController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const entries = await prisma.dataStore.findMany({
        where: { collection: 'cms' },
        orderBy: { id: 'asc' },
      })
      const mapped = entries.map(e => ({
        id: e.id,
        title: (e.data as any)?.title || e.id,
        content: (e.data as any)?.content || {},
        published: (e.data as any)?.published || false,
        updated_at: (e.data as any)?.updated_at,
      }))
      res.json(mapped)
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const entry = await prisma.dataStore.findFirst({
        where: { id, collection: 'cms' },
      })
      if (!entry) {
        res.json({ id, title: id, content: {}, published: false })
        return
      }
      res.json({
        id: entry.id,
        title: (entry.data as any)?.title || entry.id,
        content: (entry.data as any)?.content || {},
        published: (entry.data as any)?.published || false,
        updated_at: (entry.data as any)?.updated_at,
      })
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const body = req.body
      const data = {
        title: body.title || id,
        content: body.content || {},
        published: body.published || false,
        updated_at: new Date().toISOString(),
      }
      await prisma.dataStore.upsert({
        where: { id },
        create: { id, collection: 'cms', data },
        update: { data },
      })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const cmsController = new CmsController()
