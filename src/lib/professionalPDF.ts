import jsPDF from 'jspdf'
import { trackPDFDownload, uploadPDF } from './tracker'
import { buildAgreementPDF, type AgreementData } from './agreementPDF'
export interface InvoiceItemData {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface AdminInvoiceData {
  id: string
  invoiceNumber: string
  createdAt: string
  dueDate: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientCompany?: string
  currency: 'INR' | 'USD'
  items: InvoiceItemData[]
  taxRate: number
  discountRate: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  notes?: string
}

export interface QData {
  fullName: string
  company: string
  designation: string
  email: string
  phone: string
  website: string
  businessDesc: string
  services: string
  yearsBusiness: string
  differentiator: string
  whyWebsite: string[]
  goals: string
  ageGroups: string[]
  targetLocation: string[]
  competitors: string
  likeCompetitors: string
  dislikeCompetitors: string
  inspiration1: string
  reason1: string
  inspiration2: string
  reason2: string
  inspiration3: string
  reason3: string
  branding: Record<string, boolean>
  pages: string[]
  features: string[]
  contentProvider: string
  contentItems: string[]
  ownDomain: string
  domainName: string
  ownHosting: string
  hostingProvider: string
  requireSEO: string
  targetKeywords: string
  targetCities: string
  startDate: string
  launchDate: string
  urgency: string
  budget: string
  communication: string[]
  meetingTime: string
  additionalNotes: string
}

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

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`
}

const MARGIN_LEFT = 18
const MARGIN_RIGHT = 18
const MARGIN_TOP = 22
const MARGIN_BOTTOM = 20
const HEADER_HEIGHT = 14
const FOOTER_HEIGHT = 14
export interface TableRow {
  cells: string[]
  isHeader?: boolean
}

export interface PageLayout {
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
  headerHeight: number
  footerHeight: number
  contentWidth: number
  contentTop: number
  contentBottom: number
  contentHeight: number
  pageWidth: number
  pageHeight: number
}

export function createDoc(): jsPDF {
  return new jsPDF('p', 'mm', 'a4')
}

export function getPageLayout(doc: jsPDF): PageLayout {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  return {
    marginLeft: MARGIN_LEFT,
    marginRight: MARGIN_RIGHT,
    marginTop: MARGIN_TOP,
    marginBottom: MARGIN_BOTTOM,
    headerHeight: HEADER_HEIGHT,
    footerHeight: FOOTER_HEIGHT,
    contentWidth: pw - MARGIN_LEFT - MARGIN_RIGHT,
    contentTop: MARGIN_TOP + 2,
    contentBottom: ph - MARGIN_BOTTOM - FOOTER_HEIGHT - 2,
    contentHeight: ph - MARGIN_TOP - MARGIN_BOTTOM - HEADER_HEIGHT - FOOTER_HEIGHT,
    pageWidth: pw,
    pageHeight: ph,
  }
}

function fmtDateTime(): string {
  const now = new Date()
  return now.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function checkPageBreak(
  doc: jsPDF,
  layout: PageLayout,
  y: number,
  needed: number,
  headerTitle?: string
): number {
  const maxY = layout.contentBottom
  if (y + needed > maxY) {
    doc.addPage()
    if (headerTitle) addHeader(doc, headerTitle)
    return layout.contentTop
  }
  return y
}

export function addHeader(doc: jsPDF, documentTitle: string) {
  const pw = doc.internal.pageSize.getWidth()

  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(0, 0, pw, HEADER_HEIGHT, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  doc.text(BRAND.nameUpper, 15, 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const titleLines = doc.splitTextToSize(documentTitle, pw * 0.45)
  const titleX = pw / 2
  for (let i = 0; i < titleLines.length; i++) {
    const tY = 7 + i * 4
    if (tY < HEADER_HEIGHT - 2) {
      doc.text(titleLines[i], titleX, tY, { align: 'center' })
    }
  }

  doc.setFontSize(6.5)
  doc.setTextColor(220, 230, 245)
  doc.text(fmtDateTime(), pw - 15, 9, { align: 'right' })
}

export function finalizeDoc(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const totalPages = doc.getNumberOfPages()

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    if (i === 1) continue

    const contentNum = i - 1
    const totalContent = totalPages - 1

    doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_LEFT, ph - FOOTER_HEIGHT + 2, pw - MARGIN_RIGHT, ph - FOOTER_HEIGHT + 2)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
    doc.text(`${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.url}`, MARGIN_LEFT, ph - 8)

    doc.setFont('helvetica', 'bold')
    doc.text(`Page ${contentNum} of ${totalContent}`, pw - MARGIN_RIGHT, ph - 8, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
    doc.text(`Generated ${fmtDateTime()}`, pw - MARGIN_RIGHT, ph - 4, { align: 'right' })
  }
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

  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pw, ph, 'F')

  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(0, 0, pw, 8, 'F')

  doc.setFillColor(235, 240, 248)
  for (let i = 0; i < 20; i++) {
    doc.rect(pw - 50, 60 + i * 28, 80, 12, 'F')
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text(BRAND.name, pw / 2, 72, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.setFont('helvetica', 'normal')
  doc.text('Web Design & Development Agency', pw / 2, 80, { align: 'center' })

  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.7)
  doc.line(pw / 2 - 30, 88, pw / 2 + 30, 88)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  const titleLines = doc.splitTextToSize(opts.title, pw - 60)
  let titleY = 112
  for (const tl of titleLines) {
    doc.text(tl, pw / 2, titleY, { align: 'center' })
    titleY += 10
  }

  if (opts.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    const subLines = doc.splitTextToSize(opts.subtitle, pw - 60)
    for (const sl of subLines) {
      doc.text(sl, pw / 2, titleY, { align: 'center' })
      titleY += 6
    }
  }

  const hasEmail = !!opts.clientEmail
  const hasPhone = !!opts.clientPhone
  const contactRows = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0)
  let rowCount = 3
  if (opts.clientName) rowCount++
  if (opts.reference) rowCount = Math.max(rowCount, 4)
  rowCount += contactRows
  const boxHeight = rowCount * 11 + 4

  const boxY = Math.max(titleY + 16, 140)
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.roundedRect(pw / 2 - 65, boxY, 130, boxHeight, 4, 4, 'FD')

  let infoY = boxY + 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text('AGENCY', pw / 2 - 55, infoY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text(BRAND.name, pw / 2 + 10, infoY)
  infoY += 11

  if (opts.clientName) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text('CLIENT', pw / 2 - 55, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
    const clientLines = doc.splitTextToSize(opts.clientName, 70)
    doc.text(clientLines[0], pw / 2 + 10, infoY)
    infoY += 11
  }

  if (hasEmail || hasPhone) {
    const labelX = pw / 2 - 55
    const valX = pw / 2 + 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text('CONTACT', labelX, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
    if (hasEmail) {
      doc.text(opts.clientEmail || '', valX, infoY)
      infoY += 11
    }
    if (hasPhone) {
      doc.text(opts.clientPhone || '', valX, infoY)
      infoY += 11
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text('DATE', pw / 2 - 55, infoY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text(
    opts.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pw / 2 + 10, infoY
  )
  infoY += 11

  if (opts.reference) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text('REFERENCE', pw / 2 - 55, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
    doc.text(opts.reference, pw / 2 + 10, infoY)
  }

  doc.setFillColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.rect(0, ph - 28, pw, 28, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(180)
  doc.text(
    `${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.phone}  |  ${BRAND.url}`,
    pw / 2, ph - 14, { align: 'center' }
  )

  doc.addPage()
}

export function writeSection(
  doc: jsPDF,
  y: number,
  title: string,
  bodyLines: string[],
  layout: PageLayout,
  checkboxes?: boolean,
  keepTogether?: boolean
): number {
  const maxY = layout.contentBottom
  const lineH = checkboxes ? 8.5 : 5.5
  const sectionTitleFontSize = 10.5
  const bodyFontSize = 8.5

  let estimatedTotal = 12
  if (keepTogether) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(bodyFontSize)
    for (const line of bodyLines) {
      if (line === '') { estimatedTotal += 3; continue }
      const isBullet = line.startsWith('  -') || line.startsWith('  •')
      const text = isBullet ? line.trim().replace(/^[-•]\s*/, '').replace(/\*\*/g, '') : line.replace(/\*\*/g, '')
      const w = isBullet ? layout.contentWidth - 12 : layout.contentWidth
      estimatedTotal += doc.splitTextToSize(text, w).length * lineH
    }
    estimatedTotal += 6
    if (estimatedTotal < maxY - layout.contentTop && y + estimatedTotal > maxY) {
      doc.addPage()
      return layout.contentTop
    }
  }

  y = checkPageBreak(doc, layout, y, 14)

  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(layout.marginLeft, y - 2.5, 2.5, 9, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(sectionTitleFontSize)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  const titleWrapped = doc.splitTextToSize(title, layout.contentWidth - 8)
  for (const tw of titleWrapped) {
    doc.text(tw, layout.marginLeft + 7, y + 3)
    y += 5.5
  }
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(bodyFontSize)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)

  for (const line of bodyLines) {
    if (line.startsWith('  -') || line.startsWith('  •')) {
      const text = line.trim().replace(/^[-•]\s*/, '').replace(/\*\*/g, '')
      const wrapWidth = checkboxes ? layout.contentWidth - 26 : layout.contentWidth - 12
      const split = doc.splitTextToSize(text, wrapWidth)
      const totalNeeded = split.length * lineH + 3
      y = checkPageBreak(doc, layout, y, Math.min(totalNeeded, lineH + 3))

      if (checkboxes) {
        const bx = layout.marginLeft + 5
        const by = y - 1
        doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
        doc.setLineWidth(0.4)
        doc.rect(bx, by, 3.2, 3.2, 'S')
        doc.setLineWidth(0.5)
        doc.line(bx + 0.7, by + 2, bx + 1.4, by + 2.6)
        doc.line(bx + 1.4, by + 2.6, bx + 2.7, by + 0.4)

        doc.setFontSize(bodyFontSize)
        doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
        for (const s of split) {
          y = checkPageBreak(doc, layout, y, lineH)
          doc.text(s, layout.marginLeft + 12, y)
          y += lineH
        }
        y += 2
      } else {
        doc.setFontSize(5)
        doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
        doc.text('●', layout.marginLeft + 5, y + 1)
        doc.setFontSize(bodyFontSize)
        doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
        for (const s of split) {
          y = checkPageBreak(doc, layout, y, lineH)
          doc.text(s, layout.marginLeft + 10, y)
          y += lineH
        }
      }
    } else if (line.startsWith('___')) {
      y = checkPageBreak(doc, layout, y, 6)
      doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
      doc.setLineWidth(0.2)
      doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
      y += 4
    } else if (line === '') {
      y += 3
    } else if (line.startsWith('**') && line.endsWith('**')) {
      const clean = line.replace(/\*\*/g, '')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(bodyFontSize)
      doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
      const split = doc.splitTextToSize(clean, layout.contentWidth)
      for (const s of split) {
        y = checkPageBreak(doc, layout, y, lineH)
        doc.text(s, layout.marginLeft, y)
        y += lineH
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(bodyFontSize)
      doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    } else {
      const clean = line.replace(/\*\*/g, '')
      const split = doc.splitTextToSize(clean, layout.contentWidth)
      for (const s of split) {
        y = checkPageBreak(doc, layout, y, lineH)
        doc.text(s, layout.marginLeft, y)
        y += lineH
      }
    }
  }
  y += 5
  return y
}

export function writeTable(
  doc: jsPDF,
  y: number,
  headers: string[],
  rows: TableRow[],
  layout: PageLayout
): number {
  const colCount = headers.length
  const cellPadding = 2.5
  const headerFontSize = 7.5
  const cellFontSize = 7.5
  const cellLineH = 4
  const headerRowH = 8

  if (colCount === 0) return y

  const tempDoc = new jsPDF('p', 'mm', 'a4')
  tempDoc.setFont('helvetica', 'normal')
  tempDoc.setFontSize(cellFontSize)

  const headerWidths = headers.map((h) => {
    const w = tempDoc.getTextWidth(h) + cellPadding * 2 + 4
    return Math.max(w, 18)
  })

  const dataWidths: number[] = new Array(colCount).fill(0)
  for (const row of rows) {
    for (let ci = 0; ci < Math.min(row.cells.length, colCount); ci++) {
      const text = String(row.cells[ci] || '')
      const lines = tempDoc.splitTextToSize(text, 80)
      let maxW = 0
      for (const line of lines) {
        const w = tempDoc.getTextWidth(line) + cellPadding * 2 + 4
        maxW = Math.max(maxW, w)
      }
      dataWidths[ci] = Math.max(dataWidths[ci], maxW)
    }
  }

  const colWidths: number[] = []
  for (let i = 0; i < colCount; i++) {
    colWidths[i] = Math.max(headerWidths[i], dataWidths[i])
  }

  const totalWidth = colWidths.reduce((s, w) => s + w, 0)
  if (totalWidth > layout.contentWidth) {
    const scale = layout.contentWidth / totalWidth
    for (let i = 0; i < colCount; i++) {
      colWidths[i] = Math.max(colWidths[i] * scale, 15)
    }
  } else if (totalWidth < layout.contentWidth) {
    const extra = (layout.contentWidth - totalWidth) / colCount
    for (let i = 0; i < colCount; i++) {
      colWidths[i] += extra
    }
  }

  const drawTableHeader = (startY: number): number => {
    doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
    doc.rect(layout.marginLeft, startY, layout.contentWidth, headerRowH, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(headerFontSize)
    doc.setTextColor(255, 255, 255)
    let xPos = layout.marginLeft
    headers.forEach((h, i) => {
      const maxW = colWidths[i] - cellPadding * 2
      const displayText = doc.splitTextToSize(h, Math.max(maxW, 5))[0] || h
      doc.text(displayText, xPos + cellPadding, startY + 5.5)
      xPos += colWidths[i]
    })
    return startY + headerRowH
  }

  y = checkPageBreak(doc, layout, y, headerRowH + 4)
  y = drawTableHeader(y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(cellFontSize)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri]
    let maxLines = 1
    const wrappedCells: string[][] = row.cells.map((cell, ci) => {
      const maxW = Math.max(colWidths[ci] - cellPadding * 2, 5)
      const lines = doc.splitTextToSize(String(cell || ''), maxW)
      maxLines = Math.max(maxLines, lines.length)
      return lines
    })
    const rowH = Math.max(headerRowH, maxLines * cellLineH + cellPadding * 2)

    const maxY = layout.contentBottom
    if (y + rowH > maxY) {
      doc.addPage()
      y = layout.contentTop
      y = drawTableHeader(y)
    }

    if (ri % 2 === 1) {
      doc.setFillColor(BRAND.bgLight.r, BRAND.bgLight.g, BRAND.bgLight.b)
      doc.rect(layout.marginLeft, y, layout.contentWidth, rowH, 'F')
    }

    if (row.isHeader) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    doc.setFontSize(cellFontSize)
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)

    let xPos = layout.marginLeft
    for (let ci = 0; ci < wrappedCells.length; ci++) {
      const lines = wrappedCells[ci]
      let lineY = y + cellPadding + 2
      for (const ln of lines) {
        doc.text(ln, xPos + cellPadding, lineY)
        lineY += cellLineH
      }
      xPos += colWidths[ci]
    }
    y += rowH

    doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
    doc.setLineWidth(0.15)
    doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  }

  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.25)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 5
  return y
}

export function writeSignatureBlock(
  doc: jsPDF,
  y: number,
  layout: PageLayout,
  clientName: string,
  date: string
): number {
  y = checkPageBreak(doc, layout, y, 55)

  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text('Accepted and agreed by:', layout.marginLeft, y)
  y += 8

  const halfWidth = layout.contentWidth / 2 - 5

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
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text(`Date: ${date}`, rightX, y)

  y += 14
  return y
}

export function writeContactFooter(doc: jsPDF, y: number, layout: PageLayout): number {
  y = checkPageBreak(doc, layout, y, 24)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('Contact Information', layout.marginLeft, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  const contactLine = `${BRAND.nameUpper}  |  Website: ${BRAND.url}  |  Email: ${BRAND.email}  |  Phone: ${BRAND.phone}`
  const contactWrapped = doc.splitTextToSize(contactLine, layout.contentWidth)
  for (const cl of contactWrapped) {
    doc.text(cl, layout.marginLeft, y)
    y += 4.5
  }
  y += 2
  return y
}

export function addImage(
  doc: jsPDF,
  imgData: string,
  format: 'JPEG' | 'PNG',
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
): { x: number; y: number; w: number; h: number } {
  doc.addImage(imgData, format, x, y, maxWidth, maxHeight)
  return { x, y, w: maxWidth, h: maxHeight }
}

export function writeMessageBubble(
  doc: jsPDF,
  y: number,
  sender: 'user' | 'ai',
  message: string,
  timestamp: string,
  layout: PageLayout
): number {
  const bubblePadding = 4
  const maxBubbleWidth = layout.contentWidth * 0.75
  const fontSize = 8
  const lineH = 4.5

  y = checkPageBreak(doc, layout, y, 16)

  doc.setFont('helvetica', sender === 'user' ? 'bold' : 'normal')
  doc.setFontSize(7)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  const senderLabel = sender === 'user' ? 'YOU' : 'AROM AI'
  doc.text(senderLabel, layout.marginLeft, y)
  y += 3.5

  doc.setFontSize(6)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text(timestamp, layout.marginLeft + (sender === 'user' ? 0 : layout.contentWidth - maxBubbleWidth), y)
  y += 1

  const lines = doc.splitTextToSize(message, maxBubbleWidth - bubblePadding * 2)
  const bubbleH = Math.max(lines.length * lineH + bubblePadding * 2, 10)

  const bubbleX = sender === 'user' ? layout.marginLeft : layout.marginLeft + layout.contentWidth - maxBubbleWidth
  const bubbleColor = sender === 'user'
    ? { r: 235, g: 243, b: 255 }
    : { r: 245, g: 245, b: 250 }

  doc.setFillColor(bubbleColor.r, bubbleColor.g, bubbleColor.b)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.2)
  doc.roundedRect(bubbleX, y, maxBubbleWidth, bubbleH, 2, 2, 'FD')

  y += bubblePadding + 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSize)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  for (const line of lines) {
    doc.text(line, bubbleX + bubblePadding, y)
    y += lineH
  }

  y += bubblePadding + 1
  return y
}

export function applyContentPageHeaders(doc: jsPDF, title: string) {
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, title)
  }
}

export function generateReference(prefix: string): string {
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
}

export function today(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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

  addCoverPage(doc, {
    title: 'Project Proposal',
    subtitle: data.projectName,
    clientName: data.clientName,
    date: data.date,
    reference: generateReference('PRO'),
  })

  let y = layout.contentTop
  addHeader(doc, 'Project Proposal')

  y = writeSection(doc, y, 'Executive Summary', [data.executiveSummary], layout)
  y = writeSection(doc, y, 'Project Objectives', data.objectives.map((o) => `  • ${o}`), layout)
  y = writeSection(doc, y, 'Scope of Work', data.scope.map((s) => `  • ${s}`), layout)
  y = writeSection(doc, y, 'Deliverables', data.deliverables.map((d) => `  • ${d}`), layout)

  const timelineLines: string[] = []
  data.milestones.forEach((m) => {
    timelineLines.push(`**${m.phase}**`)
    timelineLines.push(`${m.description} — ${m.timeline}`)
    timelineLines.push('')
  })
  y = writeSection(doc, y, 'Timeline & Milestones', timelineLines, layout)

  const pHeaders = ['Service', 'Description', 'Amount']
  const pRows: TableRow[] = data.pricingItems.map((item) => ({
    cells: [item.service, item.description, item.amount],
  }))
  pRows.push({ cells: ['', 'Total Investment', data.totalAmount], isHeader: true })
  y = writeSection(doc, y, 'Pricing', [], layout)
  y = writeTable(doc, y, pHeaders, pRows, layout)

  y = writeSection(doc, y, 'Payment Schedule', data.paymentSchedule.map((p) => `  • ${p}`), layout)
  y = writeSection(doc, y, 'Assumptions', data.assumptions.map((a) => `  • ${a}`), layout)
  y = writeSection(doc, y, 'Exclusions', data.exclusions.map((e) => `  • ${e}`), layout)
  y = writeSection(doc, y, 'Technologies', [`Technologies & platforms to be used: ${data.technologies.join(', ')}.`], layout)
  y = writeSection(doc, y, 'Support', [data.supportDescription], layout)

  y = writeSection(doc, y, 'Acceptance', [
    'This proposal is valid for 14 days from the date of issue.',
    'To accept this proposal, please sign below and return it to AROM Studio.',
    'Upon acceptance and receipt of the advance payment, the project will commence as per the timeline outlined above.',
    '',
    'Payment terms and conditions are subject to the Website Development Agreement which will be provided upon acceptance.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Project Proposal')

  const proposalFile = `Proposal_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'Proposal Document', proposalFile, data.clientName)
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
  agreementId?: string
}) {
  const agreementData: AgreementData = {
    clientName: data.clientName,
    clientAddress: data.clientAddress,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    projectDescription: data.projectDescription,
    timeline: data.timeline,
    selectedServices: data.selectedServices || [],
    advancePercentage: data.advancePercentage,
    finalPercentage: data.finalPercentage,
    supportPeriod: data.supportPeriod,
    effectiveDate: data.effectiveDate,
    agreementId: data.agreementId || '',
    referenceNumber: generateReference('AGR'),
  }
  return buildAgreementPDF(agreementData)
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
    date: today(),
    reference: generateReference('HAN'),
  })

  let y = layout.contentTop
  addHeader(doc, 'Website Handover')

  y = writeSection(doc, y, 'Project Details', [
    `**Client:** ${data.clientName}`,
    `**Project:** ${data.projectName}`,
    `**Handover Date:** ${today()}`,
  ], layout)

  const hHeaders = ['Item', 'Details']
  const hRows: TableRow[] = [
    { cells: ['Website URL', data.websiteUrl] },
    { cells: ['Admin Login', data.adminUrl] },
    { cells: ['Hosting Provider', data.hostingProvider] },
    { cells: ['Domain Name', data.domainName] },
    { cells: ['Source Code', data.sourceCode] },
    { cells: ['Documentation', data.documentation] },
  ]
  y = writeTable(doc, y, hHeaders, hRows, layout)

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

  y = writeSignatureBlock(doc, y, layout, data.clientName, today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Website Handover')

  const handoverFile = `Handover_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'handover', handoverFile)
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
    date: today(),
    reference: generateReference('DES'),
  })

  let y = layout.contentTop
  addHeader(doc, 'Design Approval Report')

  const daHeaders = ['Page', 'Status', 'Notes']
  const daRows: TableRow[] = items.map((item) => ({
    cells: [
      item.page,
      item.status === 'approved' ? 'APPROVED' : item.status === 'changes' ? 'CHANGES REQUESTED' : 'PENDING',
      item.notes || '—',
    ],
  }))
  y = writeTable(doc, y, daHeaders, daRows, layout)

  y = writeSection(doc, y, 'Summary', [
    `Total Designs: ${total}`,
    `Approved: ${approved}`,
    `Changes Requested: ${items.filter((d) => d.status === 'changes').length}`,
    `Pending: ${items.filter((d) => d.status === 'pending').length}`,
    `Overall Progress: ${total > 0 ? Math.round((approved / total) * 100) : 0}%`,
    '',
    'Once all designs are approved, development will proceed as per the project timeline.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, 'Client', today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Design Approval Report')

  const designFile = `Design_Approval_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'design-approval', designFile)
  trackPDFDownload('design-approval', designFile)
  doc.save(designFile)
}

