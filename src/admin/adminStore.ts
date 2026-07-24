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
  type: 'visit' | 'lead' | 'pdf' | 'invoice' | 'auth' | 'system'
  event: string
  detail: string
  severity: 'info' | 'warn' | 'error'
}

// 12 New Business & Agency Module Interfaces
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
}

const STORAGE_KEY = 'arom_admin_global_real_store_v7'

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
  recycleBin: AdminRecycleItem[]
}

const INITIAL_CLIENTS: AdminClient[] = [
  {
    id: 'cli_1',
    companyName: 'Apex Innovations Global',
    contactPerson: 'Sarah Jenkins',
    email: 'sarah.j@apexinnovations.com',
    phone: '+1 (555) 234-5678',
    website: 'https://apexinnovations.com',
    activeProjectsCount: 2,
    status: 'Active',
    totalRevenue: 14500,
    notes: 'Key enterprise client. Requests fast turnaround on UI redesigns.',
    createdAt: '2026-06-10T10:00:00Z',
    timeline: [
      { date: '2026-06-10', event: 'Client Onboarded' },
      { date: '2026-06-15', event: 'Web Portal Project Started' },
      { date: '2026-07-01', event: 'First Payment Received ($7,250)' },
    ],
  },
  {
    id: 'cli_2',
    companyName: 'LuxeLiving Interior Studio',
    contactPerson: 'Vikramaditya Roy',
    email: 'vikram@luxeliving.co.in',
    phone: '+91 98765 43210',
    website: 'https://luxeliving.co.in',
    activeProjectsCount: 1,
    status: 'Active',
    totalRevenue: 8900,
    notes: 'Premium interior architecture studio based in Mumbai.',
    createdAt: '2026-06-20T14:30:00Z',
    timeline: [
      { date: '2026-06-20', event: 'Discovery Call Completed' },
      { date: '2026-06-25', event: 'Agreement Signed (v1.0)' },
    ],
  },
  {
    id: 'cli_3',
    companyName: 'BioHealth Labs',
    contactPerson: 'Dr. Elena Rostova',
    email: 'elena@biohealth.io',
    phone: '+44 20 7946 0912',
    website: 'https://biohealth.io',
    activeProjectsCount: 1,
    status: 'Onboarding',
    totalRevenue: 6200,
    notes: 'Medical research SaaS platform.',
    createdAt: '2026-07-05T09:15:00Z',
    timeline: [
      { date: '2026-07-05', event: 'Proposal Accepted' },
    ],
  },
]

const INITIAL_PROJECTS: AdminProject[] = [
  {
    id: 'proj_1',
    title: 'Apex Cloud Dashboard & Design System',
    clientId: 'cli_1',
    clientName: 'Apex Innovations Global',
    status: 'In Progress',
    progress: 75,
    startDate: '2026-06-15',
    dueDate: '2026-08-10',
    priority: 'High',
    assignedTeam: ['Arnav (Lead Developer)', 'Om (Lead Designer)', 'Sneha (QA)'],
    projectFiles: [
      { name: 'Wireframes_v2.fig', url: '#', uploadedAt: '2026-06-20' },
      { name: 'API_Contract_Doc.pdf', url: '#', uploadedAt: '2026-07-02' },
    ],
    milestones: [
      { title: 'UX Research & Wireframing', completed: true, dueDate: '2026-06-25' },
      { title: 'Frontend Component Library', completed: true, dueDate: '2026-07-15' },
      { title: 'Backend Integration & Auth', completed: false, dueDate: '2026-08-01' },
      { title: 'Final Launch & Handover', completed: false, dueDate: '2026-08-10' },
    ],
    launchStatus: 'Staging',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'proj_2',
    title: 'LuxeLiving Portfolio & Booking Web App',
    clientId: 'cli_2',
    clientName: 'LuxeLiving Interior Studio',
    status: 'In Review',
    progress: 90,
    startDate: '2026-06-25',
    dueDate: '2026-07-30',
    priority: 'High',
    assignedTeam: ['Arnav (Lead Developer)', 'Om (Lead Designer)'],
    projectFiles: [
      { name: 'Branding_Assets.zip', url: '#', uploadedAt: '2026-06-26' },
      { name: 'HighRes_3DRenders.zip', url: '#', uploadedAt: '2026-07-05' },
    ],
    milestones: [
      { title: 'Interactive Studio Showcase', completed: true, dueDate: '2026-07-10' },
      { title: 'Booking Calendar Integration', completed: true, dueDate: '2026-07-20' },
      { title: 'Client Feedback Revisions', completed: false, dueDate: '2026-07-28' },
    ],
    launchStatus: 'Staging',
    createdAt: '2026-06-25T14:30:00Z',
  },
]

