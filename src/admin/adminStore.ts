import type { BlogPost } from '../data/blog'
import { BLOG_POSTS } from '../data/blog'
import { adminWS } from './wsClient'

export interface AdminVisitor {
  id: string
  sessionId?: string
  createdAt: string
  lastActivityAt?: string
  page: string
  entryPage?: string
  exitPage?: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  deviceLabel?: string
  deviceBrand?: string
  network?: string
  browser: string
  os: string
  country: string
  city?: string
  ip?: string
  referrer: string
  timeOnPage: number
  sessionDuration?: number
  scrollDepth: number
  pageViewsCount?: number
  isReturning?: boolean
  isBounce?: boolean
  isLive?: boolean
}

export interface AdminLead {
  id: string
  createdAt: string
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  budget?: string
  message?: string
  status: 'New' | 'Viewed' | 'Responded' | 'Archived'
  country?: string
}

export interface AdminPDF {
  id: string
  createdAt: string
  pdfType: string
  title: string
  clientName: string
  clientEmail?: string
  fileSizeKb: number
  deviceType?: string
  browser?: string
  os?: string
  pdfDataUrl?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface AdminInvoice {
  id: string
  invoiceNumber: string
  createdAt: string
  dueDate: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientCompany?: string
  currency: 'INR' | 'USD'
  items: InvoiceItem[]
  taxRate: number
  discountRate: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  notes?: string
}

export interface AdminSystemLog {
  id: string
  createdAt: string
  type: 'visit' | 'lead' | 'pdf' | 'invoice' | 'auth' | 'system' | 'admin' | 'security' | 'ai' | 'project'
  event: string
  detail: string
  severity: 'info' | 'warn' | 'error'
}

export interface AdminClient {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  activeProjectsCount: number
  status: 'Active' | 'Onboarding' | 'Completed' | 'Inactive'
  totalRevenue: number
  notes: string
  createdAt: string
  timeline: { date: string; event: string }[]
}

export interface AdminProject {
  id: string
  title: string
  clientId: string
  clientName: string
  status: 'Planning' | 'In Progress' | 'In Review' | 'Launched' | 'Archived'
  progress: number
  startDate: string
  dueDate: string
  completionDate?: string
  priority: 'High' | 'Medium' | 'Low'
  assignedTeam: string[]
  projectFiles: { name: string; url: string; uploadedAt: string }[]
  milestones: { title: string; completed: boolean; dueDate: string }[]
  launchStatus: 'Pending' | 'Staging' | 'Live'
  createdAt: string
}

export interface AdminProposal {
  id: string
  proposalNumber: string
  clientName: string
  clientEmail: string
  title: string
  amount: number
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected'
  createdAt: string
  validUntil: string
  downloadUrl?: string
  scopeSummary: string
}

export interface AdminAgreement {
  id: string
  agreementNumber: string
  clientName: string
  clientEmail: string
  status: 'Pending' | 'Signed'
  agreementVersion: string
  signedDate?: string
  createdAt: string
  downloadUrl?: string
}

export interface AdminPayment {
  id: string
  invoiceNumber: string
  clientName: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'Paid' | 'Pending' | 'Overdue'
  invoiceLink?: string
  receiptUrl?: string
  paymentMethod?: string
  reminderSentCount: number
  createdAt: string
}

export interface AdminContentItem {
  id: string
  clientName: string
  projectName: string
  status: 'Submitted' | 'Pending' | 'Missing' | 'Review'
  completionPercentage: number
  downloadUrl?: string
  checklist: { section: string; status: 'Complete' | 'Pending' | 'Missing' | 'Review' }[]
  updatedAt: string
}

export interface AdminAssetFolder {
  id: string
  clientName: string
  projectName: string
  googleDriveLink: string
  folderStatus: 'Syncing' | 'Complete' | 'Needs Files'
  missingFilesCount: number
  uploadDate: string
  checklist: { name: string; received: boolean }[]
}

export interface AdminDesignApproval {
  id: string
  projectName: string
  clientName: string
  status: 'Waiting Approval' | 'Approved' | 'Needs Revision'
  approvalDate?: string
  previewUrl: string
  comments: { author: string; text: string; createdAt: string }[]
  version: string
}

export interface AdminTimelinePhase {
  id: string
  projectName: string
  clientName: string
  currentPhase: string
  estimatedDelivery: string
  timelineProgress: number
  upcomingTasks: string[]
  completedTasks: string[]
  delayedTasks: string[]
}

export interface AdminHandover {
  id: string
  projectName: string
  clientName: string
  status: 'Ready' | 'Delivered'
  downloadZipUrl?: string
  githubLink?: string
  adminLoginUrl?: string
  adminUsername?: string
  domain: string
  hosting: string
  warrantyPeriodMonths: number
  supportExpiryDate: string
  handoverDate: string
}

export interface AdminFeedback {
  id: string
  clientName: string
  company: string
  rating: number
  review: string
  testimonialApproved: boolean
  portfolioPermission: boolean
  clientSuggestions: string
  createdAt: string
}

export interface AdminNotification {
  id: string
  type: 'inquiry' | 'proposal' | 'payment' | 'approval' | 'live' | 'handover' | 'alert'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface AdminDiscoveryQuestionnaire {
  id: string
  fullName: string
  company: string
  email: string
  phone?: string
  website?: string
  budget?: string
  urgency?: string
  preferredLaunchDate?: string
  contentProvider?: string
  status: 'New' | 'Reviewed' | 'Proposal Sent' | 'Archived'
  createdAt: string
  pdfDataUrl?: string
  fullData?: any
}

export interface AdminRecycleItem {
  id: string
  originalCollection: keyof StoreData
  itemData: any
  title: string
  subtitle?: string
  deletedAt: string
  deletedBy?: string
  deletedByName?: string
  originalCreatedAt?: string
}

export interface StoreData {
  visitors: AdminVisitor[]
  leads: AdminLead[]
  pdfs: AdminPDF[]
  invoices: AdminInvoice[]
  logs: AdminSystemLog[]
  clients: AdminClient[]
  projects: AdminProject[]
  proposals: AdminProposal[]
  agreements: AdminAgreement[]
  payments: AdminPayment[]
  content: AdminContentItem[]
  assets: AdminAssetFolder[]
  approvals: AdminDesignApproval[]
  timelines: AdminTimelinePhase[]
  handovers: AdminHandover[]
  feedbacks: AdminFeedback[]
  notifications: AdminNotification[]
  discoveryQuestionnaires: AdminDiscoveryQuestionnaire[]
  blogs: BlogPost[]
  recycleBin: AdminRecycleItem[]
}

const EMPTY_DATA: StoreData = {
  visitors: [], leads: [], pdfs: [], invoices: [], logs: [],
  clients: [], projects: [], proposals: [], agreements: [], payments: [],
  content: [], assets: [], approvals: [], timelines: [], handovers: [],
  feedbacks: [], notifications: [], discoveryQuestionnaires: [],
  blogs: BLOG_POSTS, recycleBin: [],
}

let __cache: StoreData = loadPersistedStore() || { ...EMPTY_DATA }
let __syncInProgress = false
let __syncTriggered = false
let __wsHandlersInitialized = false

const COLLECTION_ENDPOINTS: Record<string, string> = {
  visitors: '/api/admin/visitors',
  leads: '/api/admin/leads',
  pdfs: '/api/admin/pdfs',
  invoices: '/api/admin/invoices',
  logs: '/api/admin/logs',
  clients: '/api/admin/clients',
  projects: '/api/admin/projects',
  proposals: '/api/admin/proposals',
  agreements: '/api/admin/agreements',
  payments: '/api/admin/payments',
  content: '/api/admin/content',
  assets: '/api/admin/assets',
  approvals: '/api/admin/approvals',
  timelines: '/api/admin/timelines',
  handovers: '/api/admin/handovers',
  feedbacks: '/api/admin/feedbacks',
  notifications: '/api/admin/notifications',
  discoveryQuestionnaires: '/api/admin/discovery',
  recycleBin: '/api/admin/recycle',
}

async function api(path: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(path, { credentials: 'include', ...options })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function toArray(resp: any): any[] {
  if (Array.isArray(resp)) return resp
  if (resp && typeof resp === 'object') {
    for (const key of Object.keys(resp)) {
      if (key === 'total' || key === 'page' || key === 'limit') continue
      if (Array.isArray(resp[key])) return resp[key]
    }
  }
  return []
}


function sortByCreatedAt<T extends { createdAt?: string }>(arr: T[]): T[] {
  return arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
}

function initWebSocketHandlers() {
  if (__wsHandlersInitialized) return
  __wsHandlersInitialized = true

  adminWS.on('visitor:created', (data) => {
    if (data?.id && !__cache.visitors.some(v => v.id === data.id)) {
      __cache.visitors = [data, ...__cache.visitors]
    }
  })
  adminWS.on('visitor:updated', (data) => {
    if (data?.id) {
      __cache.visitors = __cache.visitors.map(v => v.id === data.id ? data : v)
    }
  })
  adminWS.on('visitor:deleted', (data) => {
    if (data?.id) {
      __cache.visitors = __cache.visitors.filter(v => v.id !== data.id)
    }
  })

  adminWS.on('pdf:created', (data) => {
    if (data?.id && !__cache.pdfs.some(p => p.id === data.id)) {
      __cache.pdfs = [data, ...__cache.pdfs]
    }
  })
  adminWS.on('pdf:deleted', (data) => {
    if (data?.id) {
      __cache.pdfs = __cache.pdfs.filter(p => p.id !== data.id)
    }
  })

  adminWS.on('lead:created', (data) => {
    if (data?.id && !__cache.leads.some(l => l.id === data.id)) {
      __cache.leads = [data, ...__cache.leads]
    }
  })
  adminWS.on('lead:updated', (data) => {
    if (data?.id) {
      __cache.leads = __cache.leads.map(l => l.id === data.id ? data : l)
    }
  })

  adminWS.on('invoice:created', (data) => {
    if (data?.id && !__cache.invoices.some(i => i.id === data.id)) {
      __cache.invoices = [data, ...__cache.invoices]
    }
  })
  adminWS.on('invoice:deleted', (data) => {
    if (data?.id) {
      __cache.invoices = __cache.invoices.filter(i => i.id !== data.id)
    }
  })

  adminWS.on('project:created', (data) => {
    if (data?.id && !__cache.projects.some(p => p.id === data.id)) {
      __cache.projects = [data, ...__cache.projects]
    }
  })
  adminWS.on('project:updated', (data) => {
    if (data?.id) {
      __cache.projects = __cache.projects.map(p => p.id === data.id ? data : p)
    }
  })
  adminWS.on('project:deleted', (data) => {
    if (data?.id) {
      __cache.projects = __cache.projects.filter(p => p.id !== data.id)
    }
  })

  adminWS.on('client:created', (data) => {
    if (data?.id && !__cache.clients.some(c => c.id === data.id)) {
      __cache.clients = [data, ...__cache.clients]
    }
  })
  adminWS.on('client:updated', (data) => {
    if (data?.id) {
      __cache.clients = __cache.clients.map(c => c.id === data.id ? data : c)
    }
  })
  adminWS.on('client:deleted', (data) => {
    if (data?.id) {
      __cache.clients = __cache.clients.filter(c => c.id !== data.id)
    }
  })

  adminWS.on('notification:updated', (data) => {
    if (data?.id) {
      __cache.notifications = __cache.notifications.map(n => n.id === data.id ? { ...n, ...data } : n)
    }
  })
  adminWS.on('notification:allread', () => {
    __cache.notifications = __cache.notifications.map(n => ({ ...n, read: true }))
  })
  adminWS.on('notification:deleted', (data) => {
    if (data?.id) {
      __cache.notifications = __cache.notifications.filter(n => n.id !== data.id)
    }
  })

  adminWS.on('discovery:created', (data) => {
    if (data?.id && !__cache.discoveryQuestionnaires.some(d => d.id === data.id)) {
      __cache.discoveryQuestionnaires = [data, ...__cache.discoveryQuestionnaires]
    }
  })
  adminWS.on('discovery:deleted', (data) => {
    if (data?.id) {
      __cache.discoveryQuestionnaires = __cache.discoveryQuestionnaires.filter(d => d.id !== data.id)
    }
  })

  adminWS.on('recycle:restored', (data) => {
    if (data?.recycleId) {
      __cache.recycleBin = __cache.recycleBin.filter(r => r.id !== data.recycleId)
    }
    if (data?.itemData && data?.originalCollection) {
      const col = data.originalCollection as keyof StoreData
      const list = __cache[col] as any[] | undefined
      if (list && !list.some((i: any) => i.id === data.itemData.id)) {
        ;(__cache as any)[col] = [data.itemData, ...list]
      }
    }
  })
  adminWS.on('recycle:deleted', (data) => {
    if (data?.itemData && data?.originalCollection) {
      const col = data.originalCollection as keyof StoreData
      ;(__cache as any)[col] = ((__cache[col] as any[]) || []).filter((i: any) => i.id !== data.itemData.id)
    }
    if (data?.recycleItem) {
      __cache.recycleBin = [data.recycleItem, ...__cache.recycleBin.filter(r => r.id !== data.recycleItem.id)]
    }
  })
  adminWS.on('recycle:emptied', () => {
    __cache.recycleBin = []
  })
}

const SYNC_COLLECTIONS: { key: keyof StoreData; url: string }[] = [
  { key: 'visitors', url: '/api/admin/visitors' },
  { key: 'leads', url: '/api/admin/leads' },
  { key: 'pdfs', url: '/api/admin/pdfs' },
  { key: 'invoices', url: '/api/admin/invoices' },
  { key: 'logs', url: '/api/admin/logs' },
  { key: 'clients', url: '/api/admin/clients' },
  { key: 'projects', url: '/api/admin/projects' },
  { key: 'proposals', url: '/api/admin/proposals' },
  { key: 'agreements', url: '/api/admin/agreements' },
  { key: 'payments', url: '/api/admin/payments' },
  { key: 'content', url: '/api/admin/content' },
  { key: 'assets', url: '/api/admin/assets' },
  { key: 'approvals', url: '/api/admin/approvals' },
  { key: 'timelines', url: '/api/admin/timelines' },
  { key: 'handovers', url: '/api/admin/handovers' },
  { key: 'feedbacks', url: '/api/admin/feedbacks' },
  { key: 'notifications', url: '/api/admin/notifications' },
  { key: 'discoveryQuestionnaires', url: '/api/admin/discovery' },
  { key: 'recycleBin', url: '/api/admin/recycle' },
]

export async function syncFromCloud(): Promise<StoreData> {
  if (__syncInProgress) return __cache
  __syncInProgress = true
  try {
    const results = await Promise.all(
      SYNC_COLLECTIONS.map(({ key, url }) =>
        api(url).then(resp => ({ key, data: toArray(resp) }))
      )
    )

    const updated: StoreData = { ...__cache }

    for (const { key, data } of results) {
      if (!Array.isArray(data) || data.length === 0) continue
      ;(updated as any)[key] = key === 'visitors' || key === 'pdfs' || key === 'leads' || key === 'invoices' || key === 'logs'
        ? sortByCreatedAt(data)
        : data
    }

    __cache = updated
    initWebSocketHandlers()
    return updated
  } finally {
    __syncInProgress = false
  }
}

export function getAdminStore(): StoreData {
  if (!__syncTriggered) {
    __syncTriggered = true
    syncFromCloud()
  }
  return __cache
}

export function saveAdminStore(data: StoreData) {
  __cache = { ...data }
  try { localStorage.setItem('arom_admin_store', JSON.stringify(__cache)) } catch { /* storage full or unavailable */ }
}

function loadPersistedStore(): StoreData | null {
  try {
    const raw = localStorage.getItem('arom_admin_store')
    if (raw) return JSON.parse(raw) as StoreData
  } catch { /* corrupted or unavailable */ }
  return null
}

export function formatIST(dateString?: string): string {
  if (!dateString) return '\u2014'
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    }) + ' IST'
  } catch { return dateString }
}

