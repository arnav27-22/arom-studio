// AROM STUDIO — AI Types Definition for Modular Architecture & Future Features

export type { AiConversation, AiMessage } from '../lib/aiStore'
export type { AiKnowledgeItem } from '../lib/aiEngine'

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
