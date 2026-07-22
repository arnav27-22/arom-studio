import jsPDF from 'jspdf'
import { trackPDFDownload } from './tracker'

const BRAND = {
  name: 'AROM Studio',
  nameUpper: 'AROM STUDIO',
  email: 'aromstudio27@gmail.com',
  phone: '+91 8767990061',
  url: 'https://arom-studio.vercel.app',
  primary: { r: 78, g: 133, b: 191 },
  dark: { r: 30, g: 30, b: 35 },
  mid: { r: 60, g: 60, b: 70 },
  light: { r: 120, g: 120, b: 130 },
  muted: { r: 200, g: 200, b: 210 },
  bgLight: { r: 245, g: 247, b: 250 },
  accent2: { r: 37, g: 211, b: 102 },
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`
}

export interface TableRow {
  cells: string[]
  isHeader?: boolean
}

export function createDoc(): jsPDF {
  return new jsPDF('p', 'mm', 'a4')
}

export function addCoverPage(
  doc: jsPDF,
  opts: {
    title: string
    subtitle?: string
    clientName?: string
    clientEmail?: string
    clientPhone?: string
    date?: string
    reference?: string
  }
) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()

  // Full background
  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pw, ph, 'F')

  // Top accent bar
  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(0, 0, pw, 6, 'F')

  // Decorative side element
  doc.setFillColor(235, 240, 248)
  for (let i = 0; i < 20; i++) {
    doc.rect(pw - 50, 60 + i * 28, 80, 12, 'F')
  }

  // Brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text(BRAND.name, pw / 2, 70, { align: 'center' })

  // Tagline
  doc.setFontSize(9)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.setFont('helvetica', 'normal')
  doc.text('Web Design & Development Agency', pw / 2, 78, { align: 'center' })

  // Divider
  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.7)
  doc.line(pw / 2 - 30, 86, pw / 2 + 30, 86)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text(opts.title, pw / 2, 110, { align: 'center' })

  if (opts.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text(opts.subtitle, pw / 2, 120, { align: 'center' })
  }

  // Info box
  const hasEmail = !!opts.clientEmail
  const hasPhone = !!opts.clientPhone
  const contactRows = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0)
  let rowCount = 2 // agency + date always
  if (opts.clientName) rowCount++
  rowCount += contactRows
  const boxHeight = rowCount * 12 + 4

  const boxY = 140
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.roundedRect(pw / 2 - 65, boxY, 130, boxHeight, 4, 4, 'FD')

  let infoY = boxY + 8

  // Agency
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text('AGENCY', pw / 2 - 55, infoY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.setFontSize(10)
  doc.text(BRAND.name, pw / 2 + 10, infoY)
  infoY += 12

  // Client
  if (opts.clientName) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text('CLIENT', pw / 2 - 55, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
    doc.text(opts.clientName, pw / 2 + 10, infoY)
    infoY += 12
  }

  // Contact — email above, phone below
  if (hasEmail || hasPhone) {
    const labelX = pw / 2 - 55
    const valX = pw / 2 + 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text('CONTACT', labelX, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
    if (hasEmail) {
      doc.text(opts.clientEmail || '', valX, infoY)
      infoY += 12
    }
    if (hasPhone) {
      doc.text(opts.clientPhone || '', valX, infoY)
      infoY += 12
    }
  }

  // Date
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text('DATE', pw / 2 - 55, infoY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text(opts.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pw / 2 + 10, infoY)

  // Bottom bar
  doc.setFillColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.rect(0, ph - 30, pw, 30, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(180)
  doc.text(`${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.phone}  |  ${BRAND.url}`, pw / 2, ph - 15, { align: 'center' })

  doc.addPage()
}

export interface PageStyles {
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
  contentWidth: number
}

export function getPageLayout(doc: jsPDF): PageStyles {
  const pw = doc.internal.pageSize.getWidth()
  return {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 25,
    marginBottom: 20,
    contentWidth: pw - 40,
  }
}

export function addHeader(doc: jsPDF, documentTitle: string) {
  const pw = doc.internal.pageSize.getWidth()
  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(0, 0, pw, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text(BRAND.nameUpper, 15, 8)
  doc.setFont('helvetica', 'normal')
  doc.text(documentTitle, pw / 2, 8, { align: 'center' })
  doc.setFontSize(6)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), pw - 15, 8, { align: 'right' })
}

export function addFooter(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.3)
  doc.line(15, ph - 16, pw - 15, ph - 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text(`${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.url}`, 15, ph - 9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Page ${doc.getNumberOfPages()}`, pw - 15, ph - 9, { align: 'right' })
}

