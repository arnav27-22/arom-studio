import { Router } from 'express'
import { trackingController } from '../controllers/TrackingController'

const router = Router()

// Public tracking endpoints (no auth required)
router.post('/page-view', (req, res) => trackingController.trackPageView(req, res))
router.post('/pageview', (req, res) => trackingController.trackPageView(req, res))
router.post('/exit', (req, res) => trackingController.trackExit(req, res))
router.post('/click', (req, res) => trackingController.trackClick(req, res))
router.post('/save-pdf', (req, res) => trackingController.savePDF(req, res))
router.post('/save', (req, res) => trackingController.savePDF(req, res))
router.post('/ai-conversation', (req, res) => trackingController.saveAIConversation(req, res))

export default router