export function logAuditEvent(
  type: AdminSystemLog['type'],
  event: string,
  detail: string,
  severity: 'info' | 'warn' | 'error' = 'info'
) {
  const logItem: AdminSystemLog = {
    id: 'log_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    type, event, detail, severity,
  }
  __cache.logs = [logItem, ...(__cache.logs || [])]
  api('/api/admin/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logItem),
  }).catch(() => {})
}

export function moveToRecycleBin(
  collection: keyof StoreData,
  itemId: string,
  title?: string,
  subtitle?: string
) {
  const list = __cache[collection] as any[]
  if (!Array.isArray(list)) return
  const itemIndex = list.findIndex(i => i.id === itemId)
  if (itemIndex === -1) return
  const deletedItem = list[itemIndex]
  ;(__cache as any)[collection] = list.filter(i => i.id !== itemId)
  const record: AdminRecycleItem = {
    id: 'rec_' + Math.random().toString(36).slice(2, 9),
    originalCollection: collection,
    itemData: deletedItem,
    title: title || deletedItem.name || deletedItem.title || deletedItem.companyName || deletedItem.projectName || deletedItem.clientName || 'Deleted Item',
    subtitle: subtitle || deletedItem.email || deletedItem.clientName || deletedItem.status || String(collection),
    deletedAt: new Date().toISOString(),
    deletedByName: 'Administrator',
    originalCreatedAt: deletedItem.createdAt,
  }
  __cache.recycleBin = [record, ...(__cache.recycleBin || [])]
  const endpoint = COLLECTION_ENDPOINTS[collection]
  if (endpoint) {
    api(`${endpoint}/${itemId}`, { method: 'DELETE' }).catch(() => {})
  }
}