export function checkPage(doc: jsPDF, y: number, needed: number = 20): number {
  const ph = doc.internal.pageSize.getHeight()
  if (y + needed > ph - 22) {
    doc.addPage()
    addHeader(doc, '')
    return 25
  }
  return y
}

export function writeSection(
  doc: jsPDF,
  y: number,
  title: string,
  bodyLines: string[],
  layout: PageStyles,
  checkboxes?: boolean
): number {
  y = checkPage(doc, y, 20)

  // Section title with left accent bar
  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(layout.marginLeft, y - 3, 2, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text(title, layout.marginLeft + 6, y + 3)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)

  const lineH = checkboxes ? 9 : 6

  for (const line of bodyLines) {
    if (line.startsWith('  -') || line.startsWith('  •')) {
      const text = line.trim().replace(/^[-•]\s*/, '').replace(/\*\*/g, '')
      const split = doc.splitTextToSize(text, layout.contentWidth - 25)
      const totalNeeded = split.length * lineH + 4
      y = checkPage(doc, y, totalNeeded)
      if (checkboxes) {
        const bx = layout.marginLeft + 5
        const by = y - 1
        doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
        doc.setLineWidth(0.4)
        doc.rect(bx, by, 3.5, 3.5, 'S')
        doc.setLineWidth(0.5)
        doc.line(bx + 0.8, by + 2.2, bx + 1.5, by + 2.8)
        doc.line(bx + 1.5, by + 2.8, bx + 2.8, by + 0.5)
        doc.setFontSize(9)
        doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
        for (const s of split) {
          doc.text(s, layout.marginLeft + 12, y)
          y += lineH
        }
        y += 2
      } else {
        doc.setFontSize(5)
        doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
        doc.text('●', layout.marginLeft + 5, y + 1)
        doc.setFontSize(9)
        doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
        for (const s of split) {
          doc.text(s, layout.marginLeft + 10, y)
          y += lineH
        }
      }
    } else if (line.startsWith('___')) {
      // Divider
      y = checkPage(doc, y, 6)
      doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
      doc.setLineWidth(0.2)
      doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
      y += 4
    } else if (line === '') {
      y += 4
    } else {
      const clean = line.replace(/\*\*/g, '')
      const split = doc.splitTextToSize(clean, layout.contentWidth)
      const totalNeeded = split.length * lineH + 4
      y = checkPage(doc, y, totalNeeded)
      for (const s of split) {
        doc.text(s, layout.marginLeft, y)
        y += lineH
      }
    }
  }
  y += 6
  return y
}

export function writeTable(
  doc: jsPDF,
  y: number,
  headers: string[],
  rows: TableRow[],
  layout: PageStyles
): number {
  const colCount = headers.length
  const colWidth = layout.contentWidth / colCount
  const rowHeight = 8

  // Header row
  y = checkPage(doc, y, rowHeight + 6)
  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(layout.marginLeft, y, layout.contentWidth, rowHeight, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  headers.forEach((h, i) => {
    doc.text(h, layout.marginLeft + colWidth * i + 3, y + 5.5)
  })
  y += rowHeight

  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  rows.forEach((row, ri) => {
    y = checkPage(doc, y, rowHeight)
    if (ri % 2 === 1) {
      doc.setFillColor(BRAND.bgLight.r, BRAND.bgLight.g, BRAND.bgLight.b)
      doc.rect(layout.marginLeft, y, layout.contentWidth, rowHeight, 'F')
    }
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
    if (row.isHeader) {
      doc.setFont('helvetica', 'bold')
    }
    row.cells.forEach((cell, ci) => {
      doc.text(cell, layout.marginLeft + colWidth * ci + 3, y + 5.5)
    })
    if (row.isHeader) {
      doc.setFont('helvetica', 'normal')
    }
    y += rowHeight
  })

  // Bottom border
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.2)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 6
  return y
}

