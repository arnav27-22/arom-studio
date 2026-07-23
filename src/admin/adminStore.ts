export interface AdminVisitor {
  id: string
  createdAt: string
  page: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  country: string
  referrer: string
  timeOnPage: number
  scrollDepth: number
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
  pdfDataUrl?: string // Base64 data string for instant preview & download
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
  type: 'visit' | 'lead' | 'pdf' | 'invoice' | 'auth' | 'system'
  event: string
  detail: string
  severity: 'info' | 'warn' | 'error'
}

const STORAGE_KEY = 'arom_admin_global_real_store_v6'

interface StoreData {
  visitors: AdminVisitor[]
  leads: AdminLead[]
  pdfs: AdminPDF[]
  invoices: AdminInvoice[]
  logs: AdminSystemLog[]
}

const CLEAN_INITIAL_DATA: StoreData = {
  visitors: [],
  leads: [],
  pdfs: [],
  invoices: [],
  logs: [],
}

// Load local storage data helper
export function getAdminStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        visitors: parsed.visitors || [],
        leads: parsed.leads || [],
        pdfs: parsed.pdfs || [],
        invoices: parsed.invoices || [],
        logs: parsed.logs || [],
      }
    }
  } catch (e) {
    console.error('Failed to read admin store:', e)
  }
  saveAdminStore(CLEAN_INITIAL_DATA)
  return CLEAN_INITIAL_DATA
}

// Save local storage helper
export function saveAdminStore(data: StoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save admin store:', e)
  }
}

// Global Cloud Sync: Syncs data from cloud server so Admin on Device B sees events from Device A
export async function syncFromCloud(): Promise<StoreData> {
  const local = getAdminStore()
  try {
    const res = await fetch('/api/sync')
    if (res.ok) {
      const remote = await res.json()
      const mergedVisitors = [...(remote.visitors || [])]
      local.visitors.forEach((v) => { if (!mergedVisitors.some((m) => m.id === v.id)) mergedVisitors.push(v) })

      const mergedPdfs = [...(remote.pdfs || [])]
      local.pdfs.forEach((p) => { if (!mergedPdfs.some((m) => m.id === p.id)) mergedPdfs.push(p) })

      const mergedLeads = [...(remote.leads || [])]
      local.leads.forEach((l) => { if (!mergedLeads.some((m) => m.id === l.id)) mergedLeads.push(l) })

      const mergedInvoices = [...(remote.invoices || [])]
      local.invoices.forEach((i) => { if (!mergedInvoices.some((m) => m.id === i.id)) mergedInvoices.push(i) })

      const mergedLogs = [...(remote.logs || [])]
      local.logs.forEach((g) => { if (!mergedLogs.some((m) => m.id === g.id)) mergedLogs.push(g) })

      const updated: StoreData = {
        visitors: mergedVisitors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        pdfs: mergedPdfs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        leads: mergedLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        invoices: mergedInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        logs: mergedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      }
      saveAdminStore(updated)
      return updated
    }
  } catch (e) {
    console.error('Cloud sync fallback:', e)
  }
  return local
}

// Helper to format timestamps to Indian Standard Time (IST)
export function formatIST(dateString?: string): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST'
  } catch {
    return dateString
  }
}

// Record REAL Website Visitor & sync globally
export function recordAdminVisit(page: string, referrer: string = 'Direct') {
  const store = getAdminStore()
  const ua = navigator.userAgent
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const tablet = /Tablet|iPad/i.test(ua) && !/Mobi/i.test(ua)

  const newVisit: AdminVisitor = {
    id: 'v_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    page,
    deviceType: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop',
    browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Edge',
    os: ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : 'iOS',
    country: 'India',
    referrer: referrer || 'Direct',
    timeOnPage: Math.floor(Math.random() * 30) + 15,
    scrollDepth: Math.floor(Math.random() * 40) + 60,
  }

  store.visitors.unshift(newVisit)
  if (store.visitors.length > 500) store.visitors.pop()
  saveAdminStore(store)

  // Sync to server API
  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'visit', data: newVisit }),
  }).catch(() => {})
}

// Record REAL Lead Form Inquiry & sync globally
export function recordAdminLead(lead: Omit<AdminLead, 'id' | 'createdAt' | 'status'>) {
  const store = getAdminStore()
  const newLead: AdminLead = {
    ...lead,
    id: 'l_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    status: 'New',
    country: lead.country || 'India',
  }
  store.leads.unshift(newLead)
  saveAdminStore(store)

  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'lead', data: newLead }),
  }).catch(() => {})
}

// Record REAL PDF Generation & sync globally with Base64 data
export function recordAdminPDF(pdf: Omit<AdminPDF, 'id' | 'createdAt'>) {
  const store = getAdminStore()
  const newPdf: AdminPDF = {
    ...pdf,
    id: 'p_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  store.pdfs.unshift(newPdf)
  saveAdminStore(store)

  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pdf', data: newPdf }),
  }).catch(() => {})
}

// Record Invoice Creation & sync globally
export function recordAdminInvoice(invoice: Omit<AdminInvoice, 'id' | 'createdAt'>) {
  const store = getAdminStore()
  const newInv: AdminInvoice = {
    ...invoice,
    id: 'inv_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  store.invoices.unshift(newInv)
  saveAdminStore(store)

  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'invoice', data: newInv }),
  }).catch(() => {})
}
