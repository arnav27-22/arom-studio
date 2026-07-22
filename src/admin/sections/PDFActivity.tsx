import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileText, Download } from 'lucide-react'

export function PDFActivity() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/pdfs', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
    { key: 'pdfType', label: 'Type', render: (v: string) => v || '—' },
    { key: 'fileSizeKb', label: 'Size', render: (v: number) => v ? `${v} KB` : '—' },
    { key: 'deviceType', label: 'Device', render: (v: string) => v || '—' },
    { key: 'browser', label: 'Browser', render: (v: string) => v || '—' },
    { key: 'os', label: 'OS', render: (v: string) => v || '—' },
    {
      key: 'blobUrl', label: 'Download', render: (_: string, row: any) =>
        row.blobUrl ? (
          <a href={`/api/pdfs/download?id=${row.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:text-accent/80 text-xs">
            <Download className="h-3 w-3" /> PDF
          </a>
        ) : '—'
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total PDFs" value={data.total} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Average Size" value={`${data.avgSize} KB`} icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">PDFs by Day</h3>
        {Object.keys(data.byDay || {}).length > 0 ? (
          <div className="flex items-end gap-1 h-32">
            {Object.entries(data.byDay).map(([date, vals]: [string, any]) => {
              const max = Math.max(...Object.values(data.byDay).map((v: any) => v.count), 1)
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-accent/20 rounded-t" style={{ height: `${(vals.count / max) * 100}%`, minHeight: vals.count > 0 ? 4 : 0 }} />
                  <span className="text-[8px] text-muted">{date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">No PDF activity yet</p>
        )}
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">All PDF Events</h3>
        <DataTable columns={columns} data={data.pdfs || []} />
      </div>
    </div>
  )
}
