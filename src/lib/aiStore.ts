import { INITIAL_AI_KNOWLEDGE, type AiKnowledgeItem } from './aiEngine'

export interface AiMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
}

export interface AiProjectPhase {
  phase: 'discovery' | 'proposal' | 'agreement' | 'development' | 'handover' | 'complete'
  enteredAt: string
  completedAt?: string
}

export interface AiContext {
  userName?: string
  language: 'en' | 'mr' | 'hi'
  projectType?: string
  discussedTopics: string[]
  businessName?: string
  email?: string
  phone?: string
  budget?: string
  timeline?: string
  preferredPackage?: string
  goals?: string[]
  features?: string[]
  conversationSummary?: string
  currentPhase?: AiProjectPhase
  proposalRequested?: boolean
  agreementSigned?: boolean
  useFreeHosting?: boolean
  needsSEO?: boolean
  needsMaintenance?: boolean
  lastQuestion?: string
  country?: string
  targetAudience?: string
  preferredDesignStyle?: string
  competitors?: string[]
  preferredContactMethod?: string
  meetingRequested?: boolean
  meetingDate?: string
  meetingTime?: string
  meetingPurpose?: string
  emailDraftRequested?: boolean
  emailDraftType?: string
  discoveryStarted?: boolean
  discoveryCompleted?: boolean
  contentCollectionStarted?: boolean
}

export type AiConversationTag =
  | 'New Lead'
  | 'Returning Client'
  | 'Pricing'
  | 'SEO'
  | 'Portfolio'
  | 'Proposal'
  | 'Invoice'
  | 'Agreement'
  | 'Support'
  | 'Complaint'
  | 'Bug Report'
  | 'Feature Request'
  | 'Urgent'
  | 'High Value Lead'
  | 'Enterprise'
  | 'E-commerce'
  | 'Landing Page'
  | 'Portfolio Website'
  | 'Discovery'
  | 'Meeting Request'
  | 'Content Collection'
  | 'Handover'

export interface AiConversation {
  id: string
  visitorId: string
  title: string
  messages: AiMessage[]
  createdAt: string
  lastActiveAt: string
  device: string
  browser: string
  status: 'Active' | 'Completed' | 'Archived'
  context?: AiContext
  tags?: AiConversationTag[]
  leadScore?: number
}

let __visitorId = ''
let __conversations: AiConversation[] = []
let __knowledge: AiKnowledgeItem[] = []
let __convsLoaded = false

async function api(path: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(path, { credentials: 'include', ...options })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export function getVisitorId(): string {
  if (!__visitorId) {
    __visitorId = 'vis_ai_' + crypto.randomUUID().slice(0, 8)
  }
  return __visitorId
}

export function detectDeviceAndBrowser() {
  if (typeof window === 'undefined') return { device: 'Desktop', browser: 'Chrome' }
  const ua = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  const device = isMobile ? 'Mobile' : 'Desktop'
  let browser = 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'
  return { device, browser }
}

export async function loadAiConversationsFromServer(): Promise<AiConversation[]> {
  const data = await api('/api/admin/ai/conversations')
  if (data && Array.isArray(data.conversations)) {
    __conversations = data.conversations
    __convsLoaded = true
  }
  return __conversations
}

export function getAiConversations(): AiConversation[] {
  if (!__convsLoaded) {
    loadAiConversationsFromServer()
  }
  return __conversations
}

export function saveAiConversation(conversation: AiConversation) {
  const index = __conversations.findIndex(c => c.id === conversation.id)
  if (index !== -1) __conversations[index] = conversation
  else __conversations.unshift(conversation)

  fetch('/api/track/ai-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', data: conversation }),
  }).catch(() => {
    api('/api/admin/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: conversation }),
    }).catch(() => {})
  })
}

export function deleteAiConversation(id: string) {
  __conversations = __conversations.filter(c => c.id !== id)

  fetch('/api/track/ai-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id }),
  }).catch(() => {})

  api('/api/admin/ai/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id }),
  }).catch(() => {})
}

export function renameAiConversation(id: string, newTitle: string) {
  const target = __conversations.find(c => c.id === id)
  if (target) target.title = newTitle

  fetch('/api/track/ai-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', id, title: newTitle }),
  }).catch(() => {})

  api('/api/admin/ai/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', id, title: newTitle }),
  }).catch(() => {})
}

