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

// Auth (no auth required, rate-limited)
router.post('/auth/login', loginRateLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next))
router.post('/auth/check', loginRateLimiter, (req, res, _next) => { authController.check(req, res) })
router.post('/auth/logout', loginRateLimiter, (req, res, _next) => { authController.logout(req, res) })

// All routes below require authentication
router.use('/', requireAuth)

// Standard rate limiter for all admin API routes
router.use('/', rateLimiter)

// Dashboard
router.get('/dashboard/overview', (req, res) => dashboardController.getOverview(req, res))
router.get('/dashboard/activity', (req, res) => dashboardController.getActivity(req, res))

// Statistics
router.get('/statistics/dashboard', (req, res) => statisticsController.getDashboard(req, res))
router.get('/statistics/analytics', (req, res) => statisticsController.getAnalytics(req, res))

// Visitors
router.get('/visitors', (req, res) => visitorController.getAll(req, res))
router.post('/visitors/delete-all', auditLog('DELETE_ALL_VISITORS', 'visitors'), (req, res) => visitorController.deleteAll(req, res))
router.delete('/visitors/:id', auditLog('DELETE_VISITOR', 'visitors'), (req, res) => visitorController.deleteOne(req, res))
router.post('/visitors/track-page-view', auditLog('TRACK_PAGE_VIEW', 'visitors'), validate(visitorCreateSchema), (req, res) => visitorController.trackPageView(req, res))

// PDFs
router.get('/pdfs', (req, res) => pdfController.getAll(req, res))
router.get('/pdfs/:id', (req, res) => pdfController.getOne(req, res))
router.delete('/pdfs/:id', auditLog('DELETE_PDF', 'pdfs'), (req, res) => pdfController.delete(req, res))
router.post('/pdfs/save', auditLog('SAVE_PDF', 'pdfs'), (req, res) => pdfController.save(req, res))

// Leads
router.get('/leads', (req, res) => leadController.getAll(req, res))
router.post('/leads', auditLog('CREATE_LEAD', 'leads'), validate(leadCreateSchema), (req, res) => leadController.create(req, res))
router.patch('/leads/:id/status', auditLog('UPDATE_LEAD_STATUS', 'leads'), validate(leadUpdateSchema), (req, res) => leadController.updateStatus(req, res))
router.delete('/leads/:id', auditLog('DELETE_LEAD', 'leads'), (req, res) => leadController.delete(req, res))

// AI
router.get('/ai/conversations', (req, res) => aiController.getConversations(req, res))
router.post('/ai/conversations', auditLog('SAVE_AI_CONVERSATION', 'ai'), (req, res) => aiController.saveConversation(req, res))
router.delete('/ai/conversations', auditLog('DELETE_AI_CONVERSATION', 'ai'), (req, res) => aiController.saveConversation(req, res))
router.get('/ai/knowledge', (req, res) => aiController.getKnowledge(req, res))
router.post('/ai/knowledge/save', auditLog('SAVE_AI_KNOWLEDGE', 'ai'), validate(aiKnowledgeSaveSchema), (req, res) => aiController.saveKnowledge(req, res))

// Invoices
router.get('/invoices', (req, res) => invoiceController.getAll(req, res))
router.post('/invoices', auditLog('CREATE_INVOICE', 'invoices'), validate(invoiceCreateSchema), (req, res) => invoiceController.create(req, res))
router.patch('/invoices/:id/status', auditLog('UPDATE_INVOICE_STATUS', 'invoices'), (req, res) => invoiceController.updateStatus(req, res))
router.delete('/invoices/:id', auditLog('DELETE_INVOICE', 'invoices'), (req, res) => invoiceController.delete(req, res))

// Projects
router.get('/projects', (req, res) => projectController.getAll(req, res))
router.get('/projects/:id', (req, res) => projectController.getOne(req, res))
router.post('/projects', auditLog('CREATE_PROJECT', 'projects'), validate(projectCreateSchema), (req, res) => projectController.create(req, res))
router.put('/projects/:id', auditLog('UPDATE_PROJECT', 'projects'), validate(projectCreateSchema), (req, res) => projectController.update(req, res))
router.delete('/projects/:id', auditLog('DELETE_PROJECT', 'projects'), (req, res) => projectController.delete(req, res))

// Clients
router.get('/clients', (req, res) => clientController.getAll(req, res))
router.post('/clients', auditLog('CREATE_CLIENT', 'clients'), validate(clientCreateSchema), (req, res) => clientController.create(req, res))
router.put('/clients/:id', auditLog('UPDATE_CLIENT', 'clients'), validate(clientCreateSchema), (req, res) => clientController.update(req, res))
router.delete('/clients/:id', auditLog('DELETE_CLIENT', 'clients'), (req, res) => clientController.delete(req, res))

// Recycle Bin
router.get('/recycle', (req, res) => recycleController.getAll(req, res))
router.post('/recycle/restore', auditLog('RESTORE_RECYCLE', 'recycle'), (req, res) => recycleController.restore(req, res))
router.post('/recycle/permanent-delete', auditLog('PERMANENT_DELETE_RECYCLE', 'recycle'), (req, res) => recycleController.permanentDelete(req, res))
router.post('/recycle/empty', auditLog('EMPTY_RECYCLE', 'recycle'), (req, res) => recycleController.empty(req, res))

// Audit Logs
router.get('/logs', (req, res) => logController.getAll(req, res))

// Link Clicks
router.get('/link-clicks', (req, res) => linkClickController.getAll(req, res))
router.post('/link-clicks/track', auditLog('TRACK_LINK_CLICK', 'linkClicks'), validate(linkClickSchema), (req, res) => linkClickController.track(req, res))
router.delete('/link-clicks/:id', auditLog('DELETE_LINK_CLICK', 'linkClicks'), (req, res) => linkClickController.delete(req, res))

// Settings
router.get('/settings', (req, res) => settingsController.get(req, res))
router.post('/settings', auditLog('UPDATE_SETTINGS', 'settings'), validate(settingUpdateSchema), (req, res) => settingsController.update(req, res))

// Notifications
router.get('/notifications', (req, res) => notificationController.getAll(req, res))
router.post('/notifications/:id/read', auditLog('MARK_NOTIFICATION_READ', 'notifications'), (req, res) => notificationController.markRead(req, res))
router.post('/notifications/read-all', auditLog('MARK_ALL_NOTIFICATIONS_READ', 'notifications'), (req, res) => notificationController.markAllRead(req, res))
router.delete('/notifications/:id', auditLog('DELETE_NOTIFICATION', 'notifications'), (req, res) => notificationController.delete(req, res))

// Search
router.get('/search', (req, res) => searchController.globalSearch(req, res))

// Discovery Forms
router.get('/discovery', (req, res) => discoveryController.getAll(req, res))
router.post('/discovery', auditLog('CREATE_DISCOVERY', 'discovery'), validate(discoveryCreateSchema), (req, res) => discoveryController.create(req, res))
router.delete('/discovery/:id', auditLog('DELETE_DISCOVERY', 'discovery'), (req, res) => discoveryController.delete(req, res))

export default router
