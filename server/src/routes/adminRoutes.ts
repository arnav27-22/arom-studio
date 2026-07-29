import { Router } from 'express'
import { authController } from '../controllers/AuthController'
import { dashboardController } from '../controllers/DashboardController'
import { statisticsController } from '../controllers/StatisticsController'
import { visitorController } from '../controllers/VisitorController'
import { pdfController } from '../controllers/PDFController'
import { leadController } from '../controllers/LeadController'
import { aiController } from '../controllers/AIController'
import { invoiceController } from '../controllers/InvoiceController'
import { projectController } from '../controllers/ProjectController'
import { clientController } from '../controllers/ClientController'
import { recycleController } from '../controllers/RecycleController'
import { logController } from '../controllers/LogController'
import { linkClickController } from '../controllers/LinkClickController'
import { settingsController } from '../controllers/SettingsController'
import { notificationController } from '../controllers/NotificationController'
import { searchController } from '../controllers/SearchController'
import { discoveryController } from '../controllers/DiscoveryController'
import { blogController } from '../controllers/BlogController'
import { sseService } from '../services/SSEService'
import { requireAuth } from '../middleware/auth'
import { rateLimiter, loginRateLimiter } from '../middleware/rateLimiter'
import { auditLog } from '../middleware/auditLogger'
import { validate } from '../middleware/validate'
import {
  loginSchema,
  leadCreateSchema,
  leadUpdateSchema,
  invoiceCreateSchema,
  projectCreateSchema,
  clientCreateSchema,
  settingUpdateSchema,
  discoveryCreateSchema,
  linkClickSchema,
  visitorCreateSchema,
  aiConversationSaveSchema,
  aiKnowledgeSaveSchema,
} from '../utils/validation'

const router = Router()

// Auth (no auth required, rate-limited) - Match frontend expectations
router.get('/auth', (req, res, next) => authController.check(req, res, next))
router.post('/auth', loginRateLimiter, async (req, res, next) => {
  try {
    const { action, password } = req.body
    if (action === 'login') {
      req.body = { password }
      return authController.login(req, res, next)
    }
    if (action === 'logout') {
      return authController.logout(req, res, next)
    }
    res.status(400).json({ error: 'Invalid action' })
  } catch (err) { next(err) }
})
router.post('/auth/login', loginRateLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next))
router.post('/auth/check', loginRateLimiter, (req, res, next) => authController.check(req, res, next))
router.post('/auth/logout', loginRateLimiter, (req, res, next) => authController.logout(req, res, next))
router.get('/auth/ws-token', (req, res, next) => authController.wsToken(req, res, next))

// All routes below require authentication
router.use('/', requireAuth)

// Standard rate limiter for all admin API routes
router.use('/', rateLimiter)

// Dashboard
router.get('/dashboard/overview', (req, res, next) => dashboardController.getOverview(req, res, next))
router.get('/dashboard/activity', (req, res, next) => dashboardController.getActivity(req, res, next))

// Statistics
router.get('/statistics/dashboard', (req, res, next) => statisticsController.getDashboard(req, res, next))
router.get('/statistics/analytics', (req, res, next) => statisticsController.getAnalytics(req, res, next))

// Visitors
router.get('/visitors', (req, res, next) => visitorController.getAll(req, res, next))
router.post('/visitors/delete-all', auditLog('DELETE_ALL_VISITORS', 'visitors'), (req, res, next) => visitorController.deleteAll(req, res, next))
router.delete('/visitors/:id', auditLog('DELETE_VISITOR', 'visitors'), (req, res, next) => visitorController.deleteOne(req, res, next))
router.post('/visitors/track-page-view', auditLog('TRACK_PAGE_VIEW', 'visitors'), validate(visitorCreateSchema), (req, res, next) => visitorController.trackPageView(req, res, next))