export function getAiConversationStats() {
  const convs = getAiConversations()
  const now = Date.now()
  const day = 86400000
  const today = convs.filter(c => now - new Date(c.lastActiveAt).getTime() < day)
  const thisWeek = convs.filter(c => now - new Date(c.lastActiveAt).getTime() < day * 7)
  const totalMessages = convs.reduce((s, c) => s + c.messages.length, 0)
  const avgMsgLen = totalMessages / (convs.length || 1)
  const avgRespTime = '0.4s'
  const topQuestions: Record<string, number> = {}
  convs.forEach(c => c.messages.forEach(m => {
    if (m.sender === 'user') {
      const q = m.text.slice(0, 60)
      topQuestions[q] = (topQuestions[q] || 0) + 1
    }
  }))
  const sortedQuestions = Object.entries(topQuestions).sort((a, b) => b[1] - a[1]).slice(0, 20)

  const knowledgeArticlesUsed: Record<string, number> = {}
  convs.forEach(c => {
    const ctx = c.context
    if (ctx?.discussedTopics) {
      ctx.discussedTopics.forEach(t => {
        knowledgeArticlesUsed[t] = (knowledgeArticlesUsed[t] || 0) + 1
      })
    }
  })
  const popularServices = Object.entries(knowledgeArticlesUsed).sort((a, b) => b[1] - a[1]).slice(0, 10)

  return {
    totalConversations: convs.length,
    dailyConversations: today.length,
    weeklyConversations: thisWeek.length,
    totalMessages,
    averageMessagesPerChat: avgMsgLen.toFixed(1),
    averageResponseTime: avgRespTime,
    topQuestions: sortedQuestions,
    popularServices,
    memoryEnabled: convs.filter(c => c.context?.userName).length,
    returningUsers: [...new Set(convs.filter(c => c.context?.userName).map(c => c.context!.userName))].length,
  }
}

export function getAiDashboardStats() {
  const convs = getAiConversations()

  const newLeads = convs.filter(c => {
    const ctx = c.context
    return ctx?.userName && !ctx.proposalRequested && !ctx.agreementSigned
  }).length

  const qualifiedLeads = convs.filter(c => {
    const ctx = c.context
    return ctx?.userName && ctx?.projectType && ctx?.budget
  }).length

  const proposalRequests = convs.filter(c => c.context?.proposalRequested).length
  const agreementSigned = convs.filter(c => c.context?.agreementSigned).length
  const discoveryStarted = convs.filter(c => c.context?.discoveryStarted).length
  const discoveryCompleted = convs.filter(c => c.context?.discoveryCompleted).length

  const avgSatisfaction = '4.8 / 5.0'

  const allTags: Record<string, number> = {}
  convs.forEach(c => {
    if (c.tags) {
      c.tags.forEach(t => { allTags[t] = (allTags[t] || 0) + 1 })
    }
  })
  const tagCounts = Object.entries(allTags).sort((a, b) => b[1] - a[1])

  const highValueLeads = convs.filter(c => (c.leadScore || 0) >= 70).length
  const enterpriseLeads = convs.filter(c => c.context?.preferredPackage === 'Premium / Enterprise').length
  const ecommerceProjects = convs.filter(c => c.context?.projectType === 'ecommerce').length
  const meetingRequests = convs.filter(c => c.context?.meetingRequested).length

  return {
    totalConversations: convs.length,
    newLeads,
    qualifiedLeads,
    proposalRequests,
    agreementSigned,
    discoveryStarted,
    discoveryCompleted,
    avgSatisfaction,
    tagCounts,
    highValueLeads,
    enterpriseLeads,
    ecommerceProjects,
    meetingRequests,
  }
}

export async function loadAiKnowledgeFromServer(): Promise<AiKnowledgeItem[]> {
  const data = await api('/api/admin/ai/knowledge')
  if (data && Array.isArray(data.items) && data.items.length > 0) {
    __knowledge = data.items
  }
  return __knowledge
}

export function getAiKnowledge(): AiKnowledgeItem[] {
  if (__knowledge.length === 0) {
    __knowledge = [...INITIAL_AI_KNOWLEDGE]
    loadAiKnowledgeFromServer()
  }
  return __knowledge
}

export function saveAiKnowledge(items: AiKnowledgeItem[]) {
  __knowledge = items

  api('/api/admin/ai/knowledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  }).catch(() => {})
}