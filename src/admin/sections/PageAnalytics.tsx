import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { BarChart3 } from 'lucide-react'

export function PageAnalytics() {
  const [data, setData] = useState<any>(null)
  const [selectedPage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  const pageColumns = [
    { key: 'page', label: 'Page' },
    { key: 'views', label: 'Views' },
    { key: 'avgTime', label: 'Avg Time', render: (v: number) => `${v}s` },
    { key: 'avgScroll', label: 'Avg Scroll', render: (v: number) => `${v}%` },
    { key: 'bounceRate', label: 'Bounce %', render: (v: number) => `${v}%` },
  ]

  const heatmapDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Pages Tracked" value={data.pages?.length || 0} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard label="Unique Sessions" value={data.totalUniqueSessions} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard label="Overall Bounce Rate" value={`${data.overallBounceRate || 0}%`} icon={<BarChart3 className="h-4 w-4" />} />
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Hourly Traffic Heatmap (7d x 24h)</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-25 gap-0.5 min-w-[600px]">
            <div className="text-[8px] text-muted" />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-[8px] text-muted text-center">{h}</div>
            ))}
            {(data.hourlyTraffic || []).map((row: number[], day: number) => (
              <>
                <div key={`label-${day}`} className="text-[8px] text-muted pr-1 flex items-center">{heatmapDays[day]}</div>
                {row.map((val: number, hour: number) => {
                  const max = Math.max(...(data.hourlyTraffic || []).flat(), 1)
                  const intensity = Math.min(1, val / max)
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="aspect-square rounded-sm"
                      style={{ backgroundColor: `rgba(78, 133, 191, ${intensity * 0.8 + 0.05})` }}
                      title={`${heatmapDays[day]} ${hour}:00 - ${val} visits`}
                    />
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Page Performance</h3>
        <DataTable columns={pageColumns} data={(data.pages || []).sort((a: any, b: any) => b.views - a.views)} />
      </div>

      {selectedPage && (
        <div className="glass rounded-[--radius-card] p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Top Referrers for {selectedPage}</h3>
          <div className="space-y-1 text-xs text-text-secondary">
            {data.pages?.find((p: any) => p.page === selectedPage)?.topReferrers?.map((r: [string, number]) => (
              <div key={r[0]} className="flex items-center gap-2">
                <span className="text-muted">{r[0]}</span>
                <span className="text-text-secondary">({r[1]})</span>
              </div>
            )) || <p className="text-muted">No referrer data</p>}
          </div>
        </div>
      )}
    </div>
  )
}