export function generateRevisionsPDF(revisions: { page: string; priority: string; description: string; status: string }[]) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Revision Requests',
    subtitle: `${revisions.length} revision(s) documented`,
    date: today(),
  })

  let y = layout.contentTop
  addHeader(doc, 'Revision Requests')

  if (revisions.length === 0) {
    y = writeSection(doc, y, 'Revisions', ['No revision requests have been submitted yet.'], layout)
    finalizeDoc(doc)
    doc.setPage(2)
    addHeader(doc, 'Revision Requests')
    const revEmptyFile = `Revisions_${new Date().toISOString().split('T')[0]}.pdf`
    uploadPDF(doc, 'revisions', revEmptyFile)
    trackPDFDownload('revisions', revEmptyFile)
    doc.save(revEmptyFile)
    return
  }

  const rHeaders = ['Page', 'Priority', 'Status', 'Description']
  const rRows: TableRow[] = revisions.map((r) => ({
    cells: [r.page, r.priority.toUpperCase(), r.status.toUpperCase(), r.description],
  }))
  y = writeTable(doc, y, rHeaders, rRows, layout)

  y = writeSection(doc, y, 'Notes', [
    'Revision priority levels: LOW (cosmetic), MEDIUM (moderate changes), HIGH (critical).',
    'Standard revision cycles: up to 3 rounds of minor revisions included.',
    'Major redesigns or out-of-scope requests will be quoted separately.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, 'Client', today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Revision Requests')

  const revFile2 = `Revisions_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'revisions', revFile2)
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
    date: today(),
  })

  let y = layout.contentTop
  addHeader(doc, 'Assets Upload Summary')

  y = writeSection(doc, y, 'Project Information', [
    `**Client:** ${data.clientName}`,
    `**Project:** ${data.projectName}`,
    `**Date:** ${today()}`,
    `**Drive Folder:** ${data.folderLink}`,
  ], layout)

  y = writeSection(doc, y, 'Assets Checklist', [
    'Please ensure the following assets are uploaded:',
    ...data.categories.map((c) => `  • ${c}`),
    '',
    'Assets should be organised in clearly named subfolders.',
    'Accepted formats: Images (PNG, JPG, SVG, WebP), Videos (MP4, MOV), Documents (PDF, DOCX), Fonts (TTF, OTF, WOFF).',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Assets Upload Summary')

  const assetsFile = `Assets_Summary_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'Assets Upload Summary', assetsFile, data.clientName)
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
    date: today(),
  })

  let y = layout.contentTop
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

  for (const [secTitle, content] of contentSections) {
    if (!content.trim()) continue
    y = writeSection(doc, y, secTitle, [content], layout)
  }

  y = writeSection(doc, y, 'Next Steps', [
    'Please review the content above and ensure everything is accurate.',
    'Once confirmed, AROM Studio will proceed with integrating this content into the website.',
    'For any changes or updates, please contact AROM Studio via email or WhatsApp.',
  ], layout)

  y = writeSignatureBlock(doc, y, layout, data.clientName, today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Content Collection')

  const contentFile = `Content_Collection_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'Content Collection Summary', contentFile, data.clientName)
  trackPDFDownload('content-collection', contentFile)
  doc.save(contentFile)
}

export function exportSectionReportPDF(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  filenamePrefix: string
) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title,
    subtitle,
    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
  })

  let y = layout.contentTop
  addHeader(doc, title)

  y = writeSection(doc, y, 'Executive Summary', [
    `This official report contains detailed record metrics for ${title}.`,
    `Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
    `Total Logged Entries: ${rows.length}`,
  ], layout)

  if (rows.length > 0 && headers.length > 0) {
    const tableRows: TableRow[] = rows.map((r) => ({
      cells: r.map((c) => String(c ?? '—')),
    }))
    y = writeTable(doc, y, headers, tableRows, layout)
  }

  y = writeContactFooter(doc, y, layout)
  finalizeDoc(doc)

  applyContentPageHeaders(doc, title)

  const fileName = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, title, fileName, 'AROM Studio Admin')
  trackPDFDownload(filenamePrefix.toLowerCase(), fileName)
  doc.save(fileName)
}

