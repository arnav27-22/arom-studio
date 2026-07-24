import { useState, useEffect } from 'react'
import { DataTable } from '../components/DataTable'
import { MousePointer2 } from 'lucide-react'

export function LinkClicks() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/clicks', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
    { key: 'type', label: 'Type', render: (v: string) => <span className="capitalize">{v}</span> },
    { key: 'label', label: 'Label' },
    { key: 'page', label: 'Page' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="glass rounded-[--radius-card] p-4 flex items-center gap-3">
          <MousePointer2 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.total}</p>
            <p className="text-[11px] text-text-secondary">Total Clicks</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-[--radius-card] p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Click Count by Label</h3>
          <div className="space-y-1.5">
            {Object.entries(data.byLabel || {}).sort(([,a], [,b]) => (b as number) - (a as number)).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3 text-xs">
                <span className="text-text-secondary w-48 truncate">{label}</span>
                <div className="flex-1 h-4 bg-surface-light rounded-full overflow-hidden">
                  <div className="h-full bg-accent/40 rounded-full" style={{ width: `${((count as number) / data.total) * 100}%` }} />
                </div>
                <span className="text-text-secondary w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">All Clicks</h3>
        <DataTable columns={columns} data={data.clicks || []} />
      </div>
    </div>
  )
}