// PDFs
router.get('/pdfs', (req, res, next) => pdfController.getAll(req, res, next))
router.get('/pdfs/:id', (req, res, next) => pdfController.getOne(req, res, next))
router.get('/pdfs/:id/download', (req, res, next) => pdfController.download(req, res, next))
router.get('/pdfs/:id/preview', (req, res, next) => pdfController.preview(req, res, next))
router.delete('/pdfs/:id', auditLog('DELETE_PDF', 'pdfs'), (req, res, next) => pdfController.delete(req, res, next))
router.post('/pdfs/save', auditLog('SAVE_PDF', 'pdfs'), (req, res, next) => pdfController.save(req, res, next))

// Leads
router.get('/leads', (req, res, next) => leadController.getAll(req, res, next))
router.post('/leads', auditLog('CREATE_LEAD', 'leads'), validate(leadCreateSchema), (req, res, next) => leadController.create(req, res, next))
router.patch('/leads/:id/status', auditLog('UPDATE_LEAD_STATUS', 'leads'), validate(leadUpdateSchema), (req, res, next) => leadController.updateStatus(req, res, next))
router.delete('/leads/:id', auditLog('DELETE_LEAD', 'leads'), (req, res, next) => leadController.delete(req, res, next))

// AI
router.get('/ai/conversations', (req, res, next) => aiController.getConversations(req, res, next))
router.post('/ai/conversations', auditLog('SAVE_AI_CONVERSATION', 'ai'), (req, res, next) => aiController.saveConversation(req, res, next))
router.delete('/ai/conversations', auditLog('DELETE_AI_CONVERSATION', 'ai'), (req, res, next) => aiController.deleteConversation(req, res, next))
router.get('/ai/knowledge', (req, res, next) => aiController.getKnowledge(req, res, next))
router.post('/ai/knowledge/save', auditLog('SAVE_AI_KNOWLEDGE', 'ai'), validate(aiKnowledgeSaveSchema), (req, res, next) => aiController.saveKnowledge(req, res, next))

// Invoices
router.get('/invoices', (req, res, next) => invoiceController.getAll(req, res, next))
router.post('/invoices', auditLog('CREATE_INVOICE', 'invoices'), validate(invoiceCreateSchema), (req, res, next) => invoiceController.create(req, res, next))
router.patch('/invoices/:id/status', auditLog('UPDATE_INVOICE_STATUS', 'invoices'), (req, res, next) => invoiceController.updateStatus(req, res, next))
router.delete('/invoices/:id', auditLog('DELETE_INVOICE', 'invoices'), (req, res, next) => invoiceController.delete(req, res, next))

// Projects
router.get('/projects', (req, res, next) => projectController.getAll(req, res, next))
router.get('/projects/:id', (req, res, next) => projectController.getOne(req, res, next))
router.post('/projects', auditLog('CREATE_PROJECT', 'projects'), validate(projectCreateSchema), (req, res, next) => projectController.create(req, res, next))
router.put('/projects/:id', auditLog('UPDATE_PROJECT', 'projects'), validate(projectCreateSchema), (req, res, next) => projectController.update(req, res, next))
router.delete('/projects/:id', auditLog('DELETE_PROJECT', 'projects'), (req, res, next) => projectController.delete(req, res, next))

// Clients
router.get('/clients', (req, res, next) => clientController.getAll(req, res, next))
router.post('/clients', auditLog('CREATE_CLIENT', 'clients'), validate(clientCreateSchema), (req, res, next) => clientController.create(req, res, next))
router.put('/clients/:id', auditLog('UPDATE_CLIENT', 'clients'), validate(clientCreateSchema), (req, res, next) => clientController.update(req, res, next))
router.delete('/clients/:id', auditLog('DELETE_CLIENT', 'clients'), (req, res, next) => clientController.delete(req, res, next))