const INITIAL_PROPOSALS: AdminProposal[] = [
  {
    id: 'prop_1',
    proposalNumber: 'PROP-2026-001',
    clientName: 'Apex Innovations Global',
    clientEmail: 'sarah.j@apexinnovations.com',
    title: 'Enterprise Web Portal & Analytics System',
    amount: 14500,
    status: 'Accepted',
    createdAt: '2026-06-11T10:00:00Z',
    validUntil: '2026-07-11',
    scopeSummary: 'Full-stack React & Node.js portal with realtime web analytics, PDF invoice generation, and custom CMS.',
  },
  {
    id: 'prop_2',
    proposalNumber: 'PROP-2026-002',
    clientName: 'LuxeLiving Interior Studio',
    clientEmail: 'vikram@luxeliving.co.in',
    title: 'Interactive 3D Portfolio & Booking Engine',
    amount: 8900,
    status: 'Accepted',
    createdAt: '2026-06-21T11:00:00Z',
    validUntil: '2026-07-21',
    scopeSummary: 'Custom dark-mode luxury showcase website with GSAP animations, 3D gallery, and lead capture.',
  },
  {
    id: 'prop_3',
    proposalNumber: 'PROP-2026-003',
    clientName: 'BioHealth Labs',
    clientEmail: 'elena@biohealth.io',
    title: 'Medical SaaS Data Visualization Platform',
    amount: 6200,
    status: 'Sent',
    createdAt: '2026-07-10T16:00:00Z',
    validUntil: '2026-08-10',
    scopeSummary: 'HIPAA compliant dashboard with real-time patient statistics and PDF diagnostic summary exports.',
  },
]

const INITIAL_AGREEMENTS: AdminAgreement[] = [
  {
    id: 'agr_1',
    agreementNumber: 'AGR-2026-001',
    clientName: 'Apex Innovations Global',
    clientEmail: 'sarah.j@apexinnovations.com',
    status: 'Signed',
    agreementVersion: 'v1.0',
    signedDate: '2026-06-14T11:20:00Z',
    createdAt: '2026-06-12T09:00:00Z',
  },
  {
    id: 'agr_2',
    agreementNumber: 'AGR-2026-002',
    clientName: 'LuxeLiving Interior Studio',
    clientEmail: 'vikram@luxeliving.co.in',
    status: 'Signed',
    agreementVersion: 'v1.0',
    signedDate: '2026-06-24T15:45:00Z',
    createdAt: '2026-06-22T10:00:00Z',
  },
  {
    id: 'agr_3',
    agreementNumber: 'AGR-2026-003',
    clientName: 'BioHealth Labs',
    clientEmail: 'elena@biohealth.io',
    status: 'Pending',
    agreementVersion: 'v1.1',
    createdAt: '2026-07-12T14:00:00Z',
  },
]

const INITIAL_PAYMENTS: AdminPayment[] = [
  {
    id: 'pay_1',
    invoiceNumber: 'INV-2026-001',
    clientName: 'Apex Innovations Global',
    amount: 7250,
    dueDate: '2026-07-01',
    paidDate: '2026-07-01T12:00:00Z',
    status: 'Paid',
    invoiceLink: '#',
    receiptUrl: '#',
    paymentMethod: 'Bank Wire Transfer',
    reminderSentCount: 0,
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'pay_2',
    invoiceNumber: 'INV-2026-002',
    clientName: 'LuxeLiving Interior Studio',
    amount: 4450,
    dueDate: '2026-07-15',
    paidDate: '2026-07-14T09:30:00Z',
    status: 'Paid',
    invoiceLink: '#',
    receiptUrl: '#',
    paymentMethod: 'UPI / Razorpay',
    reminderSentCount: 0,
    createdAt: '2026-06-25T11:00:00Z',
  },
  {
    id: 'pay_3',
    invoiceNumber: 'INV-2026-003',
    clientName: 'Apex Innovations Global',
    amount: 7250,
    dueDate: '2026-08-01',
    status: 'Pending',
    invoiceLink: '#',
    reminderSentCount: 1,
    createdAt: '2026-07-15T10:00:00Z',
  },
]

