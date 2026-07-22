import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { Users, FileText, Mail, Eye, Activity } from 'lucide-react'

export function Overview() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/overview', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-[--radius-card] p-4 animate-pulse">
            <div className="h-3 w-20 bg-surface-light rounded mb-3" />
            <div className="h-7 w-16 bg-surface-light rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitors Today" value={data.todayVisits} icon={<Users className="h-4 w-4" />} />
        <StatCard label="This Week" value={data.weekVisits} icon={<Users className="h-4 w-4" />} />
        <StatCard label="This Month" value={data.monthVisits} icon={<Users className="h-4 w-4" />} />
        <StatCard label="All Time" value={data.allTimeVisits} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Active Now" value={data.activeSessions} sub="last 5 minutes" icon={<Activity className="h-4 w-4" />} />
        <StatCard label="PDFs Generated" value={data.totalPDFs} sub={`${data.todayPDFs} today`} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Form Leads" value={data.totalLeads} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="Top Page Today" value={data.topPage} icon={<Eye className="h-4 w-4" />} />
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent Events</h3>
        {data.recentEvents?.length > 0 ? (
          <div className="space-y-2">
            {data.recentEvents.map((ev: any, i: number) => (
              <div key={ev.id || i} className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="text-muted shrink-0 font-mono">{new Date(ev.createdAt || ev.timestamp).toLocaleTimeString()}</span>
                <span className="text-text-secondary capitalize">{ev.type || ev.event || 'visit'}</span>
                <span className="text-muted truncate">{ev.page || ev.detail || ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No events recorded yet</p>
        )}
      </div>
    </div>
  )
}