// Recycle Bin
router.get('/recycle', (req, res, next) => recycleController.getAll(req, res, next))
router.post('/recycle/restore', auditLog('RESTORE_RECYCLE', 'recycle'), (req, res, next) => recycleController.restore(req, res, next))
router.post('/recycle/permanent-delete', auditLog('PERMANENT_DELETE_RECYCLE', 'recycle'), (req, res, next) => recycleController.permanentDelete(req, res, next))
router.post('/recycle/empty', auditLog('EMPTY_RECYCLE', 'recycle'), (req, res, next) => recycleController.empty(req, res, next))

// Audit Logs
router.get('/logs', (req, res, next) => logController.getAll(req, res, next))

// Link Clicks
router.get('/link-clicks', (req, res, next) => linkClickController.getAll(req, res, next))
router.post('/link-clicks/track', auditLog('TRACK_LINK_CLICK', 'linkClicks'), validate(linkClickSchema), (req, res, next) => linkClickController.track(req, res, next))
router.delete('/link-clicks/:id', auditLog('DELETE_LINK_CLICK', 'linkClicks'), (req, res, next) => linkClickController.delete(req, res, next))

// Settings
router.get('/settings', (req, res, next) => settingsController.get(req, res, next))
router.post('/settings', auditLog('UPDATE_SETTINGS', 'settings'), validate(settingUpdateSchema), (req, res, next) => settingsController.update(req, res, next))

// Notifications
router.get('/notifications', (req, res, next) => notificationController.getAll(req, res, next))
router.post('/notifications/:id/read', auditLog('MARK_NOTIFICATION_READ', 'notifications'), (req, res, next) => notificationController.markRead(req, res, next))
router.post('/notifications/read-all', auditLog('MARK_ALL_NOTIFICATIONS_READ', 'notifications'), (req, res, next) => notificationController.markAllRead(req, res, next))
router.delete('/notifications/:id', auditLog('DELETE_NOTIFICATION', 'notifications'), (req, res, next) => notificationController.delete(req, res, next))

// Search
router.get('/search', (req, res, next) => searchController.globalSearch(req, res, next))

// Discovery Forms
router.get('/discovery', (req, res, next) => discoveryController.getAll(req, res, next))
router.post('/discovery', auditLog('CREATE_DISCOVERY', 'discovery'), validate(discoveryCreateSchema), (req, res, next) => discoveryController.create(req, res, next))
router.delete('/discovery/:id', auditLog('DELETE_DISCOVERY', 'discovery'), (req, res, next) => discoveryController.delete(req, res, next))

// Blogs
router.get('/blogs', (req, res, next) => blogController.list(req, res, next))
router.post('/blogs', auditLog('CREATE_BLOG', 'blogs'), (req, res, next) => blogController.create(req, res, next))
router.put('/blogs/:id', auditLog('UPDATE_BLOG', 'blogs'), (req, res, next) => blogController.update(req, res, next))
router.delete('/blogs/:id', auditLog('DELETE_BLOG', 'blogs'), (req, res, next) => blogController.delete(req, res, next))

// Server-Sent Events for real-time admin updates
router.get('/events', (req, res) => {
  sseService.addClient(res)
})

// Blog slug-based lookup (adminStore passes slug as identifier)
router.put('/blogs/slug/:slug', auditLog('UPDATE_BLOG', 'blogs'), async (req, res, next) => {
  try {
    const { prisma } = await import('../database/prisma')
    const slug = String(req.params.slug)
    const blog = await prisma.blog.findUnique({ where: { slug } })
    if (!blog || blog.deletedAt) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }
    req.params.id = blog.id
    blogController.update(req, res, next)
  } catch (err) {
    next(err)
  }
})
router.delete('/blogs/slug/:slug', auditLog('DELETE_BLOG', 'blogs'), async (req, res, next) => {
  try {
    const { prisma } = await import('../database/prisma')
    const slug = String(req.params.slug)
    const blog = await prisma.blog.findUnique({ where: { slug } })
    if (!blog || blog.deletedAt) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }
    req.params.id = blog.id
    blogController.delete(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router
