import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileText, Download, Eye, Trash2, X } from 'lucide-react'
import { getAdminStore, moveToRecycleBin, formatIST, type AdminPDF } from '../adminStore'
import { generateAdminReportPDF } from '../../lib/professionalPDF'

export function PDFActivity() {
  const [data, setData] = useState<AdminPDF[]>(getAdminStore().pdfs)
  const [previewPdf, setPreviewPdf] = useState<AdminPDF | null>(null)

  const reload = () => {
    setData(getAdminStore().pdfs || [])
  }

  useEffect(() => {
    reload()
  }, [])

  const totalPdfs = data.length
  const avgSize = totalPdfs > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.fileSizeKb || 180), 0) / totalPdfs) : 0

  const handleExportPDFArchive = () => {
    generateAdminReportPDF({
      sectionTitle: 'PDF Document Archive Report',
      subtitle: `${totalPdfs} Total PDF Documents Archived | Average Size: ${avgSize} KB`,
      headers: ['Time (IST)', 'Document Title / Type', 'Client / User', 'Size (KB)', 'Device'],
      rows: data.map((pdf) => [formatIST(pdf.createdAt), pdf.title || pdf.pdfType, pdf.clientName || 'User', `${pdf.fileSizeKb || 180} KB`, pdf.deviceType || 'desktop']),
      summaryLines: [
        `Total Archived PDF Documents: ${totalPdfs}`,
        `Average Document File Size: ${avgSize} KB`,
      ],
    })
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
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
            title="Preview PDF Document"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download PDF File"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete PDF"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> PDF Documents Archive
          </h2>
          <p className="text-xs text-white/50">Stored proposals, contracts, client summaries &amp; generated files</p>
        </div>
        <button
          onClick={handleExportPDFArchive}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
        >
          <Download className="h-4 w-4 text-accent" /> Export PDF Summary
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
