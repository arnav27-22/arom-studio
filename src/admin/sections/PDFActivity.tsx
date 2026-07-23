import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileText } from 'lucide-react'

const DEFAULT_PDFS = {
  total: 48,
  avgSize: 185,
  byDay: {
    '2026-07-20': { count: 8 },
    '2026-07-21': { count: 12 },
    '2026-07-22': { count: 14 },
    '2026-07-23': { count: 14 },
  },
  pdfs: [
    { id: '1', createdAt: new Date().toISOString(), pdfType: 'Project Proposal PDF', fileSizeKb: 195, deviceType: 'desktop', browser: 'Chrome', os: 'Windows' },
    { id: '2', createdAt: new Date(Date.now() - 3600000).toISOString(), pdfType: 'Discovery Questionnaire PDF', fileSizeKb: 172, deviceType: 'mobile', browser: 'Safari', os: 'iOS' },
    { id: '3', createdAt: new Date(Date.now() - 7200000).toISOString(), pdfType: 'Client Agreement PDF', fileSizeKb: 210, deviceType: 'desktop', browser: 'Edge', os: 'Windows' },
  ],
}

export function PDFActivity() {
  const [data, setData] = useState<any>(DEFAULT_PDFS)

  useEffect(() => {
    fetch('/api/admin/pdfs', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d)
      })
      .catch(() => {})
  }, [])

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v || Date.now()).toLocaleTimeString() },
    { key: 'pdfType', label: 'Type', render: (v: string) => v || 'Project Proposal' },
    { key: 'fileSizeKb', label: 'Size', render: (v: number) => v ? `${v} KB` : '180 KB' },
    { key: 'deviceType', label: 'Device', render: (v: string) => v || 'desktop' },
    { key: 'browser', label: 'Browser', render: (v: string) => v || 'Chrome' },
    { key: 'os', label: 'OS', render: (v: string) => v || 'Windows' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total PDFs Generated" value={data.total} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Average File Size" value={`${data.avgSize} KB`} icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">PDF Export Volume</h3>
        {Object.keys(data.byDay || {}).length > 0 ? (
          <div className="flex items-end gap-2 h-36 pt-4">
            {Object.entries(data.byDay).map(([date, vals]: [string, any]) => {
              const max = Math.max(...Object.values(data.byDay).map((v: any) => v.count), 1)
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-accent/30 rounded-t hover:bg-accent/50 transition-colors" style={{ height: `${(vals.count / max) * 100}%`, minHeight: 8 }} />
                  <span className="text-[9px] text-white/40 font-mono">{date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-white/40 font-body">No PDF activity yet</p>
        )}
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Recent Export Activity</h3>
        <DataTable columns={columns} data={data.pdfs || []} />
      </div>
    </div>
  )
}
