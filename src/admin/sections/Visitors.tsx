import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Users, Monitor, Smartphone, Eye, ExternalLink, Trash2 } from 'lucide-react'

const ANALYTICS_URL = 'https://vercel.com/sharefile/arom-studio/analytics'

export function Visitors() {
  const [data, setData] = useState<any>(null)

  const load = () => {
    fetch('/api/admin/visitors', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  const clearAll = async () => {
    if (!confirm('Delete all visit data? This cannot be undone.')) return
    await fetch('/api/admin/visitors', { method: 'DELETE', credentials: 'include' })
    load()
  }

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
    { key: 'page', label: 'Page' },
    { key: 'deviceType', label: 'Device', render: (v: string) => v || '—' },
    { key: 'browser', label: 'Browser' },
    { key: 'os', label: 'OS' },
    { key: 'country', label: 'Country', render: (v: string) => v || '—' },
    { key: 'referrer', label: 'Referrer', render: (v: string) => v ? v.slice(0, 40) : '—' },
    { key: 'timeOnPage', label: 'Time (s)', render: (v: number) => v ? `${v}s` : '—' },
    { key: 'scrollDepth', label: 'Scroll', render: (v: number) => v ? `${v}%` : '—' },
  ]

  const devTotal = Object.values(data.deviceBreakdown || {}).reduce((a: number, b: any) => a + b, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <StatCard label="All Time" value={data.allTime} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Filtered" value={data.total} icon={<Eye className="h-4 w-4" />} />
          <StatCard label="Desktop" value={data.deviceBreakdown?.desktop || 0} icon={<Monitor className="h-4 w-4" />} />
          <StatCard label="Mobile" value={data.deviceBreakdown?.mobile || 0} icon={<Smartphone className="h-4 w-4" />} />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <a href={ANALYTICS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
            Vercel Analytics
          </a>
          <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-[--radius-card] p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Daily Visits (30 days)</h3>
          {data.dailyChart?.length > 0 ? (
            <div className="flex items-end gap-1 h-32">
              {data.dailyChart.map((d: any) => {
                const max = Math.max(...data.dailyChart.map((x: any) => x.visits), 1)
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="w-full bg-accent/20 rounded-t" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits > 0 ? 4 : 0 }} />
                    <span className="text-[8px] text-muted">{d.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">No data yet</p>
          )}
        </div>

        <div className="glass rounded-[--radius-card] p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Device Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(data.deviceBreakdown || {}).map(([device, count]) => (
              <div key={device} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-20 capitalize">{device}</span>
                <div className="flex-1 h-5 bg-surface-light rounded-full overflow-hidden">
                  <div className="h-full bg-accent/40 rounded-full" style={{ width: `${((count as number) / (devTotal || 1)) * 100}%` }} />
                </div>
                <span className="text-xs text-text-secondary w-10 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent Visits</h3>
        <DataTable columns={columns} data={data.visits || []} />
      </div>
    </div>
  )
}
