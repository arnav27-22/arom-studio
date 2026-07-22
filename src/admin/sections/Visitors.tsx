import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Users, Monitor, Smartphone, Eye } from 'lucide-react'

export function Visitors() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/visitors', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return <div className="text-sm text-zinc-500">Loading...</div>

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="All Time" value={data.allTime} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Filtered" value={data.total} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Desktop" value={data.deviceBreakdown?.desktop || 0} icon={<Monitor className="h-4 w-4" />} />
        <StatCard label="Mobile" value={data.deviceBreakdown?.mobile || 0} icon={<Smartphone className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Daily Visits (30 days)</h3>
          {data.dailyChart?.length > 0 ? (
            <div className="flex items-end gap-1 h-32">
              {data.dailyChart.map((d: any) => {
                const max = Math.max(...data.dailyChart.map((x: any) => x.visits), 1)
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="w-full bg-[#4E85BF]/20 rounded-t" style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits > 0 ? 4 : 0 }} />
                    <span className="text-[8px] text-zinc-600">{d.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">No data yet</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Device Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(data.deviceBreakdown || {}).map(([device, count]) => (
              <div key={device} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-20 capitalize">{device}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4E85BF]/40 rounded-full" style={{ width: `${((count as number) / (devTotal || 1)) * 100}%` }} />
                </div>
                <span className="text-xs text-zinc-500 w-10 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Visits</h3>
        <DataTable columns={columns} data={data.visits || []} />
      </div>
    </div>
  )
}