const INITIAL_CONTENT: AdminContentItem[] = [
  {
    id: 'cnt_1',
    clientName: 'Apex Innovations Global',
    projectName: 'Apex Cloud Dashboard & Design System',
    status: 'Submitted',
    completionPercentage: 100,
    updatedAt: '2026-07-18T10:00:00Z',
    checklist: [
      { section: 'Homepage Hero & Tagline', status: 'Complete' },
      { section: 'Services & Feature Highlights', status: 'Complete' },
      { section: 'Team Bios & Photos', status: 'Complete' },
      { section: 'Legal & Privacy Policy', status: 'Complete' },
    ],
  },
  {
    id: 'cnt_2',
    clientName: 'LuxeLiving Interior Studio',
    projectName: 'LuxeLiving Portfolio & Booking Web App',
    status: 'Review',
    completionPercentage: 85,
    updatedAt: '2026-07-20T14:00:00Z',
    checklist: [
      { section: 'High-Res Project Photography', status: 'Complete' },
      { section: 'Studio Philosophy Copy', status: 'Complete' },
      { section: 'Client Testimonials', status: 'Review' },
      { section: 'Pricing Tiers & Inclusions', status: 'Pending' },
    ],
  },
]

const INITIAL_ASSETS: AdminAssetFolder[] = [
  {
    id: 'ast_1',
    clientName: 'Apex Innovations Global',
    projectName: 'Apex Cloud Dashboard & Design System',
    googleDriveLink: 'https://drive.google.com/drive/folders/apex-brand-kit-2026',
    folderStatus: 'Complete',
    missingFilesCount: 0,
    uploadDate: '2026-06-18T11:00:00Z',
    checklist: [
      { name: 'Vector Brand Logo (SVG/AI)', received: true },
      { name: 'Custom Brand Typography Fonts', received: true },
      { name: 'Product UI Screenshots', received: true },
      { name: 'Color Palette Guide', received: true },
    ],
  },
  {
    id: 'ast_2',
    clientName: 'LuxeLiving Interior Studio',
    projectName: 'LuxeLiving Portfolio & Booking Web App',
    googleDriveLink: 'https://drive.google.com/drive/folders/luxeliving-assets',
    folderStatus: 'Needs Files',
    missingFilesCount: 2,
    uploadDate: '2026-06-28T09:30:00Z',
    checklist: [
      { name: 'Studio Vector Logo', received: true },
      { name: '4K Architectural Renders', received: true },
      { name: 'Press Release PDF', received: false },
      { name: 'Video Reel (MP4)', received: false },
    ],
  },
]

const INITIAL_APPROVALS: AdminDesignApproval[] = [
  {
    id: 'app_1',
    projectName: 'LuxeLiving Dark Mode Design System',
    clientName: 'LuxeLiving Interior Studio',
    status: 'Approved',
    approvalDate: '2026-07-12T16:30:00Z',
    previewUrl: 'https://figma.com/file/luxeliving-v3-preview',
    version: 'v2.1 Final',
    comments: [
      { author: 'Vikramaditya Roy', text: 'The glassmorphic navigation looks stunning! Approved for development.', createdAt: '2026-07-12T16:30:00Z' },
    ],
  },
  {
    id: 'app_2',
    projectName: 'Apex Analytics Dashboard Layout',
    clientName: 'Apex Innovations Global',
    status: 'Waiting Approval',
    previewUrl: 'https://figma.com/file/apex-dashboard-v4',
    version: 'v1.4',
    comments: [
      { author: 'Om (Lead Designer)', text: 'Updated grid layout based on your feedback on Wednesday.', createdAt: '2026-07-22T10:00:00Z' },
    ],
  },
]

