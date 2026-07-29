import { adminWS } from './wsClient'

import { useState, useEffect } from 'react'

export function useAdminStore(): StoreData {
  const [store, setStore] = useState(getAdminStore())
  useEffect(() => {
    const unsub = subscribe(() => setStore({ ...getAdminStore() }))
    return unsub
  }, [])
  return store
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
  pdfType?: string
  title?: string
  clientName?: string
  clientEmail?: string
  company?: string
  phone?: string
  fileSizeKb?: number
  pageCount?: number
  referenceNumber?: string
  agreementId?: string
  sha256Hash?: string
  storageUrl?: string
  storageProvider?: string
  version?: string
  status?: string
  downloadCount?: number
  fileName?: string
  deviceType?: string
  browser?: string
  os?: string
  pdfDataUrl?: string
  updatedAt?: string
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

export interface AdminCmsEntry {
  id: string
  title: string
  content: any
  published: boolean
  updated_at?: string
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
  linkClicks: any[]
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
  cmsContent: AdminCmsEntry[]
  recycleBin: AdminRecycleItem[]
}

const EMPTY_DATA: StoreData = {
  linkClicks: [], leads: [], pdfs: [], invoices: [], logs: [],
  clients: [], projects: [], proposals: [], agreements: [], payments: [],
  content: [], assets: [], approvals: [], timelines: [], handovers: [],
  feedbacks: [], notifications: [], discoveryQuestionnaires: [],
  cmsContent: [],
  recycleBin: [],
}

let __cache: StoreData = { ...EMPTY_DATA }
let __syncInProgress = false
let __syncTriggered = false
let __wsHandlersInitialized = false
let __sse: EventSource | null = null
let __ssePollTimer: ReturnType<typeof setInterval> | null = null
let __subscribers: (() => void)[] = []

export function subscribe(fn: () => void): () => void {
  __subscribers.push(fn)
  return () => { __subscribers = __subscribers.filter(s => s !== fn) }
}

function notifySubscribers() {
  __subscribers.forEach(fn => fn())
}

const COLLECTION_ENDPOINTS: Record<string, string> = {
  linkClicks: '/api/admin/link-clicks',
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
  cmsContent: '/api/admin/cms',
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

const SYNC_COLLECTIONS: { key: keyof StoreData; url: string }[] = Object.keys(EMPTY_DATA).map(k => ({
  key: k as keyof StoreData,
  url: COLLECTION_ENDPOINTS[k] || `/api/admin/${k}`,
}))

export async function syncFromCloud(): Promise<StoreData> {
  if (__syncInProgress) return __cache
  __syncInProgress = true
  try {
    const resp = await api('/api/sync')
    if (resp && typeof resp === 'object') {
      const updated: StoreData = { ...EMPTY_DATA }
      for (const key of Object.keys(EMPTY_DATA)) {
        const val = (resp as any)[key]
        if (Array.isArray(val)) {
          (updated as any)[key] = key === 'pdfs' || key === 'leads' || key === 'invoices' || key === 'logs'
            ? sortByCreatedAt(val)
            : val
        }
      }
      __cache = updated
    } else {
      const results = await Promise.all(
        SYNC_COLLECTIONS.map(({ key, url }) =>
          api(url).then(resp => ({ key, data: toArray(resp) }))
        )
      )
      for (const { key, data } of results) {
        if (Array.isArray(data)) {
          (__cache as any)[key] = key === 'pdfs' || key === 'leads' || key === 'invoices' || key === 'logs'
            ? sortByCreatedAt(data)
            : data
        }
      }
    }
    initWebSocketHandlers()
    initSSE()
    notifySubscribers()
    return __cache
  } catch {
    return __cache
  } finally {
    __syncInProgress = false
  }
}

export function getAdminStore(): StoreData {
  if (!__syncTriggered) {
    __syncTriggered = true
    syncFromCloud().then(notifySubscribers)
  }
  return __cache
}

export function saveAdminStore(data: StoreData): void {
  __cache = { ...data }
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

export function initSSE(): void {
  if (__sse) return
  try {
    __sse = new EventSource('/api/admin/events')

    __sse.addEventListener('pdf', () => syncFromCloud())
    __sse.addEventListener('ai_conversation', () => syncFromCloud())
    __sse.addEventListener('lead', () => syncFromCloud())
    __sse.addEventListener('discovery', () => syncFromCloud())

    __sse.onerror = () => {
      destroySSE()
      if (!__ssePollTimer) {
        __ssePollTimer = setInterval(() => syncFromCloud(), 30000)
      }
    }
  } catch {
    if (!__ssePollTimer) {
      __ssePollTimer = setInterval(() => syncFromCloud(), 30000)
    }
  }
}

export function destroySSE(): void {
  if (__sse) {
    __sse.close()
    __sse = null
  }
  if (__ssePollTimer) {
    clearInterval(__ssePollTimer)
    __ssePollTimer = null
  }
}

export async function logAuditEvent(
  type: AdminSystemLog['type'],
  event: string,
  detail: string,
  severity: 'info' | 'warn' | 'error' = 'info'
): Promise<AdminSystemLog | null> {
  const created = await api('/api/admin/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, event, detail, severity }),
  })
  if (created?.id) {
    __cache.logs = [created, ...(__cache.logs || [])]
  }
  return created
}

export async function recordAdminPDF(pdf: Omit<AdminPDF, 'id' | 'createdAt'>): Promise<AdminPDF | null> {
  const created = await api('/api/admin/pdfs/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pdf),
  })
  if (created?.id) {
    __cache.pdfs = [created, ...(__cache.pdfs || [])]
  }
  return created
}

export async function recordAdminLead(lead: Omit<AdminLead, 'id' | 'createdAt' | 'status'>): Promise<AdminLead | null> {
  const created = await api('/api/admin/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
  if (created?.id) {
    __cache.leads = [created, ...__cache.leads]
  }
  return created
}

export async function recordAdminDiscoveryQuestionnaire(dq: Omit<AdminDiscoveryQuestionnaire, 'id' | 'createdAt' | 'status'>): Promise<AdminDiscoveryQuestionnaire | null> {
  const created = await api('/api/admin/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dq),
  })
  if (created?.id) {
    __cache.discoveryQuestionnaires = [created, ...(__cache.discoveryQuestionnaires || [])]
  }
  return created
}

export async function moveToRecycleBin(
  collection: keyof StoreData,
  itemId: string,
  _title?: string,
  _subtitle?: string
): Promise<AdminRecycleItem | null> {
  const endpoint = COLLECTION_ENDPOINTS[collection]
  if (!endpoint) return null
  const response = await api(`${endpoint}/${itemId}`, { method: 'DELETE' })
  if (response?.recycleItem) {
    __cache.recycleBin = [response.recycleItem, ...(__cache.recycleBin || [])]
  }
  return response?.recycleItem || null
}

export async function restoreFromRecycleBin(recycleId: string): Promise<boolean> {
  const result = await api('/api/admin/recycle/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleId }),
  })
  if (result?.success) {
    __cache.recycleBin = __cache.recycleBin.filter(r => r.id !== recycleId)
    if (result?.itemData && result?.originalCollection) {
      const col = result.originalCollection as keyof StoreData
      const list = __cache[col] as any[]
      if (Array.isArray(list) && !list.some(i => i.id === result.itemData.id)) {
        ;(__cache as any)[col] = [result.itemData, ...list]
      }
    }
  }
  return result?.success === true
}