export function writeSignatureBlock(
  doc: jsPDF,
  y: number,
  layout: PageStyles,
  clientName: string,
  date: string
): number {
  y = checkPage(doc, y, 50)

  // Divider
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text('Accepted and agreed by:', layout.marginLeft, y)
  y += 8

  // Two columns
  const halfWidth = layout.contentWidth / 2 - 5

  // Client
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('CLIENT', layout.marginLeft, y)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y + 3, layout.marginLeft + halfWidth, y + 3)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text(clientName || '_________________________', layout.marginLeft, y + 2)
  y += 7

  // AROM Studio
  const rightX = layout.marginLeft + halfWidth + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('AROM STUDIO', rightX, y - 13)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(rightX, y - 10, rightX + halfWidth, y - 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text('Arnav (Founder)', rightX, y - 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text(`Date: ${date}`, rightX, y)

  y += 14
  return y
}

export function writeContactFooter(doc: jsPDF, y: number, layout: PageStyles): number {
  y = checkPage(doc, y, 30)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('Contact Information', layout.marginLeft, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text(`${BRAND.nameUpper}  |  Website: ${BRAND.url}  |  Email: ${BRAND.email}  |  Phone: ${BRAND.phone}`, layout.marginLeft, y)
  y += 8
  return y
}

export function finalizeDoc(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    if (i === 1) continue
    const contentNum = i - 1
    const totalContent = pageCount - 1
    doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
    doc.setLineWidth(0.3)
    doc.line(15, ph - 16, pw - 15, ph - 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
    doc.text(`${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.url}`, 15, ph - 9)
    doc.text(`Page ${contentNum} of ${totalContent}`, pw - 15, ph - 9, { align: 'right' })
  }
}

export function generateProposalPDF(data: {
  clientName: string
  projectName: string
  preparedBy: string
  date: string
  executiveSummary: string
  objectives: string[]
  scope: string[]
  deliverables: string[]
  milestones: { phase: string; description: string; timeline: string }[]
  pricingItems: { service: string; description: string; amount: string }[]
  totalAmount: string
  paymentSchedule: string[]
  assumptions: string[]
  exclusions: string[]
  technologies: string[]
  supportDescription: string
}) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  // Cover page
  addCoverPage(doc, {
    title: 'Project Proposal',
    subtitle: data.projectName,
    clientName: data.clientName,
    date: data.date,
    reference: `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  })

  let y = layout.marginTop

  // Page header
  addHeader(doc, 'Project Proposal')

  // 1. Executive Summary
  y = writeSection(doc, y, 'Executive Summary', [
    data.executiveSummary,
  ], layout)

  // 2. Project Objectives
  y = writeSection(doc, y, 'Project Objectives', data.objectives.map((o) => `  • ${o}`), layout)

  // 3. Scope of Work
  y = writeSection(doc, y, 'Scope of Work', data.scope.map((s) => `  • ${s}`), layout)

  // 4. Deliverables
  y = writeSection(doc, y, 'Deliverables', data.deliverables.map((d) => `  • ${d}`), layout)

  // 5. Timeline with Milestones
  const timelineLines: string[] = []
  data.milestones.forEach((m) => {
    timelineLines.push(`**${m.phase}**`)
    timelineLines.push(`${m.description} — ${m.timeline}`)
    timelineLines.push('')
  })
  y = writeSection(doc, y, 'Timeline & Milestones', timelineLines, layout)

  // 6. Pricing Table
  const headers = ['Service', 'Description', 'Amount']
  const rows: TableRow[] = data.pricingItems.map((item) => ({
    cells: [item.service, item.description, item.amount],
  }))
  rows.push({
    cells: ['', 'Total Investment', data.totalAmount],
    isHeader: true,
  })
  y = writeSection(doc, y, 'Pricing', [], layout)
  y = writeTable(doc, y, headers, rows, layout)

  // 7. Payment Schedule
  y = writeSection(doc, y, 'Payment Schedule', data.paymentSchedule.map((p) => `  • ${p}`), layout)

  // 8. Assumptions
  y = writeSection(doc, y, 'Assumptions', data.assumptions.map((a) => `  • ${a}`), layout)

  // 9. Exclusions
  y = writeSection(doc, y, 'Exclusions', data.exclusions.map((e) => `  • ${e}`), layout)

  // 10. Technologies
  y = writeSection(doc, y, 'Technologies', [`Technologies & platforms to be used: ${data.technologies.join(', ')}.`], layout)

  // 11. Support
  y = writeSection(doc, y, 'Support', [data.supportDescription], layout)

  // 12. Acceptance & Signature
  y = writeSection(doc, y, 'Acceptance', [
    'This proposal is valid for 14 days from the date of issue.',
    'To accept this proposal, please sign below and return it to AROM Studio.',
    'Upon acceptance and receipt of the advance payment, the project will commence as per the timeline outlined above.',
    '',
    'Payment terms and conditions are subject to the Website Development Agreement which will be provided upon acceptance.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))

  y = writeContactFooter(doc, y, layout)

  // Finalize
  finalizeDoc(doc)

  // Add header titles to all content pages
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Project Proposal')
  }

  const proposalFile = `Proposal_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('proposal', proposalFile)
  doc.save(proposalFile)
}

export function generateAgreementPDF(data: {
  clientName: string
  clientAddress: string
  clientEmail: string
  clientPhone: string
  effectiveDate: string
  projectDescription: string
  selectedServices: string[]
  timeline: string
  advancePercentage: string
  finalPercentage: string
  supportPeriod: string
}) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Website Development Agreement',
    subtitle: 'Professional Web Development Services',
    clientName: data.clientName || '[Client Name]',
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    date: data.effectiveDate ? fmtDate(data.effectiveDate) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    reference: `AGR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  })

  let y = layout.marginTop
  addHeader(doc, 'Website Development Agreement')

  const allServices = [
    'Website Design', 'Website Development', 'Responsive Design',
    'Landing Pages', 'E-commerce Development', 'Custom Features',
    'CMS Integration', 'SEO Optimization', 'Website Deployment',
  ]
  const services = data.selectedServices.length > 0 ? data.selectedServices : allServices

  const effDate = data.effectiveDate ? fmtDate(data.effectiveDate) : '_______________'

  // Parties
  y = writeSection(doc, y, 'Parties', [
    'This Website Development Agreement ("Agreement") is entered into between:',
    '',
    `Agency: AROM Studio`,
    `Client: ${data.clientName || '[Client Name]'}`,
    ...(data.clientAddress ? [`Address: ${data.clientAddress}`] : []),
    ...(data.clientEmail ? [`Contact: ${data.clientEmail}`] : []),
    ...(data.clientPhone ? [`         ${data.clientPhone}`] : []),
    '',
    `This Agreement becomes effective from ${effDate}.`,
  ], layout, true)

  // 1. Project Overview
  y = writeSection(doc, y, '1. Project Overview', [
    'The Client has requested AROM Studio to design and/or develop a website.',
    `The specific project requirements, deliverables, pricing, and timeline will be defined in the approved Project Proposal.${data.projectDescription ? `\n\nProject Description: ${data.projectDescription}` : ''}`,
  ], layout, true)

  // 2. Scope of Work
  y = writeSection(doc, y, '2. Scope of Work', [
    'AROM Studio agrees to provide the services specified in the approved Project Proposal.',
    'Services may include:',
    ...services.map((s) => `  • ${s}`),
    '',
    'Any work outside the agreed scope shall be considered additional work and may require a separate quotation.',
  ], layout, true)

  // 3. Timeline
  y = writeSection(doc, y, '3. Project Timeline', [
    `The estimated project duration is ${data.timeline || '[Timeline]'}.`,
    'The timeline may change if:',
    '  • Client delays providing content or assets.',
    '  • Additional features are requested.',
    '  • Project requirements change.',
    '  • Third-party services cause delays.',
    'AROM Studio will communicate any timeline changes as early as possible.',
  ], layout, true)

  // 4. Payment Terms
  y = writeSection(doc, y, '4. Payment Terms', [
    `Payment schedule: ${data.advancePercentage || '27'}% Advance before project commencement, ${data.finalPercentage || '50'}% Final Payment before final website delivery or deployment.`,
    'Additional work requested after project approval will be charged separately.',
    'Payments are due within the agreed payment period.',
    'If payment is delayed by more than 7 days, AROM Studio may pause work until payment is received.',
  ], layout, true)

  // 5. Client Responsibilities
  y = writeSection(doc, y, '5. Client Responsibilities', [
    'The Client agrees to provide:',
    '  • Logo, Brand Colors, Images, Videos',
    '  • Website Content, Contact Information',
    '  • Social Media Links',
    '  • Domain Details (if applicable)',
    '  • Hosting Details (if applicable)',
    'The Client is responsible for ensuring that all supplied content is accurate and legally owned or licensed.',
  ], layout, true)

  // 6. Communication
  y = writeSection(doc, y, '6. Project Communication', [
    'The Client should provide timely feedback and approvals to avoid unnecessary delays.',
    'Preferred communication methods include: Email, WhatsApp, Google Meet, Zoom, Phone Call.',
    'If the Client does not respond within 10 business days, the project may be placed on hold until communication resumes.',
  ], layout, true)

  // 7. Revisions
  y = writeSection(doc, y, '7. Revisions', [
    'Revision limits are defined per project tier:',
    '  • Basic: 2 revision rounds',
    '  • Standard: 3 revision rounds',
    '  • Premium: Unlimited until design approval',
    'Requests outside the original scope or beyond the revision limit may require additional charges.',
    'Major redesigns after approval are treated as new work.',
  ], layout, true)

  // 8. Change Requests
  y = writeSection(doc, y, '8. Change Requests', [
    'If the Client requests additional pages, new features, major design changes, third-party integrations, or functional changes:',
    'AROM Studio will provide a revised quotation before starting the additional work.',
  ], layout, true)

  // 9-20. Remaining sections (compact)
  const remainingSections: [string, string[]][] = [
    ['9. Domain & Hosting', [
      'Unless specifically included in the proposal, domain registration and hosting purchase are the Client\'s responsibility.',
      'If AROM Studio assists with these services, any third-party costs will be billed separately.',
    ]],
    ['10. Content Ownership', [
      'The Client retains ownership of: Logos, Images, Videos, Written Content, Brand Assets.',
      'The Client confirms they have permission to use all provided materials.',
    ]],
    ['11. Intellectual Property', [
      'After full payment has been received, the Client owns the completed website and receives all agreed project files.',
      'AROM Studio retains ownership of its internal tools, reusable code libraries, templates, frameworks, and development methodologies unless otherwise agreed.',
    ]],
    ['12. Confidentiality', [
      'Both parties agree to keep confidential information private.',
      'Business information, passwords, source files, and sensitive project information shall not be shared with third parties without permission, unless required by law.',
    ]],
    ['13. Cancellation', [
      'Either party may cancel the project.',
      'If cancelled: Work completed up to the cancellation date must be paid for. Advance payments are generally non-refundable. Completed deliverables may be provided after outstanding payments are settled.',
    ]],
    ['14. Website Launch', [
      'The website will be deployed after final approval, final payment, and required domain/hosting access (if applicable).',
    ]],
    ['15. Support', [
      `After website delivery, the included support period is ${data.supportPeriod || '30'} days.`,
      'The warranty covers defects in delivered work.',
      'Support includes: Bug Fixes, Minor Technical Assistance.',
      'Support does not include: Client modifications, Third-party plugin updates, New Features, Major Design Changes, Additional Pages, Third-party software issues.',
    ]],
    ['16. Limitation of Liability', [
      'AROM Studio shall not be responsible for third-party hosting failures, domain provider issues, payment gateway outages, search engine ranking changes, client-added errors after handover, or cyberattacks beyond our control.',
    ]],
    ['17. Portfolio Rights', [
      'Unless the Client specifically requests confidentiality in writing, AROM Studio may showcase the completed project in its portfolio, website, and social media for promotional purposes.',
    ]],
    ['18. Force Majeure', [
      'Neither party shall be liable for delays caused by events beyond reasonable control, including natural disasters, government actions, internet outages, pandemics, or other unforeseen circumstances.',
    ]],
    ['19. Governing Law', [
      'This Agreement shall be governed by the applicable laws of India.',
      'Any disputes shall first be attempted to be resolved through mutual discussion before pursuing legal remedies.',
    ]],
    ['20. Digital Acceptance', [
      'By clicking "I Agree" in the AROM Studio Client Portal or by making the agreed advance payment after accepting the proposal, the Client acknowledges that they have read, understood, and accepted the terms of this Agreement.',
      'This constitutes a legally binding digital acceptance. No handwritten signature is required.',
    ]],
    ['21. Entire Agreement', [
      'This Agreement, together with the approved Project Proposal, constitutes the entire agreement between the parties.',
      'It supersedes any prior discussions, negotiations, or communications, whether written or oral.',
    ]],
    ['22. Browser Support', [
      'AROM Studio officially supports the latest two versions of the following browsers:',
      '  • Google Chrome',
      '  • Mozilla Firefox',
      '  • Apple Safari',
      '  • Microsoft Edge',
      'The website may not function as intended on older or unsupported browsers.',
    ]],
  ]

  for (const [title, lines] of remainingSections) {
    y = writeSection(doc, y, title, lines, layout, true)
  }

  // 23. Legal Policies
  y = writeSection(doc, y, '23. Legal Policies', [
    'The following legal policies apply to all services provided by AROM Studio.',
    '',
  ], layout, true)

  y = writeSection(doc, y, 'Privacy Policy', [
    '  • Information We Collect: We collect information you provide directly, such as your name, email address, phone number, and project details when you fill out our contact form or book a consultation.',
    '  • How We Use Your Information: We respond to inquiries, provide services, improve our website, and send relevant communications about your projects.',
    '  • Data Protection: We implement appropriate security measures to protect your personal information. We do not sell, trade, or transfer your information to third parties without your consent.',
    '  • Cookies: Our website may use cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings.',
    '  • Contact: If you have any questions about this Privacy Policy, please contact us at aromstudio27@gmail.com.',
    '',
  ], layout, true)

  y = writeSection(doc, y, 'Terms & Conditions', [
    '  • Acceptance of Terms: By accessing or using the AROM STUDIO website, you agree to be bound by these Terms and Conditions.',
    '  • Services: AROM STUDIO provides web design, development, and related digital services. The scope, timeline, and terms of each project will be outlined in a separate agreement.',
    '  • Intellectual Property: Upon full payment, clients retain ownership of the final delivered work.',
    '  • Payment Terms: Payment terms are outlined in the project proposal. Late payments may result in project delays.',
    '  • Limitation of Liability: AROM STUDIO shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.',
    '',
  ], layout, true)

  y = writeSection(doc, y, 'Refund Policy', [
    '  • Project Deposits: The initial advance payment is non-refundable as it covers the discovery, research, and design phase work already performed.',
    '  • Project Cancellation: If a project is cancelled after the design phase has begun, the advance payment is retained. Any work completed beyond the deposit will be billed at an hourly rate.',
    '  • Completed Projects: Once a project is completed and delivered, all payments are final. Refunds are not issued for completed work that meets the agreed-upon specifications.',
    '  • Maintenance & Support: Monthly maintenance fees are non-refundable but can be cancelled with 30 days notice.',
    '  • Dispute Resolution: In the event of a dispute, both parties will work in good faith to find a fair resolution.',
    '',
  ], layout, true)

  // Client Declaration
  y = writeSection(doc, y, 'Client Declaration', [
    `I, ${data.clientName || '[Client Name]'}, hereby declare that:`,
    `  • I have read, understood, and agree to all sections of this Website Development Agreement including the Entire Agreement clause, Browser Support, and Digital Acceptance.`,
    '  • I have read, understood, and agree to the Privacy Policy, Terms & Conditions, and Refund Policy as outlined in the Legal section.',
    `  • All information provided by me is accurate and complete.`,
    `  • I agree to the payment terms including the ${data.advancePercentage || '50'}% advance payment.`,
    '  • I agree to provide all required content and assets within agreed timelines.',
    '  • I acknowledge that this Agreement is legally binding once accepted.',
  ], layout, true)

  // Signature
  y = writeSignatureBlock(doc, y, layout, data.clientName, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Website Development Agreement')
  }

  const agreementFile = `Website_Development_Agreement_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('agreement', agreementFile)
  doc.save(agreementFile)
}

export function generateHandoverPDF(data: {
  clientName: string
  projectName: string
  websiteUrl: string
  adminUrl: string
  hostingProvider: string
  domainName: string
  sourceCode: string
  documentation: string
  warrantyPeriod: string
  supportPeriod: string
  maintenancePlan: string
}) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Website Handover Document',
    subtitle: data.projectName,
    clientName: data.clientName,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    reference: `HAN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  })

  let y = layout.marginTop
  addHeader(doc, 'Website Handover')

  y = writeSection(doc, y, 'Project Details', [
    `**Client:** ${data.clientName}`,
    `**Project:** ${data.projectName}`,
    `**Handover Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
  ], layout)

  const headers = ['Item', 'Details']
  const rows: TableRow[] = [
    { cells: ['Website URL', data.websiteUrl] },
    { cells: ['Admin Login', data.adminUrl] },
    { cells: ['Hosting Provider', data.hostingProvider] },
    { cells: ['Domain Name', data.domainName] },
    { cells: ['Source Code', data.sourceCode] },
    { cells: ['Documentation', data.documentation] },
  ]
  y = writeTable(doc, y, headers, rows, layout)

  y = writeSection(doc, y, 'Free Domain (Subdomain)', [
    'A free subdomain is provided for staging or production:',
    `  • ${data.websiteUrl}`,
    '  • https://yoursite.netlify.app (if using Netlify)',
    '',
    'You can also connect a custom domain (e.g., yoursite.com) at any time.',
  ], layout)

  y = writeSection(doc, y, 'Support & Warranty', [
    `Warranty Period: ${data.warrantyPeriod}`,
    `Support Period: ${data.supportPeriod}`,
    `Maintenance Plan: ${data.maintenancePlan}`,
    '',
    'For any support requests, please contact AROM Studio via email or WhatsApp.',
    'Response time is typically within 24 hours on business days.',
  ], layout)

  y = writeSection(doc, y, 'Post-Handover Checklist', [
    '  • Verify website functionality on all devices',
    '  • Test contact forms and interactive elements',
    '  • Review SEO settings and analytics',
    '  • Confirm SSL certificate is active',
    '  • Test page loading speed',
    '  • Verify backup system is operational',
    '  • Update admin passwords',
    '  • Review analytics and tracking setup',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Website Handover')
  }

  const handoverFile = `Handover_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('handover', handoverFile)
  doc.save(handoverFile)
}

export function generateDesignApprovalPDF(items: { page: string; status: string; notes?: string }[]) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  const approved = items.filter((d) => d.status === 'approved').length
  const total = items.length

  addCoverPage(doc, {
    title: 'Design Approval Report',
    subtitle: `${approved} of ${total} designs approved`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    reference: `DES-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  })

  let y = layout.marginTop
  addHeader(doc, 'Design Approval Report')

  const headers = ['Page', 'Status', 'Notes']
  const rows: TableRow[] = items.map((item) => ({
    cells: [
      item.page,
      item.status === 'approved' ? 'APPROVED' : item.status === 'changes' ? 'CHANGES REQUESTED' : 'PENDING',
      item.notes || '—',
    ],
  }))
  y = writeTable(doc, y, headers, rows, layout)

  y = writeSection(doc, y, 'Summary', [
    `Total Designs: ${total}`,
    `Approved: ${approved}`,
    `Changes Requested: ${items.filter((d) => d.status === 'changes').length}`,
    `Pending: ${items.filter((d) => d.status === 'pending').length}`,
    `Overall Progress: ${Math.round((approved / total) * 100)}%`,
    '',
    'Once all designs are approved, development will proceed as per the project timeline.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, 'Client', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Design Approval Report')
  }

  const designFile = `Design_Approval_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('design-approval', designFile)
  doc.save(designFile)
}

export function generateRevisionsPDF(revisions: { page: string; priority: string; description: string; status: string }[]) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Revision Requests',
    subtitle: `${revisions.length} revision(s) documented`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  })

  let y = layout.marginTop
  addHeader(doc, 'Revision Requests')

  if (revisions.length === 0) {
    y = writeSection(doc, y, 'Revisions', ['No revision requests have been submitted yet.'], layout)
    finalizeDoc(doc)
    doc.setPage(2)
    addHeader(doc, 'Revision Requests')
    const revEmptyFile = `Revisions_${new Date().toISOString().split('T')[0]}.pdf`
    trackPDFDownload('revisions', revEmptyFile)
    doc.save(revEmptyFile)
    return
  }

  const headers = ['Page', 'Priority', 'Status', 'Description']
  const rows: TableRow[] = revisions.map((r) => ({
    cells: [r.page, r.priority.toUpperCase(), r.status.toUpperCase(), r.description],
  }))
  y = writeTable(doc, y, headers, rows, layout)

  y = writeSection(doc, y, 'Notes', [
    'Revision priority levels: LOW (cosmetic), MEDIUM (moderate changes), HIGH (critical).',
    'Standard revision cycles: up to 3 rounds of minor revisions included.',
    'Major redesigns or out-of-scope requests will be quoted separately.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, 'Client', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Revision Requests')
  }

  const revFile2 = `Revisions_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('revisions', revFile2)
  doc.save(revFile2)
}