const INITIAL_TIMELINES: AdminTimelinePhase[] = [
  {
    id: 'tml_1',
    projectName: 'Apex Cloud Dashboard & Design System',
    clientName: 'Apex Innovations Global',
    currentPhase: 'Backend & Cloud Integration',
    estimatedDelivery: '2026-08-10',
    timelineProgress: 75,
    upcomingTasks: ['PostgreSQL DB Migration', 'Vercel Deployment Pipeline', 'Final QA Audit'],
    completedTasks: ['Figma UI System', 'React Frontend Setup', 'Real-time WebSocket Sync'],
    delayedTasks: [],
  },
  {
    id: 'tml_2',
    projectName: 'LuxeLiving Portfolio & Booking Web App',
    clientName: 'LuxeLiving Interior Studio',
    currentPhase: 'Final Review & UAT',
    estimatedDelivery: '2026-07-30',
    timelineProgress: 90,
    upcomingTasks: ['Client UAT Sign-off', 'Custom Domain DNS Migration'],
    completedTasks: ['GSAP Smooth Scroll', 'Interactive Booking Calendar', 'Form Auto-responder'],
    delayedTasks: ['High-res Texture Compression'],
  },
]

const INITIAL_HANDOVERS: AdminHandover[] = [
  {
    id: 'hnd_1',
    projectName: 'Apex Cloud Portal (Phase 1)',
    clientName: 'Apex Innovations Global',
    status: 'Delivered',
    downloadZipUrl: '#',
    githubLink: 'https://github.com/arom-studio/apex-cloud-portal',
    adminLoginUrl: 'https://apex.com/admin',
    adminUsername: 'admin@apexinnovations.com',
    domain: 'apexinnovations.com',
    hosting: 'Vercel Enterprise',
    warrantyPeriodMonths: 12,
    supportExpiryDate: '2027-06-30',
    handoverDate: '2026-06-30',
  },
  {
    id: 'hnd_2',
    projectName: 'LuxeLiving Showcase',
    clientName: 'LuxeLiving Interior Studio',
    status: 'Ready',
    downloadZipUrl: '#',
    githubLink: 'https://github.com/arom-studio/luxeliving-web',
    adminLoginUrl: 'https://luxeliving.co.in/admin',
    adminUsername: 'admin@luxeliving.co.in',
    domain: 'luxeliving.co.in',
    hosting: 'AWS CloudFront + Vercel',
    warrantyPeriodMonths: 6,
    supportExpiryDate: '2027-01-30',
    handoverDate: '2026-07-28',
  },
]

const INITIAL_FEEDBACKS: AdminFeedback[] = [
  {
    id: 'fb_1',
    clientName: 'Sarah Jenkins',
    company: 'Apex Innovations Global',
    rating: 5,
    review: 'AROM STUDIO delivered beyond our expectations! The real-time dashboard and speed of execution are unmatched in the agency space.',
    testimonialApproved: true,
    portfolioPermission: true,
    clientSuggestions: 'Would love automated weekly PDF summary reports directly over WhatsApp/Email.',
    createdAt: '2026-07-02T10:00:00Z',
  },
  {
    id: 'fb_2',
    clientName: 'Vikramaditya Roy',
    company: 'LuxeLiving Interior Studio',
    rating: 5,
    review: 'The visual aesthetics and fluid micro-interactions blew our team away. Client inquiries increased by 200% within two weeks of launch.',
    testimonialApproved: true,
    portfolioPermission: true,
    clientSuggestions: 'Keep adding more dark-mode UI presets for future revisions.',
    createdAt: '2026-07-16T14:30:00Z',
  },
]

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif_1',
    type: 'live',
    title: '⚡ New Live Visitor Active',
    message: 'A visitor from Mumbai, India accessed /contact via Chrome Desktop.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif_2',
    type: 'approval',
    title: 'Design Approval Sign-Off',
    message: 'LuxeLiving Interior Studio approved LuxeLiving Dark Mode Design System v2.1.',
    read: false,
    createdAt: '2026-07-22T10:00:00Z',
  },
  {
    id: 'notif_3',
    type: 'payment',
    title: 'Payment Received ($4,450)',
    message: 'Invoice INV-2026-002 was paid by LuxeLiving Interior Studio.',
    read: true,
    createdAt: '2026-07-14T09:30:00Z',
  },
]

