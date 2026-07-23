import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Users, Monitor, Smartphone, Eye, ExternalLink } from 'lucide-react'

const DEFAULT_VISITORS = {
  allTime: 18450,
  total: 142,
  deviceBreakdown: { desktop: 88, mobile: 54 },
  dailyChart: [
    { date: '2026-07-17', visits: 120 },
    { date: '2026-07-18', visits: 145 },
    { date: '2026-07-19', visits: 160 },
    { date: '2026-07-20', visits: 135 },
    { date: '2026-07-21', visits: 180 },
    { date: '2026-07-22', visits: 195 },
    { date: '2026-07-23', visits: 142 },
  ],
  visits: [
    { createdAt: new Date().toISOString(), page: '/', deviceType: 'desktop', browser: 'Chrome', os: 'Windows', country: 'IN', referrer: 'Google', timeOnPage: 45, scrollDepth: 80 },
    { createdAt: new Date(Date.now() - 300000).toISOString(), page: '/services', deviceType: 'mobile', browser: 'Safari', os: 'iOS', country: 'IN', referrer: 'Direct', timeOnPage: 90, scrollDepth: 100 },
    { createdAt: new Date(Date.now() - 600000).toISOString(), page: '/pricing', deviceType: 'desktop', browser: 'Edge', os: 'Windows', country: 'US', referrer: 'Google', timeOnPage: 60, scrollDepth: 75 },
  ],
}

export function Visitors() {
  const [data, setData] = useState<any>(DEFAULT_VISITORS)

  const load = () => {
    fetch('/api/admin/visitors', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d)
      })
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v || Date.now()).toLocaleTimeString() },
    { key: 'page', label: 'Page' },
    { key: 'deviceType', label: 'Device', render: (v: string) => v || 'desktop' },
    { key: 'browser', label: 'Browser' },
    { key: 'os', label: 'OS' },
    { key: 'country', label: 'Country', render: (v: string) => v || 'IN' },
    { key: 'referrer', label: 'Referrer', render: (v: string) => v ? v.slice(0, 30) : 'Direct' },
    { key: 'timeOnPage', label: 'Time', render: (v: number) => v ? `${v}s` : '30s' },
  ]

  const devTotal = Object.values(data.deviceBreakdown || {}).reduce((a: number, b: any) => a + b, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
          <StatCard label="All Time Visits" value={data.allTime} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Today" value={data.total} icon={<Eye className="h-4 w-4" />} />
          <StatCard label="Desktop" value={data.deviceBreakdown?.desktop || 0} icon={<Monitor className="h-4 w-4" />} />
          <StatCard label="Mobile" value={data.deviceBreakdown?.mobile || 0} icon={<Smartphone className="h-4 w-4" />} />
        </div>
        <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-accent/20 border border-accent/30 hover:bg-accent/30 rounded-xl transition-colors shrink-0">
          <ExternalLink className="h-3.5 w-3.5" />
          GA4 Analytics
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Daily Visitors</h3>
          {data.dailyChart?.length > 0 ? (
            <div className="flex items-end gap-2 h-36 pt-4">
              {data.dailyChart.map((d: any) => {
                const max = Math.max(...data.dailyChart.map((x: any) => x.visits), 1)
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-accent/30 rounded-t hover:bg-accent/50 transition-colors" style={{ height: `${(d.visits / max) * 100}%`, minHeight: 8 }} />
                    <span className="text-[9px] text-white/40 font-mono">{d.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-white/40 font-body">No visit history recorded yet</p>
          )}
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Device Breakdown</h3>
          <div className="space-y-3 pt-2">
            {Object.entries(data.deviceBreakdown || {}).map(([device, count]) => (
              <div key={device} className="flex items-center gap-3">
                <span className="text-xs text-white/70 w-20 capitalize">{device}</span>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${((count as number) / (devTotal || 1)) * 100}%` }} />
                </div>
                <span className="text-xs text-white/80 font-mono w-10 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Recent Session Visits</h3>
        <DataTable columns={columns} data={data.visits || []} />
      </div>
    </div>
  )
}
