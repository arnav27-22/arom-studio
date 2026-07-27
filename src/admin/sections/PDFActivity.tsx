import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { FileText, Download, Eye, Trash2, X, Copy, Share2, Search, ArrowUpDown, CheckCircle } from 'lucide-react'
import { moveToRecycleBin, formatIST } from '../adminStore'
import type React from 'react'

interface PDFRecord {
  id: string
  pdfType: string
  title: string
  clientName: string
  clientEmail: string
  company: string
  phone: string
  fileSizeKb: number
  pageCount: number
  referenceNumber: string
  agreementId: string
  sha256Hash: string
  storageUrl: string
  storageProvider: string
  version: string
  status: string
  downloadCount: number
  fileName: string
  createdAt: string
  updatedAt: string
}

export function PDFActivity() {
  const [records, setRecords] = useState<PDFRecord[]>([])
  const [previewPdf, setPreviewPdf] = useState<PDFRecord | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/pdfs', { credentials: 'include' })
      if (resp.ok) {
        const data = await resp.json()
        setRecords(data.pdfs || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    reload()
    const timer = setInterval(reload, 5000)
    return () => clearInterval(timer)
  }, [])

  const filtered = records
    .filter(r => {
      if (!search) return true
      const q = search.toLowerCase()
      return r.clientName?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.referenceNumber?.toLowerCase().includes(q) ||
        r.agreementId?.toLowerCase().includes(q) ||
        r.company?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortField]
      const bVal = (b as any)[sortField]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal || '')
      const bStr = String(bVal || '')
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const handleDownload = async (pdf: PDFRecord) => {
    const a = document.createElement('a')
    a.href = `/api/admin/pdfs/${pdf.id}/download`
    a.download = pdf.fileName || `${(pdf.title || pdf.pdfType).replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => reload(), 500)
  }

  const handleCopyLink = (pdf: PDFRecord) => {
    const url = `${window.location.origin}/api/admin/pdfs/${pdf.id}/download`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  const handleDelete = async (id: string) => {
    const pdf = records.find(p => p.id === id)
    await moveToRecycleBin('pdfs', id, pdf?.title || 'PDF Document', pdf?.clientName)
    reload()
  }

  const totalPdfs = records.length
  const totalDownloads = records.reduce((s, r) => s + (r.downloadCount || 0), 0)
  const totalSizeKb = records.reduce((s, r) => s + (r.fileSizeKb || 0), 0)
  const avgSize = totalPdfs > 0 ? Math.round(totalSizeKb / totalPdfs) : 0
  const totalPages = records.reduce((s, r) => s + (r.pageCount || 0), 0)

  const renderCell = (col: { key: string; render: (v: any, row: PDFRecord) => React.ReactNode }, row: PDFRecord) => {
    return col.render((row as any)[col.key], row)
  }

  const columns: { key: string; label: string; render: (v: any, row: PDFRecord) => React.ReactNode }[] = [
    { key: 'createdAt', label: 'Date', render: (v: string) => <span className="text-white/60 text-[11px] font-mono">{formatIST(v)}</span> },
    { key: 'referenceNumber', label: 'Ref #', render: (v: string) => <span className="text-accent font-mono text-[11px]">{v || '\u2014'}</span> },
    { key: 'title', label: 'Document', render: (v: string, row: PDFRecord) => (
      <div>
        <p className="text-white font-medium text-xs">{v || row.pdfType}</p>
        <p className="text-white/40 text-[10px]">{row.agreementId || '\u2014'}</p>
      </div>
    )},
    { key: 'clientName', label: 'Client', render: (v: string, row: PDFRecord) => (
      <div>
        <p className="text-white text-xs">{v || '\u2014'}</p>
        <p className="text-white/40 text-[10px]">{row.company || row.clientEmail || '\u2014'}</p>
      </div>
    )},
    { key: 'pageCount', label: 'Pages', render: (v: number) => <span className="text-white/70 text-xs">{v || '?'}</span> },
    { key: 'fileSizeKb', label: 'Size', render: (v: number) => <span className="text-white/70 text-xs">{v ? `${v} KB` : '\u2014'}</span> },
    { key: 'downloadCount', label: 'DL', render: (v: number) => <span className="text-white/50 text-[11px]">{v || 0}</span> },
    { key: 'sha256Hash', label: 'Verified', render: (v: string) => v ? (
      <span className="text-emerald-400 flex items-center gap-1 text-[10px]"><CheckCircle className="h-3 w-3" /> SHA256</span>
    ) : (
      <span className="text-white/30 text-[10px]">\u2014</span>
    )},
    { key: 'storageProvider', label: 'Storage', render: (v: string) => (
      <span className="text-white/40 text-[10px] uppercase">{v || 'filesystem'}</span>
    )},
    { key: 'status', label: 'Status', render: (v: string) => (
      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
        v === 'Final' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
        v === 'Draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
        'bg-white/10 text-white/60'
      }`}>{v || 'Final'}</span>
    )},
    { key: 'actions', label: 'Actions', render: (_: any, row: PDFRecord) => (
      <div className="flex items-center gap-1.5">
        <button onClick={() => setPreviewPdf(row)} className="p-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors" title="Preview PDF"><Eye className="h-3.5 w-3.5" /></button>
        <button onClick={() => handleDownload(row)} className="p-1.5 text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-colors" title="Download exact original PDF"><Download className="h-3.5 w-3.5" /></button>
        <button onClick={() => handleCopyLink(row)} className="p-1.5 text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors" title="Copy download link"><Copy className="h-3 w-3" /></button>
        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors" title="Move to recycle bin"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> PDF Document Archive
          </h2>
          <p className="text-xs text-white/50">Original stored PDFs — all downloads return the exact file, never regenerated</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total PDFs Archived" value={totalPdfs} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Total Downloads" value={totalDownloads} icon={<Download className="h-4 w-4 text-accent" />} />
        <StatCard label="Average Size" value={`${avgSize} KB`} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Total Pages" value={totalPages} icon={<FileText className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">Archived PDF Documents</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search by client, document, ref..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 w-64 outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
        {loading && records.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs">Loading archived PDFs...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  {columns.map(col => (
                    <th key={col.key} className={`text-left py-2 px-2 font-medium ${col.key === 'actions' ? 'text-right' : ''}`}>
                      {col.key !== 'actions' ? (
                        <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-white transition-colors">
                          {col.label}
                          {sortField === col.key && <ArrowUpDown className={`h-3 w-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />}
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="py-2.5 px-2">
                        {renderCell(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            {search ? 'No PDFs match your search.' : 'No PDFs archived yet. Generate an agreement or proposal to create one.'}
          </div>
        )}
      </div>

      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewPdf(null)}>
          <div className="glass rounded-[24px] p-6 max-w-5xl w-full h-[90vh] flex flex-col border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <div>
                <h3 className="font-heading text-white text-base">{previewPdf.title || previewPdf.pdfType}</h3>
                <p className="text-xs text-white/50 flex items-center gap-3 mt-1">
                  <span>{previewPdf.clientName}</span>
                  <span className="text-white/30">|</span>
                  <span>Ref: {previewPdf.referenceNumber || '—'}</span>
                  <span className="text-white/30">|</span>
                  <span>{previewPdf.pageCount || '?'} pages</span>
                  <span className="text-white/30">|</span>
                  <span>{previewPdf.fileSizeKb || '?'} KB</span>
                  {previewPdf.sha256Hash && (
                    <>
                      <span className="text-white/30">|</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> SHA256 verified
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(previewPdf)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-xs font-semibold rounded-lg hover:bg-accent/90 transition-colors">
                  <Download className="h-3.5 w-3.5" /> Download Original
                </button>
                <button onClick={() => handleCopyLink(previewPdf)} className="p-1.5 text-white/50 hover:text-white/80 bg-white/5 rounded-lg border border-white/10" title="Copy download link">
                  <Share2 className="h-4 w-4" />
                </button>
                <button onClick={() => setPreviewPdf(null)} className="p-1 text-white/50 hover:text-white rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <iframe
              src={`/api/admin/pdfs/${previewPdf.id}/preview`}
              className="w-full flex-1 rounded-xl bg-white"
              title="PDF Document Preview"
            />
          </div>
        </div>
      )}
    </div>
  )
}
