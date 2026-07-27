import jsPDF from 'jspdf'
import { trackPDFDownload, uploadPDF } from './tracker'
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

function fmtDate(iso: string): string {
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

function applyContentPageHeaders(doc: jsPDF, title: string) {
  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i)
    addHeader(doc, title)
  }
}

function generateReference(prefix: string): string {
  return `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
}

function today(): string {
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
}) {
  const doc = createDoc()
  const layout = getPageLayout(doc)

  addCoverPage(doc, {
    title: 'Website Development Agreement',
    subtitle: 'Professional Web Development Services',
    clientName: data.clientName || '[Client Name]',
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    date: data.effectiveDate ? fmtDate(data.effectiveDate) : today(),
    reference: generateReference('AGR'),
  })

  let y = layout.contentTop
  addHeader(doc, 'Website Development Agreement')

  const effDate = data.effectiveDate ? fmtDate(data.effectiveDate) : '_______________'

  y = writeSection(doc, y, '1. Parties', [
    'This Website Development Agreement ("Agreement") is entered into between AROM Studio, having its principal place of business at the address provided on the proposal ("Agency"), and the Client identified in the project proposal ("Client").',
    `The Client's name is ${data.clientName || '[Client Name]'}${data.clientAddress ? `, with address at ${data.clientAddress}` : ''}${data.clientEmail ? `, and contact email ${data.clientEmail}` : ''}.`,
    'The Agency and the Client may each be referred to individually as a "Party" and collectively as the "Parties."',
    `This Agreement becomes effective from ${effDate} ("Effective Date").`,
    'The Parties agree that the terms and conditions set forth herein shall govern the relationship between them with respect to the website development project described in the attached Proposal.',
    '',
    '  - I have read and agree to Section 1: Parties',
  ], layout, true, true)

  y = writeSection(doc, y, '2. Definitions', [
    '"Agreement" means this Website Development Agreement, including all schedules, annexures, and the Project Proposal referenced herein.',
    '"Client" means the individual or entity engaging AROM Studio for the provision of Services under this Agreement.',
    '"Agency" means AROM Studio, the service provider responsible for delivering the Services as described in this Agreement.',
    '"Deliverables" means the specific work products, including designed web pages, developed functionality, source files, and assets, to be delivered by the Agency to the Client as specified in the Proposal.',
    '"Project" means the website design and development project described in the Proposal, including all associated tasks, milestones, and Deliverables.',
    '"Services" means all work to be performed by the Agency for the Client under this Agreement, as more particularly described in the Scope of Work and Proposal.',
    '"Website" means the final website or web application developed by the Agency for the Client as part of the Project.',
    '"Content" means all text, images, videos, graphics, logos, and other materials provided by the Client for use in the Website.',
    '"Intellectual Property" means all patents, copyrights, trademarks, trade secrets, and other proprietary rights in any work product created under this Agreement.',
    '"Confidential Information" means any non-public information disclosed by one Party to the other, including business strategies, technical data, source code, and client lists.',
    '"Effective Date" means the date on which this Agreement becomes binding, as set forth in Section 1.',
    '',
    '  - I have read and agree to Section 2: Definitions',
  ], layout, true, true)

  y = writeSection(doc, y, '3. Project Overview', [
    'The Client has engaged AROM Studio to design, develop, and deliver a website or web application as more fully described in the Project Proposal provided to the Client.',
    `The Project scope, features, and functional requirements are outlined in the Proposal. ${data.projectDescription ? `The Client has provided the following description: ${data.projectDescription}` : ''}`,
    'The Agency agrees to apply its professional expertise and creative resources to fulfill the objectives of the Project in accordance with the terms of this Agreement.',
    'The Client acknowledges that the final output may vary from initial concepts based on technical feasibility, content availability, and mutual decisions made during the development process.',
    'This Agreement, together with the Proposal, sets forth the complete understanding between the Parties with respect to the Project.',
    '',
    '  - I have read and agree to Section 3: Project Overview',
  ], layout, true, true)

  y = writeSection(doc, y, '4. Scope of Work', [
    'The Agency agrees to provide the Services as defined in the Project Proposal, which may include website design, website development, responsive design, landing page creation, e-commerce functionality, custom feature development, CMS integration, SEO optimization, and website deployment.',
    'The Services shall be performed in a professional and workmanlike manner consistent with industry standards and best practices.',
    'Any work not expressly listed in the Proposal shall be considered outside the Scope of Work and shall require a separate written agreement and additional compensation.',
    'The Agency reserves the right to adjust the technical approach to the Services as needed to achieve the Project objectives, provided that such adjustments do not materially alter the agreed Deliverables.',
    '',
    '  - I have read and agree to Section 4: Scope of Work',
  ], layout, true, true)

  y = writeSection(doc, y, '5. Deliverables', [
    'Upon completion of the Services and subject to full payment, the Agency shall deliver to the Client the Deliverables specified in the Project Proposal.',
    'Deliverables may include designed web pages, developed website functionality, source code files, graphic assets, documentation, and any other items expressly identified in the Proposal.',
    'All Deliverables shall be provided in digital format via a mutually agreed method of transfer, such as email, cloud storage, or direct handover of access credentials.',
    'The Client shall have the opportunity to review the Deliverables during the revision period and request reasonable corrections to ensure conformity with the agreed specifications.',
    'Deliverables are considered accepted upon the Client\'s written approval or upon deployment of the Website to a live environment with the Client\'s knowledge and consent.',
    '',
    '  - I have read and agree to Section 5: Deliverables',
  ], layout, true, true)

  y = writeSection(doc, y, '6. Timeline', [
    `The estimated duration for completion of the Project is ${data.timeline || '4 to 6 weeks'} from the Effective Date, subject to the Client's timely provision of required materials, feedback, and approvals.`,
    'The Agency shall make reasonable efforts to adhere to the estimated timeline; however, delays caused by the Client, third-party services, or unforeseen technical challenges may extend the Project schedule.',
    'Any significant change to the Project scope requested after work has commenced may result in an adjusted timeline, which shall be communicated to the Client in writing.',
    'The Agency shall keep the Client informed of progress and any anticipated delays on a regular basis throughout the duration of the Project.',
    'Both Parties agree to work in good faith to minimize delays and to adjust the timeline as necessary to accommodate changing circumstances.',
    '',
    '  - I have read and agree to Section 6: Timeline',
  ], layout, true, true)

  y = writeSection(doc, y, '7. Client Responsibilities', [
    'The Client agrees to provide all necessary Content, including text, images, videos, logos, brand colors, and any other materials required for the development of the Website, in a timely manner.',
    'The Client shall provide access to any existing domain registrations, hosting accounts, social media profiles, and third-party service accounts as may be required for the completion of the Project.',
    'The Client is responsible for reviewing all work in progress and providing timely feedback, approvals, or revision requests within the timeframes communicated by the Agency.',
    'The Client warrants that all Content provided to the Agency is accurate, complete, and legally owned or licensed for use in the Website, and that the Agency\'s use of such Content will not infringe upon the rights of any third party.',
    'Failure to fulfill these responsibilities in a timely manner may result in Project delays, for which the Agency shall not be held liable.',
    '',
    '  - I have read and agree to Section 7: Client Responsibilities',
  ], layout, true, true)

  y = writeSection(doc, y, '8. Agency Responsibilities', [
    'The Agency agrees to perform all Services with reasonable skill, care, and diligence, and in accordance with the specifications and requirements set forth in the Proposal.',
    'The Agency shall communicate regularly with the Client regarding Project progress, milestones achieved, and any issues or delays that may arise during the course of the Project.',
    'The Agency shall meet all agreed-upon deadlines to the best of its ability and shall notify the Client promptly if any deadline is at risk of being missed.',
    'The Agency shall maintain high standards of quality in all Deliverables and shall ensure that the Website is developed in accordance with current web standards and best practices.',
    'The Agency reserves the right to determine the technical means and methods by which the Services are performed, provided that the final Deliverables conform to the agreed specifications.',
    '',
    '  - I have read and agree to Section 8: Agency Responsibilities',
  ], layout, true, true)

  y = writeSection(doc, y, '9. Payment Terms', [
    `The Client agrees to pay the Agency the total Project fee as set forth in the Proposal. An advance payment of ${data.advancePercentage || '50'}% of the total fee shall be due before work commences, and the remaining ${data.finalPercentage || '50'}% shall be due prior to final delivery or deployment of the Website.`,
    'All payments shall be made in the currency specified in the Proposal and shall be free of any deductions, setoffs, or withholding taxes unless required by law.',
    'If any payment is not received by the due date, the Agency reserves the right to pause all work on the Project until the outstanding amount is settled in full.',
    'Payments delayed by more than seven calendar days may result in a revised timeline, and the Agency shall not be liable for any consequences arising from such delays.',
    'The Agency shall provide invoices for all payments due, and the Client shall make payments to the account or payment method specified on the invoice.',
    '',
    '  - I have read and agree to Section 9: Payment Terms',
  ], layout, true, true)

  y = writeSection(doc, y, '10. Additional Work', [
    'Any work requested by the Client that falls outside the Scope of Work defined in the Proposal, including additional pages, new features, major design changes, third-party integrations, or functional modifications, shall be considered Additional Work.',
    'The Agency shall provide a written quotation for any Additional Work before commencing it, and the Client\'s written approval of the quotation shall be required before such work begins.',
    'Additional Work shall be billed separately at the Agency\'s then-current rates, and payment terms for such work shall be as agreed upon in the relevant quotation.',
    'No claim for Additional Work shall be valid unless confirmed in writing by both Parties, and the Agency shall not be obligated to perform any work for which a written agreement has not been reached.',
    '',
    '  - I have read and agree to Section 10: Additional Work',
  ], layout, true, true)

  y = writeSection(doc, y, '11. Revisions', [
    'The Client shall be entitled to a reasonable number of revision rounds as specified in the Proposal, during which the Client may request changes to the design and functionality of the Website.',
    'For Basic tier projects, up to two revision rounds are included; for Standard tier projects, up to three revision rounds are included; and for Premium tier projects, revisions are unlimited until design approval is granted.',
    'A revision is defined as a request to modify existing work within the agreed Scope of Work. Requests that introduce new features, pages, or functionality beyond the original scope shall be treated as Additional Work.',
    'Major redesigns or fundamental changes to work that has already been approved by the Client shall be treated as new work and may be subject to additional charges.',
    'The Agency shall make every effort to accommodate reasonable revision requests within the agreed limits, and the Client agrees to provide clear and consolidated feedback to minimize the number of revision cycles.',
    '',
    '  - I have read and agree to Section 11: Revisions',
  ], layout, true, true)

  y = writeSection(doc, y, '12. Communication', [
    'The Parties agree to maintain open and timely communication throughout the duration of the Project using mutually agreed methods, which may include email, WhatsApp, Google Meet, Zoom, or phone calls.',
    'The Client should provide feedback, approvals, and decisions within five business days of receiving a request from the Agency, unless a different timeframe is mutually agreed upon.',
    'If the Client does not respond to Agency communications for a period of ten consecutive business days, the Agency may place the Project on hold until communication resumes, and the timeline shall be extended accordingly.',
    'The Agency shall designate a primary point of contact for the Client, and the Client shall designate a primary point of contact with authority to make decisions and provide approvals on behalf of the Client.',
    'All formal notices under this Agreement shall be sent in writing to the email addresses provided by each Party.',
    '',
    '  - I have read and agree to Section 12: Communication',
  ], layout, true, true)

  y = writeSection(doc, y, '13. Domain and Hosting', [
    'Unless expressly included in the Proposal, domain name registration and web hosting services are the sole responsibility of the Client and shall be procured and paid for by the Client directly.',
    'If the Agency agrees to assist the Client with domain registration or hosting setup, any third-party fees, renewal charges, or incidental costs shall be billed to the Client separately.',
    'The Agency shall not be liable for any downtime, data loss, or service interruptions arising from the Client\'s choice of hosting provider or domain registrar.',
    'The Client is responsible for maintaining valid domain registration and hosting accounts for the Website after launch, and the Agency shall have no obligation to host or maintain the Website unless a separate hosting or maintenance agreement is in place.',
    '',
    '  - I have read and agree to Section 13: Domain and Hosting',
  ], layout, true, true)

  y = writeSection(doc, y, '14. Third-Party Services', [
    'The Agency may utilize third-party tools, plugins, libraries, frameworks, and services as part of the development process, including but not limited to content management systems, e-commerce platforms, payment gateways, and analytics services.',
    'Any costs associated with third-party services, including license fees, subscription charges, or usage fees, shall be communicated to the Client in advance and billed at cost unless otherwise agreed.',
    'The Agency shall not be liable for any failure, downtime, security breach, or data loss caused by third-party services or platforms that are outside the Agency\'s control.',
    'The Client acknowledges that third-party services may have their own terms of service and privacy policies, and the Client agrees to be bound by such terms where applicable.',
    '',
    '  - I have read and agree to Section 14: Third-Party Services',
  ], layout, true, true)

  y = writeSection(doc, y, '15. Intellectual Property', [
    'Upon receipt of full payment for all Services rendered under this Agreement, the Agency hereby assigns to the Client all rights, title, and interest in and to the final Deliverables specifically created for the Project.',
    'The Agency retains full ownership of its pre-existing tools, reusable code libraries, templates, frameworks, design systems, development methodologies, and any intellectual property created prior to or independently of this Agreement.',
    'Nothing in this Agreement shall be construed to grant the Client any license or rights to the Agency\'s retained intellectual property unless a separate written agreement is executed between the Parties.',
    'The Client agrees not to reverse engineer, decompile, or otherwise derive the source code of any proprietary tools or libraries provided by the Agency as part of the Deliverables.',
    'The Agency warrants that the Deliverables, to the best of its knowledge, do not infringe upon the intellectual property rights of any third party.',
    '',
    '  - I have read and agree to Section 15: Intellectual Property',
  ], layout, true, true)

  y = writeSection(doc, y, '16. Confidentiality', [
    'Both Parties agree to maintain the confidentiality of all Confidential Information disclosed during the course of the Project and to use such information solely for the purpose of performing obligations under this Agreement.',
    'Confidential Information shall include, but not be limited to, business strategies, financial data, technical specifications, source code, passwords, client lists, project files, and any other information designated as confidential by either Party.',
    'Neither Party shall disclose Confidential Information to any third party without the prior written consent of the disclosing Party, except as required by applicable law or court order.',
    'The obligation of confidentiality shall survive the termination or expiration of this Agreement for a period of three years from the date of termination or expiration.',
    'This section shall not apply to information that is or becomes publicly available through no fault of the receiving Party, or information that was independently developed without reference to the disclosing Party\'s Confidential Information.',
    '',
    '  - I have read and agree to Section 16: Confidentiality',
  ], layout, true, true)

  y = writeSection(doc, y, '17. Cancellation', [
    'Either Party may cancel this Agreement at any time by providing written notice to the other Party, subject to the terms set forth in this section.',
    'In the event of cancellation, the Client shall pay for all work completed by the Agency up to the date of cancellation, calculated based on the proportion of the Project completed or at the Agency\'s hourly rate, whichever is applicable.',
    'Any advance payment made by the Client shall be applied to the work completed, and any portion of the advance exceeding the value of work completed shall be refunded to the Client within 30 days of cancellation.',
    'If the advance payment is less than the value of work completed, the Client shall pay the difference within 15 days of receiving an invoice from the Agency.',
    'Deliverables completed up to the date of cancellation shall be provided to the Client only after all outstanding payments have been settled in full.',
    '',
    '  - I have read and agree to Section 17: Cancellation',
  ], layout, true, true)

  y = writeSection(doc, y, '18. Website Launch', [
    'The Website shall be deployed and made publicly accessible only after all of the following conditions have been satisfied: final written approval of the Website by the Client, receipt of all outstanding payments in full, and provision of all necessary access credentials for domain and hosting if applicable.',
    'The Agency shall coordinate the deployment process and shall provide the Client with instructions and documentation required to access and manage the Website after launch.',
    'Upon deployment, the Agency shall conduct a final verification to confirm that the Website is functioning correctly in the live environment, to the extent that the live environment is accessible and configurable by the Agency.',
    'The Client acknowledges that once the Website is deployed to a live environment, any further modifications shall be subject to the terms governing Additional Work or Maintenance as set forth in this Agreement.',
    '',
    '  - I have read and agree to Section 18: Website Launch',
  ], layout, true, true)

  y = writeSection(doc, y, '19. Warranty', [
    `The Agency warrants that the Deliverables will conform to the specifications set forth in the Proposal and will be free from material defects in coding and functionality for a period of ${data.supportPeriod || '30'} days from the date of delivery or deployment (the "Warranty Period").`,
    'During the Warranty Period, the Agency shall correct any bugs, errors, or non-conformities in the Deliverables at no additional cost to the Client, provided that such issues are reported by the Client in writing with sufficient detail to allow reproduction.',
    'The warranty does not cover issues arising from modifications made by the Client or by third parties, changes to third-party software or platforms, or any use of the Website in a manner inconsistent with its intended purpose.',
    'The Agency\'s sole obligation under this warranty is to repair or replace the non-conforming Deliverables, and the Client\'s sole remedy is the performance of such repair or replacement.',
    'This warranty is in lieu of all other warranties, express or implied, including any warranties of merchantability or fitness for a particular purpose.',
    '',
    '  - I have read and agree to Section 19: Warranty',
  ], layout, true, true)

  y = writeSection(doc, y, '20. Maintenance', [
    'After the Warranty Period expires, ongoing maintenance and support services may be provided under a separate Maintenance Agreement to be executed by both Parties.',
    'Maintenance services, if agreed, may include bug fixes, security updates, minor content changes, performance monitoring, and technical support, as defined in the Maintenance Agreement.',
    'Maintenance services shall not include major feature additions, redesigns, new page creation, or third-party plugin updates, which shall be treated as Additional Work under Section 10.',
    'If no separate Maintenance Agreement is in place, the Agency shall have no obligation to provide any maintenance or support services after the Warranty Period.',
    'The Client may request maintenance services on an ad hoc basis, and such services shall be billed at the Agency\'s then-current hourly rates.',
    '',
    '  - I have read and agree to Section 20: Maintenance',
  ], layout, true, true)

  y = writeSection(doc, y, '21. Limitation of Liability', [
    'To the maximum extent permitted by applicable law, the Agency shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to this Agreement, including but not limited to loss of revenue, loss of profits, loss of data, or business interruption.',
    'The Agency shall not be responsible for any damages, losses, or costs arising from third-party hosting failures, domain provider issues, payment gateway outages, search engine ranking changes, or any actions taken by the Client or third parties after the Website has been delivered.',
    'The Agency shall not be liable for any security breaches, cyberattacks, or data loss caused by vulnerabilities in third-party systems, the Client\'s hosting environment, or factors beyond the Agency\'s reasonable control.',
    'The Client acknowledges that search engine rankings are influenced by numerous factors outside the Agency\'s control, and the Agency makes no guarantees regarding specific ranking outcomes.',
    'In no event shall the Agency\'s total liability under this Agreement exceed the total amount paid by the Client to the Agency under this Agreement.',
    '',
    '  - I have read and agree to Section 21: Limitation of Liability',
  ], layout, true, true)

  y = writeSection(doc, y, '22. Portfolio Rights', [
    'Unless the Client specifically requests confidentiality in writing at or before the time of project completion, the Agency reserves the right to showcase the completed Website in its portfolio, on its own website, and on social media platforms for promotional and marketing purposes.',
    'Portfolio display may include screenshots, case studies, descriptions of the work performed, and attribution of the project to the Client.',
    'If the Client requests confidentiality, the Agency shall not publicly display the project, provided that such request is made in writing prior to the Agency\'s use of the project for promotional purposes.',
    'The Agency may also include the project in internal records, award submissions, and anonymized case studies even if confidentiality is requested, provided that no identifying Client information is disclosed.',
    '',
    '  - I have read and agree to Section 22: Portfolio Rights',
  ], layout, true, true)

  y = writeSection(doc, y, '23. Force Majeure', [
    'Neither Party shall be held liable for any failure or delay in performing its obligations under this Agreement if such failure or delay is caused by events beyond that Party\'s reasonable control, including but not limited to acts of God, natural disasters, war, civil unrest, government actions, public health emergencies, pandemics, internet outages, telecommunications failures, power outages, or strikes.',
    'The affected Party shall promptly notify the other Party in writing of the occurrence of any force majeure event and shall use reasonable efforts to mitigate the impact of such event on the performance of its obligations.',
    'If a force majeure event continues for a period of more than 30 days, either Party may terminate this Agreement upon written notice to the other Party without further liability, except that the Client shall pay for all work completed up to the date of termination.',
    '',
    '  - I have read and agree to Section 23: Force Majeure',
  ], layout, true, true)

  y = writeSection(doc, y, '24. Governing Law', [
    'This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles.',
    'The Parties agree that any legal proceedings arising out of or relating to this Agreement shall be brought exclusively in the courts located in the jurisdiction where AROM Studio is registered, unless otherwise mutually agreed in writing.',
    'Before commencing any legal proceedings, the Parties shall first attempt to resolve any dispute through mutual discussion and negotiation in good faith for a period of at least 30 days.',
    'The United Nations Convention on Contracts for the International Sale of Goods shall not apply to this Agreement.',
    '',
    '  - I have read and agree to Section 24: Governing Law',
  ], layout, true, true)

  y = writeSection(doc, y, '25. Dispute Resolution', [
    'Any dispute, controversy, or claim arising out of or relating to this Agreement shall be resolved through the following escalation process: first, through informal negotiation between the Parties; second, if not resolved within 30 days, through mediation by a mutually agreed neutral mediator; and third, if still not resolved, through binding arbitration or court proceedings as provided in Section 24.',
    'The Parties agree to participate in the negotiation and mediation process in good faith before resorting to litigation.',
    'The costs of mediation and arbitration shall be borne equally by the Parties unless otherwise agreed, and each Party shall bear its own legal costs.',
    'This dispute resolution process shall not prevent either Party from seeking injunctive relief from a court of competent jurisdiction to protect its intellectual property or confidential information.',
    '',
    '  - I have read and agree to Section 25: Dispute Resolution',
  ], layout, true, true)

  y = writeSection(doc, y, '26. Privacy', [
    'The Agency collects, processes, and stores personal information provided by the Client solely for the purposes of performing the Services under this Agreement, communicating with the Client, and complying with legal obligations.',
    'The Agency implements reasonable technical and organizational measures to protect the Client\'s personal information from unauthorized access, disclosure, alteration, or destruction.',
    'The Agency does not sell, trade, rent, or transfer the Client\'s personal information to third parties for their marketing purposes without the Client\'s explicit consent.',
    'The Client\'s personal information may be shared with trusted third-party service providers who assist the Agency in operating its business and delivering Services, provided that such providers agree to maintain the confidentiality of the information.',
    'The Client may request access to, correction of, or deletion of its personal information held by the Agency by submitting a written request to the Agency\'s contact email.',
    '',
    '  - I have read and agree to Section 26: Privacy',
  ], layout, true, true)

  y = writeSection(doc, y, '27. Browser Support', [
    'The Agency warrants that the Website shall be designed and developed to function correctly on the latest two major versions of the following web browsers: Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.',
    'The Website may not render or function as intended on older browser versions, discontinued browsers, or browsers not listed above, including Internet Explorer.',
    'The Agency shall make reasonable efforts to ensure cross-browser compatibility within the scope of the supported browsers, but cannot guarantee identical visual rendering across all browsers due to inherent differences in browser rendering engines.',
    'Mobile browser compatibility is limited to the latest two major versions of Safari on iOS and Chrome on Android, unless broader support is specified in the Proposal.',
    '',
    '  - I have read and agree to Section 27: Browser Support',
  ], layout, true, true)

  y = writeSection(doc, y, '28. SEO Disclaimer', [
    'The Agency may perform search engine optimization (SEO) services as part of the Project, including on-page optimization, meta-tagging, keyword research, content recommendations, and technical SEO improvements.',
    'The Client acknowledges and agrees that search engine rankings are influenced by a wide range of factors beyond the Agency\'s control, including but not limited to search engine algorithm changes, competitor activity, content quality, backlink profiles, and user engagement metrics.',
    'The Agency makes no guarantees, express or implied, regarding specific search engine ranking positions, traffic volumes, or other performance metrics, and past performance does not guarantee future results.',
    'The Agency shall perform SEO services in accordance with industry best practices and ethical guidelines, and shall not engage in any practices that may result in penalties from search engines.',
    'The Client understands that SEO is an ongoing process and that maintaining or improving rankings may require continued effort beyond the scope of this Agreement.',
    '',
    '  - I have read and agree to Section 28: SEO Disclaimer',
  ], layout, true, true)

  y = writeSection(doc, y, '29. Security Disclaimer', [
    'The Agency shall implement industry-standard security best practices in the development of the Website, including but not limited to input validation, output encoding, secure authentication mechanisms, and protection against common web vulnerabilities such as those described in the OWASP Top 10.',
    'The Agency shall take reasonable steps to secure the Website against known threats at the time of development, including secure coding practices, regular updates of core software, and the use of security plugins or tools where appropriate.',
    'The Client acknowledges that no website or web application can be guaranteed to be completely secure against all potential threats, including zero-day exploits, targeted attacks, or vulnerabilities introduced by third-party software or the Client\'s hosting environment.',
    'The Agency shall not be liable for any security breaches, data loss, or damages resulting from attacks or vulnerabilities that were not known or reasonably foreseeable at the time of development, or that arise from the Client\'s failure to maintain updates and security patches after delivery.',
    'The Client is encouraged to implement additional security measures, including regular backups, SSL certificates, web application firewalls, and security monitoring, to further protect the Website and its data.',
    '',
    '  - I have read and agree to Section 29: Security Disclaimer',
  ], layout, true, true)

  y = writeSection(doc, y, '30. Electronic Signatures', [
    'The Client\'s acceptance of this Agreement through the AROM Studio Client Portal, including by clicking "I Agree" or by making the agreed advance payment after reviewing the proposal, shall constitute a legally binding electronic signature and acceptance of all terms and conditions contained herein.',
    'The Parties agree that electronic signatures and digital acceptances shall have the same legal force and effect as handwritten signatures and shall be admissible as evidence in any legal proceeding.',
    'The Client acknowledges that no handwritten or physical signature is required for this Agreement to be binding, and that the records of acceptance maintained by the Agency shall be conclusive evidence of the Client\'s agreement.',
    'Either Party may request a physically signed copy of this Agreement at any time, and the other Party shall promptly provide such a copy upon request.',
    '',
    '  - I have read and agree to Section 30: Electronic Signatures',
  ], layout, true, true)

  y = writeSection(doc, y, '31. Entire Agreement', [
    'This Agreement, together with the Project Proposal and any schedules or annexures referenced herein, constitutes the entire and exclusive agreement between the Parties with respect to the subject matter hereof.',
    'This Agreement supersedes all prior discussions, negotiations, understandings, representations, and agreements, whether written or oral, relating to the subject matter of this Agreement.',
    'No modification, amendment, or waiver of any provision of this Agreement shall be effective unless made in writing and signed by both Parties.',
    'If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect, and the invalid provision shall be replaced with a valid provision that most closely reflects the intent of the Parties.',
    '',
    '  - I have read and agree to Section 31: Entire Agreement',
  ], layout, true, true)

  y = writeSection(doc, y, '32. Contact Information', [
    'All communications, notices, and inquiries under this Agreement should be directed to AROM Studio at the contact information provided below.',
    'Agency Name: AROM Studio',
    'Email: aromstudio27@gmail.com',
    'The Client may also reach the Agency through the contact form on the Agency\'s website or through any other communication channels provided in the Proposal.',
    'The Client agrees to keep its contact information on file with the Agency up to date and to notify the Agency promptly of any changes.',
    'Either Party may update its contact information by providing written notice to the other Party.',
    '',
    '  - I have read and agree to Section 32: Contact Information',
  ], layout, true, true)

  y = writeSignatureBlock(doc, y, layout, data.clientName, today())
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc)
  applyContentPageHeaders(doc, 'Website Development Agreement')

  const agreementFile = `Website_Development_Agreement_${data.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'Website Agreement Contract', agreementFile, data.clientName)
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
