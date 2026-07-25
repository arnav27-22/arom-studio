import type { BlogPost } from '../data/blog'
import { BLOG_POSTS } from '../data/blog'

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

let __cache: StoreData = { ...EMPTY_DATA }
let __syncInProgress = false
let __syncTriggered = false

async function api(path: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(path, { credentials: 'include', ...options })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function mergeArrays<T extends { id: string }>(remote: T[] | undefined | null, local: T[]): T[] {
  const result: T[] = Array.isArray(remote) ? [...remote] : []
  const localItems = Array.isArray(local) ? local : []
  localItems.forEach(l => {
    if (l?.id && !result.some(r => r.id === l.id)) result.push(l)
  })
  return result
}

export async function syncFromCloud(): Promise<StoreData> {
  if (__syncInProgress) return __cache
  __syncInProgress = true
  try {
    const data = await api('/api/sync')
    if (!data) return __cache

    const updated: StoreData = {
      visitors: mergeArrays(data.visitors, __cache.visitors).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
      pdfs: mergeArrays(data.pdfs, __cache.pdfs).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
      leads: mergeArrays(data.leads, __cache.leads).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
      invoices: mergeArrays(data.invoices, __cache.invoices).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
      logs: mergeArrays(data.logs, __cache.logs).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
      clients: mergeArrays(data.clients, __cache.clients),
      projects: mergeArrays(data.projects, __cache.projects),
      proposals: mergeArrays(data.proposals, __cache.proposals),
      agreements: mergeArrays(data.agreements, __cache.agreements),
      payments: mergeArrays(data.payments, __cache.payments),
      content: mergeArrays(data.content, __cache.content),
      assets: mergeArrays(data.assets, __cache.assets),
      approvals: mergeArrays(data.approvals, __cache.approvals),
      timelines: mergeArrays(data.timelines, __cache.timelines),
      handovers: mergeArrays(data.handovers, __cache.handovers),
      feedbacks: mergeArrays(data.feedbacks, __cache.feedbacks),
      notifications: mergeArrays(data.notifications, __cache.notifications),
      discoveryQuestionnaires: mergeArrays(data.discoveryQuestionnaires, __cache.discoveryQuestionnaires),
      blogs: Array.isArray(data.blogs) && data.blogs.length > 0 ? data.blogs : __cache.blogs,
      recycleBin: mergeArrays(data.recycleBin, __cache.recycleBin),
    }
    __cache = updated
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
  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save_store', data }),
  }).catch(() => {})
}

export function formatIST(dateString?: string): string {
  if (!dateString) return '—'
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
  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'log', data: logItem }),
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
  saveAdminStore(__cache)
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
  saveAdminStore(__cache)
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
  saveAdminStore(__cache)
}

export function permanentDeleteFromRecycleBin(recycleId: string) {
  __cache.recycleBin = __cache.recycleBin.filter(r => r.id !== recycleId)
  saveAdminStore(__cache)
}

export function bulkPermanentDeleteFromRecycleBin(recycleIds: string[]) {
  __cache.recycleBin = __cache.recycleBin.filter(r => !recycleIds.includes(r.id))
  saveAdminStore(__cache)
}

export function emptyRecycleBin() {
  __cache.recycleBin = []
  saveAdminStore(__cache)
}

export function recordAdminVisit(page: string, referrer: string = 'Direct', options: Partial<AdminVisitor> = {}) {
  const now = new Date().toISOString()
  const visit: AdminVisitor = {
    id: 'v_' + Math.random().toString(36).slice(2, 9),
    sessionId: 'sess_' + Math.random().toString(36).slice(2, 9),
    createdAt: now, lastActivityAt: now,
    page: page || '/', entryPage: options.entryPage || page || '/', exitPage: page || '/',
    deviceType: options.deviceType || 'desktop',
    deviceLabel: options.deviceLabel || 'Desktop (PC)',
    deviceBrand: options.deviceBrand || 'Desktop PC',
    network: options.network || 'Broadband',
    browser: options.browser || 'Chrome',
    os: options.os || 'Windows',
    country: options.country || 'India',
    city: options.city || 'Mumbai',
    ip: options.ip || '',
    referrer: referrer || 'Direct',
    timeOnPage: options.timeOnPage || 30,
    sessionDuration: options.sessionDuration || 60,
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

  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'visit', data: visit }),
  }).catch(() => {})
}

export function recordAdminLead(lead: Omit<AdminLead, 'id' | 'createdAt' | 'status'>) {
  const now = new Date().toISOString()
  const newLead: AdminLead = {
    ...lead,
    id: 'l_' + Math.random().toString(36).slice(2, 9),
    createdAt: now, status: 'New', country: lead.country || 'India',
  }
  __cache.leads = [newLead, ...__cache.leads]
  __cache.notifications = [{
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'inquiry',
    title: 'New Client Inquiry Received',
    message: `Lead from ${newLead.name} (${newLead.email}) for ${newLead.service || 'Web Services'}.`,
    read: false, createdAt: now,
  }, ...__cache.notifications]
  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'lead', data: newLead }),
  }).catch(() => {})
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
  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pdf', data: newPdf }),
  }).catch(() => {})
}

export function recordAdminInvoice(invoice: Omit<AdminInvoice, 'id' | 'createdAt'>) {
  const newInv: AdminInvoice = {
    ...invoice,
    id: 'inv_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  __cache.invoices = [newInv, ...__cache.invoices]
  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'invoice', data: newInv }),
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
  api('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'discovery', data: newDq }),
  }).catch(() => {})
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

export function runHourlyVisitorGenerator() {}
