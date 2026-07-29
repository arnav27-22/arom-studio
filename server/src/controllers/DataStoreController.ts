import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'

function toCollection(path: string): string {
  const parts = path.replace('/api/admin/', '').split('/')
  return parts[0] === 'data' && parts[1] ? parts[1] : parts[0]
}

export class DataStoreController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = toCollection(req.originalUrl)
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 200
      const [items, total] = await Promise.all([
        prisma.dataStore.findMany({
          where: { collection },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.dataStore.count({ where: { collection } }),
      ])
      const mapped = items.map(e => ({ id: e.id, ...(e.data as any), _collection: e.collection, _createdAt: e.createdAt, _updatedAt: e.updatedAt }))
      res.json({ total, page, items: mapped })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = toCollection(req.originalUrl)
      const id = req.params.id as string
      const entry = await prisma.dataStore.findFirst({ where: { id, collection } })
      if (!entry) {
        res.status(404).json({ error: 'Item not found' })
        return
      }
      res.json({ id: entry.id, ...(entry.data as any), _collection: entry.collection, _createdAt: entry.createdAt, _updatedAt: entry.updatedAt })
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = toCollection(req.originalUrl)
      const body = { ...req.body }
      const id = body.id || `${collection}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const { id: _id, ...data } = body
      const entry = await prisma.dataStore.create({
        data: { id, collection, data },
      })
      res.json({ id: entry.id, ...data, _collection: collection })
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = toCollection(req.originalUrl)
      const id = req.params.id as string
      const body = { ...req.body }
      const { id: _id, ...data } = body
      const existing = await prisma.dataStore.findFirst({ where: { id, collection } })
      if (!existing) {
        await prisma.dataStore.create({ data: { id, collection, data } })
        res.json({ id, ...data, _collection: collection })
        return
      }
      await prisma.dataStore.update({
        where: { id },
        data: { data: { ...(existing.data as any), ...data } },
      })
      res.json({ id, ...data, _collection: collection })
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = toCollection(req.originalUrl)
      const id = req.params.id as string
      await prisma.dataStore.deleteMany({ where: { id, collection } })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const dataStoreController = new DataStoreController()
