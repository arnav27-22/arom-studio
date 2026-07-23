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

const STORAGE_KEY = 'arom_admin_persistent_store_v3'

interface StoreData {
  visitors: AdminVisitor[]
  leads: AdminLead[]
  pdfs: AdminPDF[]
  invoices: AdminInvoice[]
  logs: AdminSystemLog[]
  masterPasswordHash?: string
}

// Initial default seed data so dashboard is rich out of the box
const DEFAULT_INITIAL_DATA: StoreData = {
  visitors: [
    { id: 'v1', createdAt: new Date().toISOString(), page: '/', deviceType: 'desktop', browser: 'Chrome', os: 'Windows', country: 'India', referrer: 'Google Search', timeOnPage: 85, scrollDepth: 95 },
    { id: 'v2', createdAt: new Date(Date.now() - 1800000).toISOString(), page: '/services', deviceType: 'mobile', browser: 'Safari', os: 'iOS', country: 'India', referrer: 'Direct', timeOnPage: 120, scrollDepth: 100 },
    { id: 'v3', createdAt: new Date(Date.now() - 3600000).toISOString(), page: '/pricing', deviceType: 'desktop', browser: 'Edge', os: 'Windows', country: 'United States', referrer: 'Google Search', timeOnPage: 65, scrollDepth: 80 },
    { id: 'v4', createdAt: new Date(Date.now() - 7200000).toISOString(), page: '/contact', deviceType: 'mobile', browser: 'Chrome', os: 'Android', country: 'India', referrer: 'Instagram', timeOnPage: 140, scrollDepth: 90 },
    { id: 'v5', createdAt: new Date(Date.now() - 14400000).toISOString(), page: '/blog', deviceType: 'desktop', browser: 'Firefox', os: 'macOS', country: 'India', referrer: 'Direct', timeOnPage: 110, scrollDepth: 85 },
  ],
  leads: [
    { id: 'l1', createdAt: new Date().toISOString(), name: 'Rajesh Mehta', email: 'rajesh@nexusfin.com', phone: '+91 98230 11223', company: 'Nexus Financial Services', service: 'Custom Business Website', budget: '₹32,999 - ₹59,999', status: 'New', message: 'We require a high-performance web redesign with client portal and analytics.', country: 'India' },
    { id: 'l2', createdAt: new Date(Date.now() - 86400000).toISOString(), name: 'Priya Sharma', email: 'priya@greenplate.in', phone: '+91 97654 32109', company: 'GreenPlate Organics', service: 'E-commerce Website', budget: '₹59,999 - ₹1,00,999', status: 'Responded', message: 'Looking for a custom Next.js e-commerce store with Razorpay payment gateway integration.', country: 'India' },
    { id: 'l3', createdAt: new Date(Date.now() - 172800000).toISOString(), name: 'Vikram Patel', email: 'vikram@buildcraft.in', phone: '+91 98901 23456', company: 'BuildCraft Infrastructures', service: 'SaaS Platform Development', budget: '₹1,00,999+', status: 'Viewed', message: 'Enterprise software architecture for infrastructure asset monitoring.', country: 'India' },
  ],
  pdfs: [
    { id: 'p1', createdAt: new Date().toISOString(), pdfType: 'Questionnaire Proposal', title: 'Project Proposal - Nexus Financial', clientName: 'Rajesh Mehta', clientEmail: 'rajesh@nexusfin.com', fileSizeKb: 195, deviceType: 'desktop', browser: 'Chrome', os: 'Windows' },
    { id: 'p2', createdAt: new Date(Date.now() - 86400000).toISOString(), pdfType: 'Discovery Questionnaire', title: 'Discovery Questionnaire - GreenPlate Organics', clientName: 'Priya Sharma', clientEmail: 'priya@greenplate.in', fileSizeKb: 172, deviceType: 'mobile', browser: 'Safari', os: 'iOS' },
  ],
  invoices: [
    {
      id: 'inv1',
      invoiceNumber: 'AROM-INV-2026-001',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 604800000).toISOString().slice(0, 10),
      clientName: 'Rajesh Mehta',
      clientEmail: 'rajesh@nexusfin.com',
      clientCompany: 'Nexus Financial Services',
      clientPhone: '+91 98230 11223',
      currency: 'INR',
      items: [
        { id: 'i1', description: 'Custom Business Website Development (Phase 1)', quantity: 1, unitPrice: 32999 },
        { id: 'i2', description: 'SEO & Performance Optimization Package', quantity: 1, unitPrice: 8500 },
      ],
      taxRate: 18,
      discountRate: 0,
      subtotal: 41499,
      taxAmount: 7469.82,
      discountAmount: 0,
      totalAmount: 48968.82,
      status: 'Pending',
      notes: 'Payment due within 7 days of invoice issue date. Thank you for partnering with AROM STUDIO.',
    },
  ],
  logs: [
    { id: 'g1', createdAt: new Date().toISOString(), type: 'system', event: 'Admin Session Initialized', detail: 'Admin portal logged in successfully', severity: 'info' },
    { id: 'g2', createdAt: new Date(Date.now() - 3600000).toISOString(), type: 'lead', event: 'New Contact Form Submission', detail: 'Lead received from Rajesh Mehta', severity: 'info' },
  ],
}

// Load data helper
export function getAdminStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        visitors: parsed.visitors || DEFAULT_INITIAL_DATA.visitors,
        leads: parsed.leads || DEFAULT_INITIAL_DATA.leads,
        pdfs: parsed.pdfs || DEFAULT_INITIAL_DATA.pdfs,
        invoices: parsed.invoices || DEFAULT_INITIAL_DATA.invoices,
        logs: parsed.logs || DEFAULT_INITIAL_DATA.logs,
      }
    }
  } catch (e) {
    console.error('Failed to read admin store:', e)
  }
  saveAdminStore(DEFAULT_INITIAL_DATA)
  return DEFAULT_INITIAL_DATA
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
      hour12: true,
    }) + ' IST'
  } catch {
    return dateString
  }
}

// API Record Helpers
export function recordAdminVisit(page: string, referrer: string = 'Direct') {
  const store = getAdminStore()
  const ua = navigator.userAgent
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua)

  const newVisit: AdminVisitor = {
    id: 'v_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    page,
    deviceType: mobile ? 'mobile' : 'desktop',
    browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Edge',
    os: ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : 'iOS',
    country: 'India',
    referrer: referrer || 'Direct',
    timeOnPage: Math.floor(Math.random() * 60) + 15,
    scrollDepth: Math.floor(Math.random() * 40) + 60,
  }

  store.visitors.unshift(newVisit)
  if (store.visitors.length > 500) store.visitors.pop()
  saveAdminStore(store)
}

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
  
  // Add log
  store.logs.unshift({
    id: 'g_' + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    type: 'lead',
    event: 'New Form Inquiry',
    detail: `Lead from ${lead.name} (${lead.service || 'General'})`,
    severity: 'info',
  })

  saveAdminStore(store)
}

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
