import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class TimelineController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const [timelines, total] = await Promise.all([
        prisma.projectTimeline.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.projectTimeline.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, timelines })
    } catch (err) { next(err) }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await prisma.projectTimeline.findUnique({ where: { id: req.params.id as string } })
      if (!timeline || timeline.deletedAt) {
        res.status(404).json({ error: 'Timeline not found' })
        return
      }
      res.json(timeline)
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      const timeline = await prisma.projectTimeline.create({
        data: {
          projectName: body.projectName,
          clientName: body.clientName,
          currentPhase: body.currentPhase || 'Planning',
          estimatedDelivery: body.estimatedDelivery || '',
          timelineProgress: body.timelineProgress || 0,
          upcomingTasks: body.upcomingTasks || [],
          completedTasks: body.completedTasks || [],
          delayedTasks: body.delayedTasks || [],
        },
      })
      wsManager.broadcastToAll('timeline:created', timeline)
      res.json(timeline)
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await prisma.projectTimeline.update({
        where: { id: req.params.id as string },
        data: req.body,
      })
      wsManager.broadcastToAll('timeline:updated', timeline)
      res.json(timeline)
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.projectTimeline.update({
        where: { id: req.params.id as string },
        data: { deletedAt: new Date() },
      })
      wsManager.broadcastToAll('timeline:deleted', { id: req.params.id as string })
      res.json({ success: true })
    } catch (err) { next(err) }
  }
}

export const timelineController = new TimelineController()
