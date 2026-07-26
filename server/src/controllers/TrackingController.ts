import { Request, Response } from 'express'
import { visitorController } from './VisitorController'
import { pdfController } from './PDFController'
import { linkClickController } from './LinkClickController'
import { aiController } from './AIController'

export class TrackingController {
  async trackPageView(req: Request, res: Response) {
    return visitorController.trackPageView(req, res)
  }

  async trackExit(req: Request, res: Response) {
    res.json({ ok: true })
  }

  async trackClick(req: Request, res: Response) {
    return linkClickController.track(req, res)
  }

  async savePDF(req: Request, res: Response) {
    return pdfController.save(req, res)
  }

  async saveAIConversation(req: Request, res: Response) {
    return aiController.saveConversation(req, res)
  }
}

export const trackingController = new TrackingController()