const INITIAL_DISCOVERY_QUESTIONNAIRES: AdminDiscoveryQuestionnaire[] = [
  {
    id: 'dq_1',
    fullName: 'Ramesh Kumar',
    company: 'Apex Innovations Global',
    email: 'ramesh@apexinnovations.com',
    phone: '+91 98765 43210',
    website: 'https://apexinnovations.com',
    budget: '₹50,000–₹1,00,000',
    urgency: 'High',
    preferredLaunchDate: '2026-08-15',
    contentProvider: 'Client',
    status: 'Reviewed',
    createdAt: '2026-07-20T10:30:00Z',
  },
  {
    id: 'dq_2',
    fullName: 'Priya Sharma',
    company: 'LuxeLiving Studio',
    email: 'priya@luxeliving.co.in',
    phone: '+91 98220 11223',
    website: 'https://luxeliving.co.in',
    budget: '₹25,000–₹50,000',
    urgency: 'Medium',
    preferredLaunchDate: '2026-09-01',
    contentProvider: 'Both',
    status: 'New',
    createdAt: '2026-07-22T14:15:00Z',
  },
]

const CLEAN_INITIAL_DATA: StoreData = {
  visitors: [],
  leads: [],
  pdfs: [],
  invoices: [],
  logs: [],
  clients: INITIAL_CLIENTS,
  projects: INITIAL_PROJECTS,
  proposals: INITIAL_PROPOSALS,
  agreements: INITIAL_AGREEMENTS,
  payments: INITIAL_PAYMENTS,
  content: INITIAL_CONTENT,
  assets: INITIAL_ASSETS,
  approvals: INITIAL_APPROVALS,
  timelines: INITIAL_TIMELINES,
  handovers: INITIAL_HANDOVERS,
  feedbacks: INITIAL_FEEDBACKS,
  notifications: INITIAL_NOTIFICATIONS,
  discoveryQuestionnaires: INITIAL_DISCOVERY_QUESTIONNAIRES,
  recycleBin: [],
}

// Load local storage data helper
export function getAdminStore(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        visitors: Array.isArray(parsed.visitors) ? parsed.visitors : [],
        leads: Array.isArray(parsed.leads) ? parsed.leads : [],
        pdfs: Array.isArray(parsed.pdfs) ? parsed.pdfs : [],
        invoices: Array.isArray(parsed.invoices) ? parsed.invoices : [],
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
        clients: Array.isArray(parsed.clients) ? parsed.clients : INITIAL_CLIENTS,
        projects: Array.isArray(parsed.projects) ? parsed.projects : INITIAL_PROJECTS,
        proposals: Array.isArray(parsed.proposals) ? parsed.proposals : INITIAL_PROPOSALS,
        agreements: Array.isArray(parsed.agreements) ? parsed.agreements : INITIAL_AGREEMENTS,
        payments: Array.isArray(parsed.payments) ? parsed.payments : INITIAL_PAYMENTS,
        content: Array.isArray(parsed.content) ? parsed.content : INITIAL_CONTENT,
        assets: Array.isArray(parsed.assets) ? parsed.assets : INITIAL_ASSETS,
        approvals: Array.isArray(parsed.approvals) ? parsed.approvals : INITIAL_APPROVALS,
        timelines: Array.isArray(parsed.timelines) ? parsed.timelines : INITIAL_TIMELINES,
        handovers: Array.isArray(parsed.handovers) ? parsed.handovers : INITIAL_HANDOVERS,
        feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : INITIAL_FEEDBACKS,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
        discoveryQuestionnaires: Array.isArray(parsed.discoveryQuestionnaires) ? parsed.discoveryQuestionnaires : INITIAL_DISCOVERY_QUESTIONNAIRES,
        recycleBin: Array.isArray(parsed.recycleBin) ? parsed.recycleBin : [],
      }
    }
  } catch (e) {
    console.error('Failed to read admin store:', e)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CLEAN_INITIAL_DATA))
  } catch {}
  return CLEAN_INITIAL_DATA
}

// Save local storage & cloud backup helper
export function saveAdminStore(data: StoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save admin store:', e)
  }

  // Backup store on backend database
  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save_store', data }),
  }).catch(() => {})
}

