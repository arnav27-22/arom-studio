import { prisma } from '../database/prisma'

const MODEL_MAP: Record<string, { prismaModel: string; recycleKey: string }> = {
  visitors: { prismaModel: 'visitor', recycleKey: 'VISITORS' },
  pdfs: { prismaModel: 'generatedPDF', recycleKey: 'PDFS' },
  leads: { prismaModel: 'lead', recycleKey: 'LEADS' },
  clients: { prismaModel: 'client', recycleKey: 'CLIENTS' },
  projects: { prismaModel: 'project', recycleKey: 'PROJECTS' },
  proposals: { prismaModel: 'proposal', recycleKey: 'PROPOSALS' },
  agreements: { prismaModel: 'agreement', recycleKey: 'AGREEMENTS' },
  payments: { prismaModel: 'payment', recycleKey: 'PAYMENTS' },
  content: { prismaModel: 'contentCollection', recycleKey: 'CONTENT' },
  assets: { prismaModel: 'asset', recycleKey: 'ASSETS' },
  approvals: { prismaModel: 'designApproval', recycleKey: 'APPROVALS' },
  timelines: { prismaModel: 'projectTimeline', recycleKey: 'TIMELINES' },
  handovers: { prismaModel: 'handover', recycleKey: 'HANDOVERS' },
  feedbacks: { prismaModel: 'feedback', recycleKey: 'FEEDBACKS' },
  notifications: { prismaModel: 'notification', recycleKey: 'NOTIFICATIONS' },
  discoveryQuestionnaires: { prismaModel: 'discoveryForm', recycleKey: 'DISCOVERYQUESTIONNAIRES' },
  aiConversations: { prismaModel: 'aIConversation', recycleKey: 'AI_CONVERSATIONS' },
}

function getTitleField(item: any): string {
  return item.title || item.name || item.companyName || item.projectName ||
    item.invoiceNumber || item.proposalNumber || item.agreementNumber ||
    item.clientName || 'Item'
}

export async function softDelete(
  collection: string,
  itemId: string,
  title?: string,
  subtitle?: string
): Promise<any> {
  const mapping = MODEL_MAP[collection]

  if (!mapping) {
    await prisma.dataStore.delete({ where: { id: itemId } }).catch(() => {})
    return { success: true }
  }

  const model = (prisma as any)[mapping.prismaModel]
  if (!model) return { success: true }

  const item = await model.findUnique({ where: { id: itemId } })
  if (!item) return { success: true }

  await model.update({
    where: { id: itemId },
    data: { deletedAt: new Date() },
  })

  const recycleItem = await prisma.recycleBin.create({
    data: {
      originalCollection: mapping.recycleKey as any,
      itemData: item,
      title: title || getTitleField(item),
      subtitle: subtitle || '',
      deletedAt: new Date(),
    },
  })

  return { success: true, recycleItem }
}
