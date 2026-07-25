import { INITIAL_AI_KNOWLEDGE, type AiKnowledgeItem } from './aiEngine'

export interface AiMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
}

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
    __visitorId = 'vis_ai_' + Math.random().toString(36).slice(2, 9)
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

  api('/api/admin/ai/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', data: conversation }),
  }).catch(() => {})
}

export function deleteAiConversation(id: string) {
  __conversations = __conversations.filter(c => c.id !== id)

  api('/api/admin/ai/conversations', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).catch(() => {})
}

export function renameAiConversation(id: string, newTitle: string) {
  const target = __conversations.find(c => c.id === id)
  if (target) target.title = newTitle

  api('/api/admin/ai/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', id, title: newTitle }),
  }).catch(() => {})
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
