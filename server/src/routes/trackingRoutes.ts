import { Router } from 'express'
import { trackingController } from '../controllers/TrackingController'

const router = Router()

// Public tracking endpoints (no auth required)
router.post('/page-view', (req, res, next) => trackingController.trackPageView(req, res, next))
router.post('/pageview', (req, res, next) => trackingController.trackPageView(req, res, next))
router.post('/exit', (req, res, next) => trackingController.trackExit(req, res, next))
router.post('/click', (req, res, next) => trackingController.trackClick(req, res, next))
router.post('/save-pdf', (req, res, next) => trackingController.savePDF(req, res, next))
router.post('/save', (req, res, next) => trackingController.savePDF(req, res, next))
router.post('/ai-conversation', (req, res, next) => trackingController.saveAIConversation(req, res, next))
router.post('/lead', (req, res, next) => trackingController.createLead(req, res, next))
router.post('/leads', (req, res, next) => trackingController.createLead(req, res, next))
router.post('/discovery', (req, res, next) => trackingController.createDiscovery(req, res, next))

export default router
