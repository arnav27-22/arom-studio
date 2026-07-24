import {
  generateHandoverPDF,
  generateDesignApprovalPDF,
  generateRevisionsPDF,
  generateAssetsPDF,
  exportSectionReportPDF,
} from './professionalPDF'

interface PDFSection {
  title: string
  content: string[]
}

interface PDFOptions {
  filename: string
  title: string
  sections: PDFSection[]
}

export function generatePDF({ filename, title, sections }: PDFOptions) {
  if (title.includes('Handover')) {
    generateHandoverPDF({
      clientName: 'Client',
      projectName: 'Website Project',
      websiteUrl: sections.find((s) => s.title === 'Project Details')?.content.find((c) => c.startsWith('Website URL:'))?.replace('Website URL: ', '') || 'https://yoursite.com',
      adminUrl: sections.find((s) => s.title === 'Project Details')?.content.find((c) => c.startsWith('Admin Login:'))?.replace('Admin Login: ', '') || 'https://yoursite.com/admin',
      hostingProvider: sections.find((s) => s.title === 'Project Details')?.content.find((c) => c.startsWith('Hosting Provider:'))?.replace('Hosting Provider: ', '') || 'Vercel + Cloudflare',
      domainName: sections.find((s) => s.title === 'Project Details')?.content.find((c) => c.startsWith('Domain Name:'))?.replace('Domain Name: ', '') || 'yoursite.com',
      sourceCode: sections.find((s) => s.title === 'Project Details')?.content.find((c) => c.startsWith('Source Code:'))?.replace('Source Code: ', '') || 'GitHub Repository',
      documentation: sections.find((s) => s.title === 'Project Details')?.content.find((c) => c.startsWith('Documentation:'))?.replace('Documentation: ', '') || 'Documentation',
      warrantyPeriod: sections.find((s) => s.title === 'Support & Warranty')?.content.find((c) => c.startsWith('Warranty:'))?.replace('Warranty: ', '') || '30 Days',
      supportPeriod: sections.find((s) => s.title === 'Support & Warranty')?.content.find((c) => c.startsWith('Support Period:'))?.replace('Support Period: ', '') || '1 Year',
      maintenancePlan: sections.find((s) => s.title === 'Support & Warranty')?.content.find((c) => c.startsWith('Maintenance Plan:'))?.replace('Maintenance Plan: ', '') || 'Optional',
    })
    return
  }
  if (title.includes('Design')) {
    const items = sections[0]?.content.map((line) => {
      const [page, rest] = line.split(': ')
      const status = rest?.includes('APPROVED') ? 'approved' : rest?.includes('CHANGES') ? 'changes' : 'pending'
      const notes = rest?.includes('—') ? rest.split('—')[1]?.trim() : undefined
      return { page, status, notes }
    }) || []
    generateDesignApprovalPDF(items)
    return
  }
  if (title.includes('Revision')) {
    const revisions = sections
      .filter((s) => s.title !== 'No Revisions')
      .map((s) => {
        const parts = s.title.split(' — ')
        return {
          page: parts[0] || '',
          priority: (parts[1] || 'MEDIUM').toLowerCase(),
          description: s.content[0] || '',
          status: (parts[2] || 'PENDING').toLowerCase(),
        }
      })
    generateRevisionsPDF(revisions)
    return
  }
  if (title.includes('Assets')) {
    generateAssetsPDF({
      clientName: 'Client',
      projectName: 'Project',
      folderLink: sections[0]?.content.find((c) => c.startsWith('Folder Link:'))?.replace('Folder Link: ', '') || '',
      categories: ['Logo', 'Images', 'Videos', 'Brand Guidelines', 'Fonts', 'PDF Files', 'Documents', 'Social Media Assets', 'Other Resources'],
    })
    return
  }

  // Fallback: Real branded PDF report
  const headers = ['Section Title', 'Content Details']
  const rows = sections.map((s) => [s.title, s.content.join('\n')])
  const prefix = filename.replace(/\.pdf$/i, '')
  exportSectionReportPDF(title, 'AROM Studio Official Client Document', headers, rows, prefix)
}
