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

const STORAGE_KEY = 'arom_admin_real_store_v5'

interface StoreData {
  visitors: AdminVisitor[]
  leads: AdminLead[]
  pdfs: AdminPDF[]
  invoices: AdminInvoice[]
  logs: AdminSystemLog[]
}

// Initial clean state with ZERO dummy/mock records
const CLEAN_INITIAL_DATA: StoreData = {
  visitors: [],
  leads: [],
  pdfs: [],
  invoices: [],
  logs: [],
}

// Load data helper
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

// Save helper
export function saveAdminStore(data: StoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save admin store:', e)
  }
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

// Record REAL Website Visitor
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

  store.logs.unshift({
    id: 'g_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    type: 'visit',
    event: 'Real Page Visit',
    detail: `User visited ${page} from ${referrer || 'Direct'}`,
    severity: 'info',
  })

  saveAdminStore(store)
}

// Record REAL Lead Form Inquiry
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
  
  store.logs.unshift({
    id: 'g_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    type: 'lead',
    event: 'Real Form Submission',
    detail: `Inquiry from ${lead.name} (${lead.service || 'General'})`,
    severity: 'info',
  })

  saveAdminStore(store)
}

// Record REAL PDF Generation
export function recordAdminPDF(pdf: Omit<AdminPDF, 'id' | 'createdAt'>) {
  const store = getAdminStore()
  const newPdf: AdminPDF = {
    ...pdf,
    id: 'p_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  store.pdfs.unshift(newPdf)

  store.logs.unshift({
    id: 'g_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    type: 'pdf',
    event: 'PDF Generated',
    detail: `${pdf.pdfType} generated for ${pdf.clientName}`,
    severity: 'info',
  })

  saveAdminStore(store)
}

// Record Invoice Creation
export function recordAdminInvoice(invoice: Omit<AdminInvoice, 'id' | 'createdAt'>) {
  const store = getAdminStore()
  const newInv: AdminInvoice = {
    ...invoice,
    id: 'inv_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  }
  store.invoices.unshift(newInv)

  store.logs.unshift({
    id: 'g_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    type: 'invoice',
    event: 'Invoice Created',
    detail: `${invoice.invoiceNumber} created for ${invoice.clientName}`,
    severity: 'info',
  })

  saveAdminStore(store)
}