export function generateAssetsPDF(data: {
  clientName: string
  projectName: string
  folderLink: string
  categories: string[]
}) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Assets Upload Summary',
    subtitle: data.projectName,
    clientName: data.clientName,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  })

  let y = layout.marginTop
  addHeader(doc, 'Assets Upload Summary')

  y = writeSection(doc, y, 'Project Information', [
    `**Client:** ${data.clientName}`,
    `**Project:** ${data.projectName}`,
    `**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `**Drive Folder:** ${data.folderLink}`,
  ], layout)

  y = writeSection(doc, y, 'Assets Checklist', [
    'Please ensure the following assets are uploaded:',
    ...data.categories.map((c) => `  • ${c}`),
    '',
    'Assets should be organised in clearly named subfolders.',
    'Accepted formats: Images (PNG, JPG, SVG, WebP), Videos (MP4, MOV), Documents (PDF, DOCX), Fonts (TTF, OTF, WOFF).',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Assets Upload Summary')
  }

  const assetsFile = `Assets_Summary_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('assets', assetsFile)
  doc.save(assetsFile)
}

export function generateContentCollectionPDF(data: {
  clientName: string
  projectName: string
  homePage: string
  aboutUs: string
  services: string
  faqs: string
  contactDetails: string
  socialMedia: string
  seoTitleDesc: string
}) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Content Collection',
    subtitle: data.projectName,
    clientName: data.clientName,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  })

  let y = layout.marginTop
  addHeader(doc, 'Content Collection')

  const contentSections: [string, string][] = [
    ['Home Page', data.homePage],
    ['About Us', data.aboutUs],
    ['Services', data.services],
    ['FAQs', data.faqs],
    ['Contact Details', data.contactDetails],
    ['Social Media Links', data.socialMedia],
    ['SEO Title & Description', data.seoTitleDesc],
  ]

  for (const [title, content] of contentSections) {
    if (!content.trim()) continue
    y = writeSection(doc, y, title, [
      content,
    ], layout)
  }

  y = writeSection(doc, y, 'Next Steps', [
    'Please review the content above and ensure everything is accurate.',
    'Once confirmed, AROM Studio will proceed with integrating this content into the website.',
    'For any changes or updates, please contact AROM Studio via email or WhatsApp.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, 'Content Collection')
  }

  const contentFile = `Content_Collection_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  trackPDFDownload('content-collection', contentFile)
  doc.save(contentFile)
}
