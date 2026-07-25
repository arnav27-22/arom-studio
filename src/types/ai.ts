// AROM STUDIO — AI Types Definition for Unlimited AI Knowledge Engine (v1.0)

export type { AiConversation, AiMessage } from '../lib/aiStore'

export interface AiKnowledgeItem {
  id: string
  category: string
  title?: string
  question: string
  alternateQuestions?: string[]
  synonyms?: string[]
  keywords: string[]
  description?: string
  detailedAnswer?: string
  answer?: string
  shortAnswer?: string
  relatedTopics?: string[]
  navigationLinks?: string[]
  tags?: string[]
  priority?: number
  language?: string
  version?: string
  status?: 'Active' | 'Archived' | 'Draft'
  createdAt?: string
  updatedAt?: string
  author?: string
  source?: string
  searchScore?: number
}

// Future Feature Readiness Interfaces (Architecture Only)
export interface FutureAppointmentBooking {
  id: string
  visitorId: string
  serviceType: string
  preferredDate: string
  status: 'Pending' | 'Confirmed' | 'Cancelled'
}

export interface FutureProjectEstimate {
  id: string
  visitorId: string
  estimatedCost: number
  recommendedTier: string
  features: string[]
}
