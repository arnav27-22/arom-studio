import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileText, Download, Eye, Trash2, X } from 'lucide-react'
import { getAdminStore, moveToRecycleBin, formatIST, type AdminPDF } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function PDFActivity() {
  const [data, setData] = useState<AdminPDF[]>(getAdminStore().pdfs)
  const [previewPdf, setPreviewPdf] = useState<AdminPDF | null>(null)

  const reload = () => {
    setData(getAdminStore().pdfs || [])
  }

  useEffect(() => {
    reload()
  }, [])

  const handleDownloadPdfArchivePDF = () => {
    const pdfs = data || []
    const headers = ['Time (IST)', 'Document Type', 'Title', 'Client / User', 'File Size']
    const rows = pdfs.map((p) => [
      formatIST(p.createdAt),
      p.pdfType,
      p.title,
      p.clientName || 'User',
      `${p.fileSizeKb || 180} KB`,
    ])
    exportSectionReportPDF('PDF Document Archive Audit', 'AROM Studio Real User Generated PDF Files Log', headers, rows, 'PDF_Archive_Audit_Report')
  }

  const handleDownload = (pdf: AdminPDF) => {
    if (pdf.pdfDataUrl) {
      const a = document.createElement('a')
      a.href = pdf.pdfDataUrl
      a.download = `${(pdf.title || pdf.pdfType).replace(/\s+/g, '_')}_${(pdf.clientName || 'User').replace(/\s+/g, '_')}.pdf`
      a.click()
    } else {
      alert(`PDF file archived: ${pdf.title || pdf.pdfType} (${pdf.fileSizeKb || 180} KB)`)
    }
  }

  const handleDelete = (id: string) => {
    const pdf = data.find((p) => p.id === id)
    moveToRecycleBin('pdfs', id, pdf?.title || pdf?.pdfType || 'PDF Document', pdf?.clientName)
    reload()
  }

  const columns = [
    { key: 'createdAt', label: 'Time (IST)', render: (v: string) => formatIST(v) },
    { key: 'pdfType', label: 'Document Type', render: (v: string) => <span className="text-accent font-medium">{v}</span> },
    { key: 'clientName', label: 'Client / User', render: (v: string, row: any) => (
      <div>
        <p className="text-white font-medium">{v || 'User'}</p>
        <p className="text-white/40 text-[10px]">{row.clientEmail || '—'}</p>
      </div>
    ) },
    { key: 'fileSizeKb', label: 'Size', render: (v: number) => `${v || 180} KB` },
    { key: 'deviceType', label: 'Device', render: (v: string) => <span className="capitalize text-white/70">{v || 'desktop'}</span> },
    {
      key: 'actions', label: 'Actions', render: (_: any, row: AdminPDF) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewPdf(row)}
            className="flex items-center gap-1 text-xs text-white/80 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            title="View exact PDF in modal"
          >
            <Eye className="h-3.5 w-3.5" /> View PDF
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="flex items-center gap-1 text-xs text-white bg-accent/20 hover:bg-accent/30 px-3 py-1.5 rounded-lg border border-accent/30 transition-colors"
            title="Download PDF to device"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
            title="Delete PDF document"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    },
  ]

  const totalPdfs = data.length
  const avgSize = totalPdfs > 0 ? Math.round(data.reduce((acc, p) => acc + (p.fileSizeKb || 180), 0) / totalPdfs) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> PDF Activity & Archive
          </h2>
          <p className="text-xs text-white/50">Stored proposals, agreements, content briefs & downloaded client documents</p>
        </div>
        <button
          onClick={handleDownloadPdfArchivePDF}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" /> Download PDF Archive Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Real PDFs Generated" value={totalPdfs} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Average PDF File Size" value={`${avgSize} KB`} icon={<FileText className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Real User Generated PDF Archive</span>
          <span className="text-white/40 font-mono text-[10px]">IST Timezone</span>
        </h3>
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No user-generated PDFs recorded yet. Client questionnaire or proposal exports on the website will archive here in real-time.
          </div>
        )}
      </div>

      {/* PDF View Modal */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewPdf(null)}>
          <div className="glass rounded-[24px] p-6 max-w-4xl w-full h-[85vh] flex flex-col border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div>
                <h3 className="font-heading text-white text-base">{previewPdf.title || previewPdf.pdfType}</h3>
                <p className="text-xs text-white/50">{previewPdf.clientName} • {formatIST(previewPdf.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewPdf)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90"
                >
                  <Download className="h-3.5 w-3.5" /> Download Exact PDF
                </button>
                <button onClick={() => setPreviewPdf(null)} className="p-1 text-white/50 hover:text-white rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {previewPdf.pdfDataUrl ? (
              <iframe src={previewPdf.pdfDataUrl} className="w-full flex-1 rounded-xl bg-white" title="PDF Document Preview" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-xl border border-white/10">
                <FileText className="h-16 w-16 text-accent mb-4" />
                <h4 className="font-heading text-lg text-white mb-1">{previewPdf.pdfType} Document</h4>
                <p className="text-xs text-white/60 mb-4 max-w-md">Generated for {previewPdf.clientName} on {formatIST(previewPdf.createdAt)} ({previewPdf.fileSizeKb || 180} KB).</p>
                <button
                  onClick={() => handleDownload(previewPdf)}
                  className="px-5 py-2.5 bg-accent text-white text-xs font-medium rounded-xl hover:bg-accent/90 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download PDF File
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
