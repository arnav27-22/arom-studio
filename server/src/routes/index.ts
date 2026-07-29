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

// Sync endpoint - returns all data for admin store
router.get('/sync', async (_req, res, next) => {
  try {
    const { prisma } = await import('../database/prisma')
    const [visitors, pdfs, leads, invoices, logs, clients, projects,
      proposals, agreements, payments, notifications, recycleBin,
      discoveryQuestionnaires, aiConversations, linkClicks,
      contentItems, assetItems, approvalItems, timelineItems, handoverItems, feedbackItems,
      cmsEntries, taskEntries, meetingEntries, expenseEntries, incomeEntries, mediaEntries, passwordEntries] = await Promise.all([
      prisma.visitor.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.generatedPDF.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.lead.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.invoice.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.client.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.project.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.proposal.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.agreement.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.payment.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.recycleBin.findMany({ orderBy: { deletedAt: 'desc' } }),
      prisma.discoveryForm.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.aIConversation.findMany({ where: { deletedAt: null }, orderBy: { lastActiveAt: 'desc' }, include: { messages: { orderBy: { timestamp: 'asc' } } } }),
      prisma.linkClick.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.contentCollection.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.asset.findMany({ where: { deletedAt: null }, orderBy: { uploadDate: 'desc' } }),
      prisma.designApproval.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.projectTimeline.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.handover.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.feedback.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.dataStore.findMany({ where: { collection: 'cms' } }),
      prisma.dataStore.findMany({ where: { collection: 'tasks' }, orderBy: { createdAt: 'desc' } }),
      prisma.dataStore.findMany({ where: { collection: 'meetings' }, orderBy: { createdAt: 'desc' } }),
      prisma.dataStore.findMany({ where: { collection: 'expenses' }, orderBy: { createdAt: 'desc' } }),
      prisma.dataStore.findMany({ where: { collection: 'incomes' }, orderBy: { createdAt: 'desc' } }),
      prisma.dataStore.findMany({ where: { collection: 'media' }, orderBy: { createdAt: 'desc' } }),
      prisma.dataStore.findMany({ where: { collection: 'passwords' }, orderBy: { createdAt: 'desc' } }),
    ])
    res.json({
      visitors, pdfs, leads, invoices, logs, linkClicks,
      clients: clients.length ? clients : undefined,
      projects: projects.length ? projects : undefined,
      proposals: proposals.length ? proposals : undefined,
      agreements: agreements.length ? agreements : undefined,
      payments: payments.length ? payments : undefined,
      content: contentItems.length ? contentItems : undefined,
      assets: assetItems.length ? assetItems : undefined,
      approvals: approvalItems.length ? approvalItems : undefined,
      timelines: timelineItems.length ? timelineItems : undefined,
      handovers: handoverItems.length ? handoverItems : undefined,
      feedbacks: feedbackItems.length ? feedbackItems : undefined,
      notifications: notifications.length ? notifications : undefined,
      discoveryQuestionnaires,
      recycleBin, aiConversations,
      cmsContent: cmsEntries,
      tasks: taskEntries,
      meetings: meetingEntries,
      expenses: expenseEntries,
      incomes: incomeEntries,
      media: mediaEntries,
      passwords: passwordEntries,
    })
  } catch (err) { next(err) }
})

router.post('/sync', async (req, res, next) => {
  try {
    const body = req.body
    const action = body.action || body.type
    const item = body.data || body
    if (action === 'pdf' || action === 'save-pdf') {
      const { pdfController } = await import('../controllers/PDFController')
      req.body = item
      return pdfController.save(req, res, next)
    }
    if (action === 'lead') {
      const { leadController } = await import('../controllers/LeadController')
      req.body = item
      return leadController.create(req, res, next)
    }
    if (action === 'ai_conversation') {
      const { aiController } = await import('../controllers/AIController')
      req.body = { action: 'save', data: item }
      return aiController.saveConversation(req, res, next)
    }
    res.json({ success: true })
  } catch (err) { next(err) }
})

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

// Global search (requires auth)
router.get('/search', requireAuth, async (req, res, next) => {
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
