import { prisma } from '../database/prisma'

const RESTORE_MAP: Record<string, string> = {
  VISITORS: 'visitor',
  PDFS: 'generatedPDF',
  LEADS: 'lead',
  CLIENTS: 'client',
  PROJECTS: 'project',
  PROPOSALS: 'proposal',
  AGREEMENTS: 'agreement',
  PAYMENTS: 'payment',
  CONTENT: 'contentCollection',
  ASSETS: 'asset',
  APPROVALS: 'designApproval',
  TIMELINES: 'projectTimeline',
  HANDOVERS: 'handover',
  FEEDBACKS: 'feedback',
  NOTIFICATIONS: 'notification',
  DISCOVERYQUESTIONNAIRES: 'discoveryForm',
  AI_CONVERSATIONS: 'aIConversation',
}

export async function restoreFromRecycle(record: { originalCollection: string; itemData: any; id: string }): Promise<boolean> {
  const model = (prisma as any)[RESTORE_MAP[record.originalCollection]]
  if (!model) return false

  const itemData = record.itemData as Record<string, unknown>
  try {
    await model.upsert({
      where: { id: itemData.id as string },
      update: { deletedAt: null },
      create: itemData as any,
    })
    return true
  } catch {
    return false
  }
}