export function restoreFromRecycleBin(recycleId: string) {
  const record = __cache.recycleBin?.find(r => r.id === recycleId)
  if (!record) return
  const collection = record.originalCollection
  const currentList = (__cache[collection] as any[]) || []
  const exists = currentList.some(i => i.id === record.itemData?.id)
  if (!exists && record.itemData) {
    ;(__cache as any)[collection] = [record.itemData, ...currentList]
  }
  __cache.recycleBin = __cache.recycleBin.filter(r => r.id !== recycleId)
  api('/api/admin/recycle/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleId, originalCollection: collection, itemData: record.itemData }),
  }).catch(() => {})
}

export function bulkRestoreFromRecycleBin(recycleIds: string[]) {
  let restored = 0
  recycleIds.forEach(id => {
    const record = __cache.recycleBin?.find(r => r.id === id)
    if (!record) return
    const collection = record.originalCollection
    const currentList = (__cache[collection] as any[]) || []
    const exists = currentList.some(i => i.id === record.itemData?.id)
    if (!exists && record.itemData) {
      ;(__cache as any)[collection] = [record.itemData, ...currentList]
    }
    restored++
  })
  __cache.recycleBin = __cache.recycleBin.filter(r => !recycleIds.includes(r.id))
  api('/api/admin/recycle/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleIds, bulk: true }),
  }).catch(() => {})
}

