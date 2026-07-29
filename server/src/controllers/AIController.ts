import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'
import { sseService } from '../services/SSEService'
import { softDelete } from '../utils/softDelete'

export class AIController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const [conversations, total] = await Promise.all([
        prisma.aIConversation.findMany({
          where: { deletedAt: null },
          orderBy: { lastActiveAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit,
          include: {
            messages: { orderBy: { timestamp: 'asc' } },
          },
        }),
        prisma.aIConversation.count({ where: { deletedAt: null } }),
      ])

      res.json({ total, page, conversations })
    } catch (err) {
      next(err)
    }
  }

  async saveConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body

      if (body.action === 'delete') {
        await prisma.aIConversation.update({
          where: { id: body.id },
          data: { deletedAt: new Date() },
        })
        wsManager.broadcastToAll('ai:conversation:deleted', { id: body.id })
        sseService.broadcast('ai_conversation', { action: 'delete', data: body })
        res.json({ success: true })
        return
      }

      if (body.action === 'rename') {
        const conv = await prisma.aIConversation.update({
          where: { id: body.id },
          data: { title: body.title },
        })
        wsManager.broadcastToAll('ai:conversation:updated', conv)
        sseService.broadcast('ai_conversation', { action: 'rename', data: body })
        res.json({ success: true })
        return
      }

      if (body.action === 'save' && body.data) {
        const data = body.data
        const existing = await prisma.aIConversation.findUnique({
          where: { id: data.id },
        })

        if (existing) {
          await prisma.aIMessage.deleteMany({ where: { conversationId: data.id } })

          const conv = await prisma.aIConversation.update({
            where: { id: data.id },
            data: {
              title: data.title,
              visitorId: data.visitorId,
              device: data.device || 'Desktop',
              browser: data.browser || '',
              status: data.status || 'ACTIVE',
              lastActiveAt: new Date(data.lastActiveAt || Date.now()),
              messages: {
                create: (data.messages || []).map((m: { id?: string; sender: string; text: string; timestamp: string }) => ({
                  id: m.id || undefined,
                  sender: m.sender,
                  text: m.text,
                  timestamp: new Date(m.timestamp || Date.now()),
                })),
              },
            },
            include: { messages: true },
          })
          wsManager.broadcastToAll('ai:conversation:updated', conv)
          sseService.broadcast('ai_conversation', { action: 'saved', data: body })
          res.json(conv)
        } else {
          const conv = await prisma.aIConversation.create({
            data: {
              id: data.id || undefined,
              visitorId: data.visitorId || 'visitor_unknown',
              title: data.title || 'New Chat',
              device: data.device || 'Desktop',
              browser: data.browser || '',
              status: data.status || 'ACTIVE',
              lastActiveAt: new Date(data.lastActiveAt || Date.now()),
              messages: {
                create: (data.messages || []).map((m: { id?: string; sender: string; text: string; timestamp: string }) => ({
                  id: m.id || undefined,
                  sender: m.sender,
                  text: m.text,
                  timestamp: new Date(m.timestamp || Date.now()),
                })),
              },
            },
            include: { messages: true },
          })
          wsManager.broadcastToAll('ai:conversation:created', conv)
          sseService.broadcast('ai_conversation', { action: 'saved', data: body })
          res.json(conv)
        }
        return
      }

      res.status(400).json({ error: 'Invalid action' })
    } catch (err) {
      next(err)
    }
  }

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body
      if (!id) {
        res.status(400).json({ error: 'Conversation id is required' })
        return
      }
      const result = await softDelete('aiConversations', id)
      wsManager.broadcastToAll('ai:conversation:deleted', { id })
      sseService.broadcast('ai_conversation', { action: 'delete', data: { id } })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getKnowledge(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await prisma.aIKnowledge.findMany({
        where: { deletedAt: null, status: 'Active' },
        orderBy: { priority: 'desc' },
      })
      res.json({ items })
    } catch (err) {
      next(err)
    }
  }

  async saveKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body

      await prisma.aIKnowledge.deleteMany({ where: {} })

      if (Array.isArray(items) && items.length > 0) {
        await prisma.aIKnowledge.createMany({
          data: items.map((item: Record<string, unknown>) => ({
            id: (item.id as string) || undefined,
            category: (item.category as string) || '',
            title: (item.title as string) || '',
            question: (item.question as string) || '',
            alternateQuestions: item.alternateQuestions ? JSON.parse(JSON.stringify(item.alternateQuestions)) : [],
            synonyms: item.synonyms ? JSON.parse(JSON.stringify(item.synonyms)) : [],
            keywords: item.keywords ? JSON.parse(JSON.stringify(item.keywords)) : [],
            description: (item.description as string) || '',
            detailedAnswer: (item.detailedAnswer as string) || '',
            shortAnswer: (item.shortAnswer as string) || '',
            answer: (item.answer as string) || '',
            relatedTopics: item.relatedTopics ? JSON.parse(JSON.stringify(item.relatedTopics)) : [],
            navigationLinks: item.navigationLinks ? JSON.parse(JSON.stringify(item.navigationLinks)) : [],
            tags: item.tags ? JSON.parse(JSON.stringify(item.tags)) : [],
            priority: (item.priority as number) || 0,
            language: (item.language as string) || 'en',
            version: (item.version as string) || '1.0',
            status: (item.status as string) || 'Active',
            author: (item.author as string) || '',
            source: (item.source as string) || '',
          })),
        })
      }

      wsManager.broadcastToAll('ai:knowledge:updated', {})
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const aiController = new AIController()