export async function bulkRestoreFromRecycleBin(recycleIds: string[]): Promise<boolean> {
  const result = await api('/api/admin/recycle/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleIds, bulk: true }),
  })
  if (result?.success) {
    __cache.recycleBin = __cache.recycleBin.filter(r => !recycleIds.includes(r.id))
    if (result?.restoredItems) {
      for (const item of result.restoredItems) {
        if (item?.itemData && item?.originalCollection) {
          const col = item.originalCollection as keyof StoreData
          const list = __cache[col] as any[]
          if (Array.isArray(list) && !list.some(i => i.id === item.itemData.id)) {
            ;(__cache as any)[col] = [item.itemData, ...list]
          }
        }
      }
    }
  }
  return result?.success === true
}

export async function permanentDeleteFromRecycleBin(recycleId: string): Promise<boolean> {
  const result = await api('/api/admin/recycle/permanent-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleId }),
  })
  if (result?.success) {
    __cache.recycleBin = __cache.recycleBin.filter(r => r.id !== recycleId)
  }
  return result?.success === true
}

export async function bulkPermanentDeleteFromRecycleBin(recycleIds: string[]): Promise<boolean> {
  const result = await api('/api/admin/recycle/permanent-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recycleIds, bulk: true }),
  })
  if (result?.success) {
    __cache.recycleBin = __cache.recycleBin.filter(r => !recycleIds.includes(r.id))
  }
  return result?.success === true
}

export async function emptyRecycleBin(): Promise<boolean> {
  const result = await api('/api/admin/recycle/empty', { method: 'POST' })
  if (result?.success) {
    __cache.recycleBin = []
  }
  return result?.success === true
}

export async function recordAdminInvoice(invoice: Omit<AdminInvoice, 'id' | 'createdAt'>): Promise<AdminInvoice | null> {
  const created = await api('/api/admin/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  })
  if (created?.id) {
    __cache.invoices = [created, ...__cache.invoices]
  }
  return created
}

function initWebSocketHandlers() {
  if (__wsHandlersInitialized) return
  __wsHandlersInitialized = true

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