export function permanentDeleteFromRecycleBin(recycleId: string) {
  __cache.recycleBin = __cache.recycleBin.filter(r => r.id !== recycleId)
  api('/api/admin/recycle/permanent-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleId }),
  }).catch(() => {})
}

export function bulkPermanentDeleteFromRecycleBin(recycleIds: string[]) {
  __cache.recycleBin = __cache.recycleBin.filter(r => !recycleIds.includes(r.id))
  api('/api/admin/recycle/permanent-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleIds, bulk: true }),
  }).catch(() => {})
}

export function emptyRecycleBin() {
  __cache.recycleBin = []
  api('/api/admin/recycle/empty', { method: 'POST' }).catch(() => {})
}

export function recordAdminVisit(page: string, referrer: string = 'Direct', options: Partial<AdminVisitor> = {}) {
  const now = new Date().toISOString()
  const visit: AdminVisitor = {
    id: 'v_' + Math.random().toString(36).slice(2, 9),
    sessionId: 'sess_' + Math.random().toString(36).slice(2, 9),
    createdAt: now, lastActivityAt: now,
    page: page || '/', entryPage: options.entryPage || page || '/', exitPage: page || '/',
    deviceType: options.deviceType || 'desktop',
    deviceLabel: options.deviceLabel || '',
    deviceBrand: options.deviceBrand || '',
    network: options.network || '',
    browser: options.browser || '',
    os: options.os || '',
    country: options.country || '',
    city: options.city || '',
    ip: options.ip || '',
    referrer: referrer || '',
    timeOnPage: options.timeOnPage || 0,
    sessionDuration: options.sessionDuration || 0,
    scrollDepth: options.scrollDepth || 80,
    pageViewsCount: options.pageViewsCount || 1,
    isReturning: options.isReturning ?? false,
    isBounce: options.isBounce ?? false,
    isLive: true,
  }
  __cache.visitors = [visit, ...__cache.visitors]
  if (__cache.visitors.length > 500) __cache.visitors.pop()

  __cache.notifications = [{
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'live',
    title: 'New Live Visitor Active',
    message: `Visitor from ${visit.city}, ${visit.country} viewing ${visit.page} via ${visit.browser}.`,
    read: false, createdAt: now,
  }, ...__cache.notifications]

  api('/api/admin/visitors/track-page-view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  }).catch(() => {})
}

export function recordAdminLead(lead: Omit<AdminLead, 'id' | 'createdAt' | 'status'>) {
  const now = new Date().toISOString()
  const newLead: AdminLead = {
    ...lead,
    id: 'l_' + Math.random().toString(36).slice(2, 9),
    createdAt: now, status: 'New', country: lead.country || '',
  }
  __cache.leads = [newLead, ...__cache.leads]
  __cache.notifications = [{
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'inquiry',
    title: 'New Client Inquiry Received',
    message: `Lead from ${newLead.name} (${newLead.email}) for ${newLead.service || 'Web Services'}.`,
    read: false, createdAt: now,
  }, ...__cache.notifications]

  fetch('/api/track/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLead),
  }).catch(() => {
    api('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    }).catch(() => {})
  })
}

export function recordAdminPDF(pdf: Omit<AdminPDF, 'id' | 'createdAt'>) {
  const newPdf: AdminPDF = {
    ...pdf,
    id: 'p_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  __cache.pdfs = [newPdf, ...(__cache.pdfs || [])]
  __cache.notifications = [{
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'inquiry',
    title: 'New PDF Document Generated',
    message: `${newPdf.clientName || 'Client'} generated ${newPdf.pdfType || 'PDF Document'} (${newPdf.title}).`,
    read: false, createdAt: newPdf.createdAt,
  }, ...(__cache.notifications || [])]

  fetch('/api/track/save-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPdf),
  }).catch(() => {
    api('/api/admin/pdfs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPdf),
    }).catch(() => {})
  })
}

