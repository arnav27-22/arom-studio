import { Router } from 'express'
import adminRoutes from './adminRoutes'
import trackingRoutes from './trackingRoutes'
import healthRoutes from './healthRoutes'
import openapiRoutes from './openapiRoutes'
import { requireAuth, requireRole } from '../middleware/auth'
import { rateLimiter } from '../middleware/rateLimiter'

const router = Router()

router.use('/admin', adminRoutes)
router.use('/track', trackingRoutes)
router.use('/', healthRoutes)
router.use('/', openapiRoutes)

// Blog public routes
router.get('/blog/:slug', async (req, res, next) => {
  try {
    const { blogService } = await import('../services/BlogService')
    const blog = await blogService.getBySlug(req.params.slug)
    res.json(blog)
  } catch (err) {
    next(err)
  }
})

// Storage upload endpoint (requires auth)
router.post('/upload', requireAuth, rateLimiter, async (req, res, next) => {
  try {
    const { uploadFile } = await import('../storage/service')
    const buffer = Buffer.from(req.body.file?.data || req.body.file || '', 'base64')
    const result = await uploadFile(
      buffer,
      req.body.filename || 'upload.bin',
      req.body.mimeType || 'application/octet-stream',
      req.body.module,
      req.body.resourceId
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// Global search (keep for backward compat)
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q as string
    if (!query || query.length < 2) {
      res.json({ results: [] })
      return
    }
    const { searchService } = await import('../services/SearchService')
    const limit = parseInt(req.query.limit as string) || 20
    const results = await searchService.globalSearch(query, limit)
    res.json({ results })
  } catch (err) {
    next(err)
  }
})

// Backup endpoints (require SUPER_ADMIN or ADMIN role)
router.post('/backup', requireAuth, requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { createBackup } = await import('../backup/index')
    const result = await createBackup()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/backups', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), async (_req, res, next) => {
  try {
    const { listBackups } = await import('../backup/index')
    const backups = await listBackups()
    res.json({ backups })
  } catch (err) {
    next(err)
  }
})

router.post('/backup/verify', requireAuth, requireRole('SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const { verifyLatestBackup } = await import('../backup/index')
    const result = await verifyLatestBackup()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router