export function generateInvoicePDF(inv: AdminInvoiceData): jsPDF {
  const doc = createDoc()
  const layout = getPageLayout(doc)
  const pw = layout.pageWidth
  const sym = inv.currency === 'INR' ? '₹' : '$'

  doc.setFillColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.rect(0, 0, pw, 45, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(BRAND.nameUpper, layout.marginLeft, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text('PREMIUM DIGITAL AGENCY', layout.marginLeft, 26)

  doc.setTextColor(200, 200, 210)
  doc.setFontSize(9)
  doc.text(`${BRAND.email}  |  ${BRAND.phone}  |  ${BRAND.url}`, layout.marginLeft, 34)

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('INVOICE', pw - layout.marginRight, 22, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text(inv.invoiceNumber, pw - layout.marginRight, 29, { align: 'right' })

  let y = 58

  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BILLED TO:', layout.marginLeft, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(inv.clientName, layout.marginLeft, y)
  y += 5
  if (inv.clientCompany) {
    doc.text(inv.clientCompany, layout.marginLeft, y)
    y += 5
  }
  doc.text(inv.clientEmail, layout.marginLeft, y)
  y += 5
  if (inv.clientPhone) {
    doc.text(inv.clientPhone, layout.marginLeft, y)
    y += 5
  }

  const metaY = 58
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE DETAILS:', pw - layout.marginRight - 60, metaY)
  doc.setFont('helvetica', 'normal')
  const createdDate = inv.createdAt
    ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  doc.text(`Date: ${createdDate}`, pw - layout.marginRight - 60, metaY + 6)
  doc.text(`Due Date: ${inv.dueDate}`, pw - layout.marginRight - 60, metaY + 12)
  doc.text(`Status: ${inv.status.toUpperCase()}`, pw - layout.marginRight - 60, metaY + 18)

  y = Math.max(y + 8, 95)

  doc.setFillColor(240, 243, 248)
  doc.rect(layout.marginLeft, y, layout.contentWidth, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text('DESCRIPTION', layout.marginLeft + 3, y + 5.5)
  doc.text('QTY', layout.marginLeft + 105, y + 5.5)
  doc.text('PRICE', layout.marginLeft + 130, y + 5.5)
  doc.text('TOTAL', layout.marginLeft + 160, y + 5.5)

  y += 12
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.setFontSize(9)

  const itemStartY = y
  for (const item of inv.items) {
    y = checkPageBreak(doc, layout, y, 8)
    const lineTotal = item.quantity * item.unitPrice
    const descLines = doc.splitTextToSize(item.description, 95)
    doc.text(descLines[0], layout.marginLeft + 3, y)
    doc.text(item.quantity.toString(), layout.marginLeft + 107, y)
    doc.text(`${sym}${item.unitPrice.toLocaleString('en-IN')}`, layout.marginLeft + 130, y)
    doc.text(`${sym}${lineTotal.toLocaleString('en-IN')}`, layout.marginLeft + 160, y)
    y += 8
    for (let i = 1; i < descLines.length; i++) {
      y = checkPageBreak(doc, layout, y, 8)
      doc.text(descLines[i], layout.marginLeft + 3, y)
      y += 8
    }
  }

  if (y < itemStartY + 20) y = itemStartY + 20

  doc.setDrawColor(220, 220, 230)
  doc.line(layout.marginLeft, y, pw - layout.marginRight, y)
  y += 10

  const summaryX = pw - layout.marginRight - 60
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Subtotal: ${sym}${inv.subtotal.toLocaleString('en-IN')}`, summaryX, y)
  y += 6
  if (inv.discountAmount > 0) {
    doc.text(`Discount (${inv.discountRate}%): -${sym}${inv.discountAmount.toLocaleString('en-IN')}`, summaryX, y)
    y += 6
  }
  doc.text(`GST/Tax (${inv.taxRate}%): +${sym}${inv.taxAmount.toLocaleString('en-IN')}`, summaryX, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text(`Total Due: ${sym}${inv.totalAmount.toLocaleString('en-IN')}`, summaryX, y)

  y = Math.max(y + 20, layout.contentBottom - 30)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text(`Notes: ${inv.notes || 'Thank you for your business.'}`, layout.marginLeft, y)
  y += 5
  doc.text(`${BRAND.nameUpper} • Crafting Precision Digital Products`, layout.marginLeft, y)

  return doc
}

export function generateDiscoveryQuestionnairePDF(data: QData) {
  const doc = createDoc()
  const layout = getPageLayout(doc)
  const pw = layout.pageWidth

  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pw, layout.pageHeight, 'F')
  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(0, 0, pw, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text('AROM Studio', pw / 2, 70, { align: 'center' })
  doc.setFontSize(9)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('Web Design & Development Agency', pw / 2, 78, { align: 'center' })
  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.5)
  doc.line(pw / 2 - 25, 84, pw / 2 + 25, 84)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text('Discovery Questionnaire', pw / 2, 105, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
  doc.text(`Prepared for: ${data.fullName || 'Client'}`, pw / 2, 118, { align: 'center' })
  doc.text(`Date: ${today()}`, pw / 2, 126, { align: 'center' })
  doc.setFillColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.rect(0, layout.pageHeight - 25, pw, 25, 'F')
  doc.setFontSize(7)
  doc.setTextColor(180)
  doc.text(`${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.phone}  |  ${BRAND.url}`, pw / 2, layout.pageHeight - 12, { align: 'center' })
  doc.addPage()

  addHeader(doc, 'Discovery Questionnaire')

  let y = layout.contentTop

  const writeLabel = (label: string, value: string) => {
    y = checkPageBreak(doc, layout, y, 10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
    doc.text(label, layout.marginLeft, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
    const split = doc.splitTextToSize(value || '—', layout.contentWidth)
    for (const s of split) {
      y = checkPageBreak(doc, layout, y, 4.5)
      doc.text(s, layout.marginLeft, y)
      y += 4.5
    }
    y += 3
  }

  const writeArray = (label: string, arr: string[]) => {
    writeLabel(label, arr.length > 0 ? arr.join(', ') : 'None selected')
  }

  writeLabel('Full Name', data.fullName)
  writeLabel('Company / Business Name', data.company)
  writeLabel('Designation', data.designation)
  writeLabel('Email Address', data.email)
  writeLabel('Phone Number', data.phone)
  writeLabel('Website (if any)', data.website)
  writeLabel('Business Description', data.businessDesc)
  writeLabel('Products / Services Offered', data.services)
  writeLabel('Years in Business', data.yearsBusiness)
  writeLabel('Differentiator', data.differentiator)
  writeArray('Why Website?', data.whyWebsite)
  writeLabel('Top 3 Goals', data.goals)
  writeArray('Age Groups', data.ageGroups)
  writeArray('Target Location', data.targetLocation)
  writeLabel('Competitors', data.competitors)
  writeLabel('What you like about competitors', data.likeCompetitors)
  writeLabel('What you dislike', data.dislikeCompetitors)
  writeLabel('Inspiration 1', data.inspiration1 ? `${data.inspiration1} — ${data.reason1}` : '')
  writeLabel('Inspiration 2', data.inspiration2 ? `${data.inspiration2} — ${data.reason2}` : '')
  writeLabel('Inspiration 3', data.inspiration3 ? `${data.inspiration3} — ${data.reason3}` : '')
  writeLabel('Branding', Object.entries(data.branding).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None')
  writeArray('Required Pages', data.pages)
  writeArray('Required Features', data.features)
  writeLabel('Content Provider', data.contentProvider)
  writeArray('Content Items', data.contentItems)
  writeLabel('Own Domain?', data.ownDomain)
  writeLabel('Domain Name', data.domainName)
  writeLabel('Own Hosting?', data.ownHosting)
  writeLabel('Hosting Provider', data.hostingProvider)
  writeLabel('Require SEO?', data.requireSEO)
  writeLabel('Target Keywords', data.targetKeywords)
  writeLabel('Target Cities', data.targetCities)
  writeLabel('Preferred Start Date', data.startDate)
  writeLabel('Preferred Launch Date', data.launchDate)
  writeLabel('Urgency', data.urgency)
  writeLabel('Budget', data.budget)
  writeArray('Preferred Communication', data.communication)
  writeLabel('Preferred Meeting Time', data.meetingTime)
  writeLabel('Additional Notes', data.additionalNotes)

  y = checkPageBreak(doc, layout, y, 45)
  y += 6
  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, pw - layout.marginRight, y)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text('Declaration', layout.marginLeft, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text('I confirm that the information provided in this questionnaire is accurate and complete to the best of my knowledge.', layout.marginLeft, y)
  y += 8
  doc.text(`Client Name: ${data.fullName || '_________________________'}`, layout.marginLeft, y)
  y += 7
  doc.text(`Date: ${today()}`, layout.marginLeft, y)
  y += 12

  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.line(layout.marginLeft, y, pw - layout.marginRight, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('INTERNAL USE ONLY', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text('Lead ID: ______________________', layout.marginLeft, y); y += 5
  doc.text('Sales Representative: ______________________', layout.marginLeft, y); y += 5
  doc.text('Discovery Call Date: ______________________', layout.marginLeft, y); y += 5
  doc.text('Proposal Due Date: ______________________', layout.marginLeft, y); y += 5
  doc.text('Estimated Budget: ______________________', layout.marginLeft, y); y += 5
  doc.text('Lead Status: ____ New ____ Qualified ____ Proposal Sent ____ Negotiation ____ Won ____ Lost', layout.marginLeft, y)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Discovery Questionnaire')

  const dqFile = `Discovery_Questionnaire_${(data.fullName || 'Client').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'Discovery Questionnaire', dqFile, data.fullName || 'Client')
  trackPDFDownload('discovery-questionnaire', dqFile)
  doc.save(dqFile)
}
