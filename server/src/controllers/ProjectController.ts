import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class ProjectController {
  async getAll(req: Request, res: Response) {
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
  }

  async getOne(req: Request, res: Response) {
    const project = await prisma.project.findUnique({ where: { id: req.params.id as string } })
    if (!project || project.deletedAt) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    res.json(project)
  }

  async create(req: Request, res: Response) {
    const project = await prisma.project.create({ data: req.body })
    wsManager.broadcastToAll('project:created', project)
    res.json(project)
  }

  async update(req: Request, res: Response) {
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: req.body,
    })
    wsManager.broadcastToAll('project:updated', project)
    res.json(project)
  }

  async delete(req: Request, res: Response) {
    await prisma.project.update({
      where: { id: req.params.id as string },
      data: { deletedAt: new Date() },
    })
    wsManager.broadcastToAll('project:deleted', { id: req.params.id as string })
    res.json({ success: true })
  }
}

export const projectController = new ProjectController()
