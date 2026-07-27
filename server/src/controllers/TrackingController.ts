import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { visitorController } from './VisitorController'
import { pdfController } from './PDFController'
import { linkClickController } from './LinkClickController'
import { aiController } from './AIController'
import { leadController } from './LeadController'
import { discoveryController } from './DiscoveryController'

export class TrackingController {
  async trackPageView(req: Request, res: Response, next: NextFunction) {
    try {
      return visitorController.trackPageView(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  async trackExit(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, page, timeOnPage, scrollDepth } = req.body
      if (sessionId) {
        const lastVisitor = await prisma.visitor.findFirst({
          where: { sessionId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        })
        if (lastVisitor) {
          await prisma.visitor.update({
            where: { id: lastVisitor.id },
            data: {
              exitPage: page || lastVisitor.page,
              timeOnPage: timeOnPage || lastVisitor.timeOnPage,
              scrollDepth: scrollDepth ?? lastVisitor.scrollDepth,
            },
          })
        }
      }
      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  }

  async trackClick(req: Request, res: Response, next: NextFunction) {
    try {
      return linkClickController.track(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  async savePDF(req: Request, res: Response, next: NextFunction) {
    try {
      return pdfController.save(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  async saveAIConversation(req: Request, res: Response, next: NextFunction) {
    try {
      return aiController.saveConversation(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      return leadController.create(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  async createDiscovery(req: Request, res: Response, next: NextFunction) {
    try {
      return discoveryController.create(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

export const trackingController = new TrackingController()