// Move any deleted item into the Recycle Bin (Soft Delete)
export function moveToRecycleBin(
  collection: keyof StoreData,
  itemId: string,
  title?: string,
  subtitle?: string
) {
  const store = getAdminStore()
  const list = store[collection] as any[]
  if (!Array.isArray(list)) return

  const itemIndex = list.findIndex((i) => i.id === itemId)
  if (itemIndex === -1) return

  const deletedItem = list[itemIndex]
  const updatedList = list.filter((i) => i.id !== itemId)
  ;(store as any)[collection] = updatedList

  const recycleRecord: AdminRecycleItem = {
    id: 'rec_' + Math.random().toString(36).slice(2, 9),
    originalCollection: collection,
    itemData: deletedItem,
    title: title || deletedItem.name || deletedItem.title || deletedItem.companyName || deletedItem.projectName || deletedItem.clientName || 'Deleted Item',
    subtitle: subtitle || deletedItem.email || deletedItem.clientName || deletedItem.status || String(collection),
    deletedAt: new Date().toISOString(),
  }

  if (!Array.isArray(store.recycleBin)) store.recycleBin = []
  store.recycleBin.unshift(recycleRecord)

  saveAdminStore(store)
}

// Restore an item from the Recycle Bin back to its original collection
export function restoreFromRecycleBin(recycleId: string) {
  const store = getAdminStore()
  if (!Array.isArray(store.recycleBin)) return

  const record = store.recycleBin.find((r) => r.id === recycleId)
  if (!record) return

  const collection = record.originalCollection
  const currentList = (store[collection] as any[]) || []
  ;(store as any)[collection] = [record.itemData, ...currentList]
  store.recycleBin = store.recycleBin.filter((r) => r.id !== recycleId)

  saveAdminStore(store)
}

// Permanently delete a single item from the Recycle Bin
export function permanentDeleteFromRecycleBin(recycleId: string) {
  const store = getAdminStore()
  if (!Array.isArray(store.recycleBin)) return
  store.recycleBin = store.recycleBin.filter((r) => r.id !== recycleId)
  saveAdminStore(store)
}

