import { prisma } from '../database/prisma'

interface SearchResult {
  module: string
  id: string
  title: string
  subtitle?: string
  url?: string
  createdAt: string
}

export class SearchService {
  async globalSearch(query: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    const term = query.toLowerCase()

    const searches = await Promise.allSettled([
      this.searchVisitors(term, limit),
      this.searchLeads(term, limit),
      this.searchProjects(term, limit),
      this.searchPDFs(term, limit),
      this.searchConversations(term, limit),
      this.searchInvoices(term, limit),
      this.searchClients(term, limit),
      this.searchLogs(term, limit),
      this.searchRecycleBin(term, limit),
    ])

    searches.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(...result.value)
      }
    })

    return results.sort((a, b) => a.title.localeCompare(b.title)).slice(0, limit)
  }

  private async searchVisitors(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.visitor.findMany({
      where: {
        deletedAt: null,
        OR: [
          { page: { contains: term, mode: 'insensitive' } },
          { country: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
          { browser: { contains: term, mode: 'insensitive' } },
          { ip: { contains: term } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(v => ({
      module: 'visitors',
      id: v.id,
      title: `${v.page} - ${v.country || 'Unknown'}`,
      subtitle: `${v.browser} | ${v.city || ''}`.trim(),
      createdAt: v.createdAt.toISOString(),
    }))
  }

  private async searchLeads(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.lead.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { company: { contains: term, mode: 'insensitive' } },
          { service: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(l => ({
      module: 'leads',
      id: l.id,
      title: l.name,
      subtitle: `${l.email} | ${l.service || 'General'}`,
      createdAt: l.createdAt.toISOString(),
    }))
  }

  private async searchProjects(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { clientName: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(p => ({
      module: 'projects',
      id: p.id,
      title: p.title,
      subtitle: p.clientName,
      createdAt: p.createdAt.toISOString(),
    }))
  }

  private async searchPDFs(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.generatedPDF.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { clientName: { contains: term, mode: 'insensitive' } },
          { pdfType: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(p => ({
      module: 'pdfs',
      id: p.id,
      title: p.title,
      subtitle: `${p.clientName} | ${p.pdfType}`,
      createdAt: p.createdAt.toISOString(),
    }))
  }

  private async searchConversations(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.aIConversation.findMany({
      where: {
        deletedAt: null,
        title: { contains: term, mode: 'insensitive' },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(c => ({
      module: 'ai_conversations',
      id: c.id,
      title: c.title,
      subtitle: `${c.device} | ${c.browser}`,
      createdAt: c.createdAt.toISOString(),
    }))
  }

  private async searchInvoices(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.invoice.findMany({
      where: {
        deletedAt: null,
        OR: [
          { invoiceNumber: { contains: term, mode: 'insensitive' } },
          { clientName: { contains: term, mode: 'insensitive' } },
          { clientEmail: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(i => ({
      module: 'invoices',
      id: i.id,
      title: i.invoiceNumber,
      subtitle: `${i.clientName} | ${i.currency}${i.totalAmount}`,
      createdAt: i.createdAt.toISOString(),
    }))
  }

  private async searchClients(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.client.findMany({
      where: {
        deletedAt: null,
        OR: [
          { companyName: { contains: term, mode: 'insensitive' } },
          { contactPerson: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(c => ({
      module: 'clients',
      id: c.id,
      title: c.companyName,
      subtitle: c.contactPerson,
      createdAt: c.createdAt.toISOString(),
    }))
  }

  private async searchLogs(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: term, mode: 'insensitive' } },
          { module: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return items.map(l => ({
      module: 'logs',
      id: l.id,
      title: `${l.action} on ${l.module}`,
      subtitle: l.ipAddress || '',
      createdAt: l.createdAt.toISOString(),
    }))
  }

  private async searchRecycleBin(term: string, limit: number): Promise<SearchResult[]> {
    const items = await prisma.recycleBin.findMany({
      where: {
        title: { contains: term, mode: 'insensitive' },
      },
      take: limit,
      orderBy: { deletedAt: 'desc' },
    })
    return items.map(r => ({
      module: 'recycle_bin',
      id: r.id,
      title: r.title,
      subtitle: r.originalCollection,
      createdAt: r.deletedAt.toISOString(),
    }))
  }
}

export const searchService = new SearchService()
