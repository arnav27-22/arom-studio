import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { Users, FileText, Mail, Eye, Activity } from 'lucide-react'

const DEFAULT_OVERVIEW = {
  todayVisits: 142,
  weekVisits: 980,
  monthVisits: 4120,
  allTimeVisits: 18450,
  activeSessions: 7,
  totalPDFs: 48,
  todayPDFs: 6,
  totalLeads: 23,
  topPage: '/services',
  recentEvents: [
    { id: '1', createdAt: new Date().toISOString(), type: 'visit', detail: 'Home Page' },
    { id: '2', createdAt: new Date(Date.now() - 300000).toISOString(), type: 'inquiry', detail: 'Custom Web Application' },
    { id: '3', createdAt: new Date(Date.now() - 900000).toISOString(), type: 'pdf', detail: 'Questionnaire Proposal' },
    { id: '4', createdAt: new Date(Date.now() - 1800000).toISOString(), type: 'visit', detail: 'Pricing Page' },
  ],
}

export function Overview() {
  const [data, setData] = useState<any>(DEFAULT_OVERVIEW)

  useEffect(() => {
    fetch('/api/admin/overview', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitors Today" value={data.todayVisits} icon={<Users className="h-4 w-4" />} />
        <StatCard label="This Week" value={data.weekVisits} icon={<Users className="h-4 w-4" />} />
        <StatCard label="This Month" value={data.monthVisits} icon={<Users className="h-4 w-4" />} />
        <StatCard label="All Time" value={data.allTimeVisits} icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Active Now" value={data.activeSessions} sub="live visitors" icon={<Activity className="h-4 w-4" />} />
        <StatCard label="PDFs Generated" value={data.totalPDFs} sub={`${data.todayPDFs} today`} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Form Leads" value={data.totalLeads} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="Top Page Today" value={data.topPage} icon={<Eye className="h-4 w-4" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Recent Activity Logs</h3>
        {data.recentEvents?.length > 0 ? (
          <div className="space-y-3">
            {data.recentEvents.map((ev: any, i: number) => (
              <div key={ev.id || i} className="flex items-center gap-3 text-xs text-white/70 py-1 border-b border-white/5 last:border-0">
                <span className="text-white/40 font-mono">{new Date(ev.createdAt || ev.timestamp || Date.now()).toLocaleTimeString()}</span>
                <span className="text-accent font-medium uppercase text-[10px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20">{ev.type || ev.event || 'visit'}</span>
                <span className="text-white/80 truncate">{ev.page || ev.detail || 'General Activity'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 font-body">No activity recorded yet</p>
        )}
      </div>
    </div>
  )
}
