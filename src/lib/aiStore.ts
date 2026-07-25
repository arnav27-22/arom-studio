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

const STORAGE_CONVERSATIONS_KEY = 'arom_ai_conversations_v1'
const STORAGE_KNOWLEDGE_KEY = 'arom_ai_knowledge_v1'
const STORAGE_VISITOR_KEY = 'arom_ai_visitor_id'

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(STORAGE_VISITOR_KEY)
    if (!id) {
      id = 'vis_ai_' + Math.random().toString(36).slice(2, 9)
      localStorage.setItem(STORAGE_VISITOR_KEY, id)
    }
    return id
  } catch {
    return 'vis_ai_anon'
  }
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

export function getAiConversations(): AiConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_CONVERSATIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Failed to read AI conversations:', e)
  }
  return []
}

export function saveAiConversation(conversation: AiConversation) {
  try {
    const conversations = getAiConversations()
    const index = conversations.findIndex((c) => c.id === conversation.id)
    if (index !== -1) {
      conversations[index] = conversation
    } else {
      conversations.unshift(conversation)
    }

    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations))

    // Sync globally to server endpoint
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ai_conversation', data: conversation }),
    }).catch(() => {})
  } catch (e) {
    console.error('Failed to save AI conversation:', e)
  }
}

export function deleteAiConversation(id: string) {
  try {
    let conversations = getAiConversations()
    conversations = conversations.filter((c) => c.id !== id)
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch (e) {
    console.error('Failed to delete AI conversation:', e)
  }
}

export function renameAiConversation(id: string, newTitle: string) {
  try {
    const conversations = getAiConversations()
    const target = conversations.find((c) => c.id === id)
    if (target) {
      target.title = newTitle
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations))
    }
  } catch (e) {
    console.error('Failed to rename AI conversation:', e)
  }
}

export function getAiKnowledge(): AiKnowledgeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KNOWLEDGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed to read AI Knowledge:', e)
  }
  return INITIAL_AI_KNOWLEDGE
}

export function saveAiKnowledge(items: AiKnowledgeItem[]) {
  try {
    localStorage.setItem(STORAGE_KNOWLEDGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save AI Knowledge:', e)
  }
}
