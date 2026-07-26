import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const emailSchema = z.string().email().max(255)

export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]{7,20}$/).optional()

export const urlSchema = z.string().url().max(2048).optional()

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export const loginSchema = z.object({
  password: z.string().min(1).max(256),
})

export const visitorCreateSchema = z.object({
  page: z.string().max(500).optional(),
  sessionId: z.string().max(100).optional(),
  referrer: z.string().max(1000).optional(),
  deviceInfo: z.object({
    browser: z.string().max(50).optional(),
    os: z.string().max(50).optional(),
    deviceType: z.string().max(50).optional(),
  }).optional(),
})

export const leadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(200).optional(),
  service: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
  country: z.string().max(100).optional(),
})

export const leadUpdateSchema = z.object({
  status: z.enum(['NEW', 'VIEWED', 'RESPONDED', 'ARCHIVED']),
})

export const invoiceCreateSchema = z.object({
  invoiceNumber: z.string().min(1).max(50),
  clientName: z.string().min(1).max(200),
  clientEmail: emailSchema,
  clientPhone: z.string().max(50).optional(),
  clientCompany: z.string().max(200).optional(),
  currency: z.enum(['INR', 'USD']).default('INR'),
  items: z.array(z.object({
    id: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
  })).min(1),
  taxRate: z.number().min(0).max(100).default(0),
  discountRate: z.number().min(0).max(100).default(0),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  dueDate: z.string().datetime(),
  notes: z.string().max(2000).optional(),
})

export const projectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  clientId: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'LAUNCHED', 'ARCHIVED']).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
})

export const clientCreateSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(200),
  email: emailSchema,
  phone: z.string().max(50).optional(),
  website: urlSchema,
  notes: z.string().max(5000).optional(),
})

export const settingUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
})

export const discoveryCreateSchema = z.object({
  fullName: z.string().min(1).max(200),
  company: z.string().max(200),
  email: emailSchema,
  phone: z.string().max(50).optional(),
  website: z.string().max(500).optional(),
  budget: z.string().max(100).optional(),
  urgency: z.string().max(100).optional(),
  preferredLaunchDate: z.string().max(100).optional(),
  contentProvider: z.string().max(100).optional(),
})

export const linkClickSchema = z.object({
  type: z.string().max(50).optional(),
  label: z.string().max(500).optional(),
  page: z.string().max(500).optional(),
  sessionId: z.string().max(100).optional(),
})

export const blogCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  coverImage: z.string().max(500).optional(),
  published: z.boolean().default(false),
  author: z.string().max(100).optional(),
})

export const blogUpdateSchema = blogCreateSchema.partial()

export const aiConversationSaveSchema = z.object({
  id: z.string().optional(),
  action: z.enum(['save', 'delete', 'rename']),
  title: z.string().max(200).optional(),
  data: z.any().optional(),
})

export const aiKnowledgeSaveSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    category: z.string().max(100).optional(),
    title: z.string().max(200).optional(),
    question: z.string().min(1),
    answer: z.string().optional(),
    priority: z.number().int().optional(),
    status: z.string().optional(),
    language: z.string().optional(),
  })),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})
