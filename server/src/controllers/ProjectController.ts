import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { softDelete } from '../utils/softDelete'

export class ProjectController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.project.count({ where: { deletedAt: null } }),
      ])
      res.json({ total, page, projects })
    } catch (err) {
      next(err)
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await prisma.project.findUnique({ where: { id: req.params.id as string } })
      if (!project || project.deletedAt) {
        res.status(404).json({ error: 'Project not found' })
        return
      }
      res.json(project)
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body }
      if (data.status) data.status = data.status.toUpperCase()
      if (data.launchStatus) data.launchStatus = data.launchStatus.toUpperCase()
      const project = await prisma.project.create({ data })
      wsManager.broadcastToAll('project:created', project)
      res.json(project)
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body }
      if (data.status) data.status = data.status.toUpperCase()
      if (data.launchStatus) data.launchStatus = data.launchStatus.toUpperCase()
      const project = await prisma.project.update({
        where: { id: req.params.id as string },
        data,
      })
      wsManager.broadcastToAll('project:updated', project)
      res.json(project)
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await softDelete('projects', req.params.id as string)
      wsManager.broadcastToAll('project:deleted', { id: req.params.id as string })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

export const projectController = new ProjectController()
