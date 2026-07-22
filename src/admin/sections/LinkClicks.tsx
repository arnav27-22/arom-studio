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

  if (!data) return <div className="text-sm text-zinc-500">Loading...</div>

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
    { key: 'type', label: 'Type', render: (v: string) => <span className="capitalize">{v}</span> },
    { key: 'label', label: 'Label' },
    { key: 'page', label: 'Page' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <MousePointer2 className="h-5 w-5 text-[#4E85BF]" />
          <div>
            <p className="text-2xl font-bold text-white">{data.total}</p>
            <p className="text-[11px] text-zinc-500">Total Clicks</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Click Count by Label</h3>
          <div className="space-y-1.5">
            {Object.entries(data.byLabel || {}).sort(([,a], [,b]) => (b as number) - (a as number)).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3 text-xs">
                <span className="text-zinc-400 w-48 truncate">{label}</span>
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4E85BF]/40 rounded-full" style={{ width: `${((count as number) / data.total) * 100}%` }} />
                </div>
                <span className="text-zinc-500 w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">All Clicks</h3>
        <DataTable columns={columns} data={data.clicks || []} />
      </div>
    </div>
  )
}