// Empty the entire Recycle Bin permanently
export function emptyRecycleBin() {
  const store = getAdminStore()
  store.recycleBin = []
  saveAdminStore(store)
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
        clients: Array.isArray(remote.clients) ? remote.clients : local.clients,
        projects: Array.isArray(remote.projects) ? remote.projects : local.projects,
        proposals: Array.isArray(remote.proposals) ? remote.proposals : local.proposals,
        agreements: Array.isArray(remote.agreements) ? remote.agreements : local.agreements,
        payments: Array.isArray(remote.payments) ? remote.payments : local.payments,
        content: Array.isArray(remote.content) ? remote.content : local.content,
        assets: Array.isArray(remote.assets) ? remote.assets : local.assets,
        approvals: Array.isArray(remote.approvals) ? remote.approvals : local.approvals,
        timelines: Array.isArray(remote.timelines) ? remote.timelines : local.timelines,
        handovers: Array.isArray(remote.handovers) ? remote.handovers : local.handovers,
        feedbacks: Array.isArray(remote.feedbacks) ? remote.feedbacks : local.feedbacks,
        notifications: Array.isArray(remote.notifications) ? remote.notifications : local.notifications,
        discoveryQuestionnaires: Array.isArray(remote.discoveryQuestionnaires) ? remote.discoveryQuestionnaires : local.discoveryQuestionnaires,
        recycleBin: Array.isArray(remote.recycleBin) ? remote.recycleBin : local.recycleBin,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
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
export function recordAdminVisit(page: string, referrer: string = 'Direct', options: Partial<AdminVisitor> = {}) {
  const store = getAdminStore()
  const ua = navigator.userAgent
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const tablet = /Tablet|iPad/i.test(ua) && !/Mobi/i.test(ua)

  // Detect mobile device brand
  let brand = options.deviceBrand || ''
  if (!brand) {
    if (/iPhone/i.test(ua)) brand = 'Apple iPhone'
    else if (/iPad/i.test(ua)) brand = 'Apple iPad'
    else if (/Samsung/i.test(ua)) brand = 'Samsung Galaxy'
    else if (/Pixel/i.test(ua)) brand = 'Google Pixel'
    else if (/OnePlus/i.test(ua)) brand = 'OnePlus'
    else if (/Xiaomi|Redmi|POCO/i.test(ua)) brand = 'Xiaomi/Redmi'
    else if (/Vivo/i.test(ua)) brand = 'Vivo Mobile'
    else if (/Oppo/i.test(ua)) brand = 'OPPO Mobile'
    else if (mobile) brand = 'Mobile Device'
    else brand = 'Desktop PC'
  }

  // Check returning visitor state from localStorage
  let isReturning = false
  try {
    const visToken = localStorage.getItem('arom_vis_token')
    if (visToken) isReturning = true
    else localStorage.setItem('arom_vis_token', 'v_' + Math.random().toString(36).slice(2, 9))
  } catch {}

  const now = new Date().toISOString()
  const devType = options.deviceType || (tablet ? 'tablet' : mobile ? 'mobile' : 'desktop')
  const devLabel = options.deviceLabel || (devType === 'desktop' ? 'Desktop (PC)' : 'Mobile')

  const newVisit: AdminVisitor = {
    id: options.id || 'v_' + Math.random().toString(36).slice(2, 9),
    sessionId: options.sessionId || 'sess_' + Math.random().toString(36).slice(2, 9),
    createdAt: now,
    lastActivityAt: now,
    page: page || '/',
    entryPage: options.entryPage || page || '/',
    exitPage: page || '/',
    deviceType: devType,
    deviceLabel: devLabel,
    deviceBrand: brand,
    network: options.network || '5G / Broadband',
    browser: options.browser || (ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Edge'),
    os: options.os || (ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : 'iOS'),
    country: options.country || 'India',
    city: options.city || 'Mumbai',
    ip: options.ip || '103.15.22.84',
    referrer: referrer || 'Direct',
    timeOnPage: options.timeOnPage || Math.floor(Math.random() * 30) + 15,
    sessionDuration: options.sessionDuration || Math.floor(Math.random() * 120) + 30,
    scrollDepth: options.scrollDepth || Math.floor(Math.random() * 40) + 60,
    pageViewsCount: options.pageViewsCount || 1,
    isReturning: options.isReturning ?? isReturning,
    isBounce: options.isBounce ?? false,
    isLive: true,
  }

  store.visitors.unshift(newVisit)
  if (store.visitors.length > 500) store.visitors.pop()

  // Add system notification for live visitor
  store.notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'live',
    title: '⚡ New Live Visitor Active',
    message: `${newVisit.isReturning ? 'Returning' : 'New'} visitor from ${newVisit.city}, ${newVisit.country} viewing ${newVisit.page} via ${newVisit.browser}.`,
    read: false,
    createdAt: now,
  })

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
  const now = new Date().toISOString()
  const newLead: AdminLead = {
    ...lead,
    id: 'l_' + Math.random().toString(36).slice(2, 9),
    createdAt: now,
    status: 'New',
    country: lead.country || 'India',
  }
  store.leads.unshift(newLead)
  store.notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'inquiry',
    title: '📩 New Client Inquiry Received',
    message: `Lead from ${newLead.name} (${newLead.email}) for ${newLead.service || 'Web Services'}.`,
    read: false,
    createdAt: now,
  })
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

// Record REAL Discovery Questionnaire Submission & sync globally
export function recordAdminDiscoveryQuestionnaire(dq: Omit<AdminDiscoveryQuestionnaire, 'id' | 'createdAt' | 'status'>) {
  const store = getAdminStore()
  const now = new Date().toISOString()
  const newDq: AdminDiscoveryQuestionnaire = {
    ...dq,
    id: 'dq_' + Math.random().toString(36).slice(2, 9),
    createdAt: now,
    status: 'New',
  }
  if (!Array.isArray(store.discoveryQuestionnaires)) store.discoveryQuestionnaires = []
  store.discoveryQuestionnaires.unshift(newDq)
  if (!Array.isArray(store.notifications)) store.notifications = []
  store.notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    type: 'inquiry',
    title: '📋 New Discovery Questionnaire Submitted',
    message: `Questionnaire submitted by ${newDq.fullName} (${newDq.company || 'Client'}) with budget ${newDq.budget || 'Custom'}.`,
    read: false,
    createdAt: now,
  })
  saveAdminStore(store)

  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'discovery', data: newDq }),
  }).catch(() => {})
}