export function recordAdminInvoice(invoice: Omit<AdminInvoice, 'id' | 'createdAt'>) {
  const newInv: AdminInvoice = {
    ...invoice,
    id: 'inv_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  __cache.invoices = [newInv, ...__cache.invoices]
  api('/api/admin/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newInv),
  }).catch(() => {})
}

export function recordAdminDiscoveryQuestionnaire(dq: Omit<AdminDiscoveryQuestionnaire, 'id' | 'createdAt' | 'status'>) {
  const now = new Date().toISOString()
  const newDq: AdminDiscoveryQuestionnaire = {
    ...dq,
    id: 'dq_' + Math.random().toString(36).slice(2, 9),
    createdAt: now, status: 'New',
  }
  __cache.discoveryQuestionnaires = [newDq, ...(__cache.discoveryQuestionnaires || [])]
  __cache.notifications = [{
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'inquiry',
    title: 'New Discovery Questionnaire Submitted',
    message: `Questionnaire submitted by ${newDq.fullName} (${newDq.company || 'Client'}).`,
    read: false, createdAt: now,
  }, ...(__cache.notifications || [])]

  fetch('/api/track/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newDq),
  }).catch(() => {
    api('/api/admin/discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDq),
    }).catch(() => {})
  })
}

export function recordAdminBlog(blog: BlogPost) {
  const index = __cache.blogs.findIndex(b => b.slug === blog.slug)
  if (index !== -1) __cache.blogs[index] = blog
  else __cache.blogs = [blog, ...__cache.blogs]
  saveAdminStore(__cache)
}

export function deleteAdminBlog(slug: string) {
  const target = __cache.blogs.find(b => b.slug === slug)
  if (target) moveToRecycleBin('blogs', slug, target.title, `Category: ${target.category}`)
  __cache.blogs = __cache.blogs.filter(b => b.slug !== slug)
  saveAdminStore(__cache)
}

export function getAdminBlogs(): BlogPost[] {
  return __cache.blogs
}
