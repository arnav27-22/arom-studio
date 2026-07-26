import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { wsManager } from '../websocket/WebSocketManager'

export class VisitorController {
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = req.query.search as string
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { deletedAt: null }
    if (search) {
      where.OR = [
        { page: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.visitor.count({ where: where as any }),
    ])

    const activeSessions = new Set(
      visitors.filter(v => {
        const fiveMinAgo = new Date(Date.now() - 5 * 60000)
        return v.createdAt >= fiveMinAgo
      }).map(v => v.sessionId).filter(Boolean)
    ).size

    res.json({
      total,
      page,
      limit,
      activeSessions,
      visitors,
    })
  }

  async deleteAll(_req: Request, res: Response) {
    await prisma.visitor.updateMany({
      where: { deletedAt: null },
      data: { deletedAt: new Date() },
    })
    wsManager.broadcastToAll('visitors:deleted', {})
    res.json({ success: true })
  }

  async deleteOne(req: Request, res: Response) {
    const id = req.params.id as string
    await prisma.visitor.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    wsManager.broadcastToAll('visitor:deleted', { id })
    res.json({ success: true })
  }

  async trackPageView(req: Request, res: Response) {
    const body = req.body
    const ua = req.headers['user-agent'] || ''
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)

    let brand = 'Desktop PC'
    if (/iPhone/i.test(ua)) brand = 'Apple iPhone'
    else if (/Samsung/i.test(ua)) brand = 'Samsung Galaxy'
    else if (/Pixel/i.test(ua)) brand = 'Google Pixel'
    else if (isMobile) brand = 'Mobile Device'

    const visitor = await prisma.visitor.create({
      data: {
        id: body.id || undefined,
        sessionId: body.sessionId || undefined,
        page: body.page || '/',
        entryPage: body.entryPage || body.page || '/',
        deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
        deviceLabel: isMobile ? 'Mobile' : 'Desktop (PC)',
        deviceBrand: brand,
        browser: body.deviceInfo?.browser || 'Chrome',
        referrer: body.referrer || 'Direct',
        timeOnPage: 30,
        scrollDepth: 80,
        pageViewsCount: body.pageViewsCount || 1,
      },
    })

    wsManager.broadcastToAll('visitor:created', visitor)
    res.json({ ok: true, id: visitor.id })
  }
}

export const visitorController = new VisitorController()
