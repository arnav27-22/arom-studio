import jsPDF from 'jspdf'

const BRAND = {
  name: 'AROM STUDIO',
  email: 'aromstudio27@gmail.com',
  url: 'https://aromstudio.vercel.app',
  color: { r: 78, g: 133, b: 191 },
}

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
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  const addFooter = () => {
    const footerY = doc.internal.pageSize.getHeight() - 15
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`${BRAND.name}  |  ${BRAND.email}  |  ${BRAND.url}`, pageWidth / 2, footerY, { align: 'center' })
  }

  // Header
  doc.setFontSize(22)
  doc.setTextColor(BRAND.color.r, BRAND.color.g, BRAND.color.b)
  doc.text(BRAND.name, 20, y)
  y += 10

  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 20, y)
  y += 12

  // Divider
  doc.setDrawColor(BRAND.color.r, BRAND.color.g, BRAND.color.b)
  doc.setLineWidth(0.5)
  doc.line(20, y, pageWidth - 20, y)
  y += 10

  // Title
  doc.setFontSize(16)
  doc.setTextColor(40)
  doc.text(title, 20, y)
  y += 12

  // Sections
  for (const section of sections) {
    if (y > 260) {
      addFooter()
      doc.addPage()
      y = 20
    }

    doc.setFontSize(12)
    doc.setTextColor(BRAND.color.r, BRAND.color.g, BRAND.color.b)
    doc.text(section.title, 20, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(60)
    for (const line of section.content) {
      if (y > 270) {
        addFooter()
        doc.addPage()
        y = 20
      }
      const split = doc.splitTextToSize(line, pageWidth - 40)
      for (const s of split) {
        doc.text(s, 20, y)
        y += 5
      }
      y += 2
    }
    y += 6
  }

  addFooter()
  doc.save(filename)
}
