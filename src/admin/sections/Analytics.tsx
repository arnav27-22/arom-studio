import { useEffect, useState } from 'react'
import { getAdminStore, subscribe, syncFromCloud } from '../adminStore'
import { BarChart3, TrendingUp, TrendingDown, Users, FileText, DollarSign, Eye, MousePointer, MessageSquare, Download } from 'lucide-react'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function Analytics() {
  const [store, setStore] = useState(getAdminStore())

  useEffect(() => {
    const unsub = subscribe(() => setStore(getAdminStore()))
    syncFromCloud().then(setStore)
    return unsub
  }, [])

  const visitors = store.visitors || []
  const leads = store.leads || []
  const invoices = store.invoices || []
  const projects = store.projects || []
  const logs = store.logs || []
  const linkClicks = store.linkClicks || []
  const discoveryQ = store.discoveryQuestionnaires || []

  const totalVisitors = visitors.length
  const totalLeads = leads.length
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter((i: any) => i.status === 'Paid').length
  const totalLinkClicks = linkClicks.length
  const totalDiscovery = discoveryQ.length

  const revenue = invoices.filter((i: any) => i.status === 'Paid').reduce((s: number, i: any) => s + i.totalAmount, 0)
  const pendingRevenue = invoices.filter((i: any) => i.status === 'Pending' || i.status === 'Overdue').reduce((s: number, i: any) => s + i.totalAmount, 0)

  const conversionRate = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) : '0.0'
  const leadToClientRate = totalLeads > 0 ? ((projects.length / totalLeads) * 100).toFixed(1) : '0.0'

  const todayLogs = logs.filter((l: any) => {
    const d = new Date(l.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const monthlyData: Record<string, { leads: number; revenue: number; visitors: number }> = {}
  const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
  months.forEach(m => { monthlyData[m] = { leads: 0, revenue: 0, visitors: 0 } })

  leads.forEach((l: any) => {
    const d = new Date(l.createdAt)
    const m = months[d.getMonth()]
    if (monthlyData[m]) monthlyData[m].leads++
  })
  invoices.forEach((i: any) => {
    if (i.status === 'Paid') {
      const d = new Date(i.createdAt)
      const m = months[d.getMonth()]
      if (monthlyData[m]) monthlyData[m].revenue += i.totalAmount
    }
  })
  visitors.forEach((v: any) => {
    const d = new Date(v.createdAt)
    const m = months[d.getMonth()]
    if (monthlyData[m]) monthlyData[m].visitors++
  })

  const maxVal = Math.max(...Object.values(monthlyData).map(d => Math.max(d.leads, d.revenue / 1000, d.visitors)), 1)

  const handleExport = () => {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Visitors', totalVisitors], ['Total Leads', totalLeads],
      ['Conversion Rate', `${conversionRate}%`],
      ['Lead-to-Client Rate', `${leadToClientRate}%`],
      ['Paid Invoices', paidInvoices], ['Pending Revenue', `₹${pendingRevenue.toLocaleString()}`],
      ['Total Revenue', `₹${revenue.toLocaleString()}`],
      ['Active Projects', projects.length],
      ['Link Clicks', totalLinkClicks],
      ['Discovery Forms', totalDiscovery],
      ['Today\'s Activities', todayLogs.length],
    ]
    exportSectionReportPDF('Analytics Report', 'AROM Studio Platform Analytics Dashboard', headers, rows, 'Analytics_Report')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent" /> Analytics</h2>
          <p className="text-xs text-white/50">Traffic, conversion, revenue & performance metrics</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"><Download className="h-4 w-4" /> Export Report</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard label="Visitors" value={totalVisitors.toLocaleString()} icon={<Eye className="h-4 w-4 text-accent" />} />
        <MetricCard label="Leads" value={totalLeads.toLocaleString()} icon={<Users className="h-4 w-4 text-accent" />} />
        <MetricCard label="Conversion" value={`${conversionRate}%`} sub="visitor → lead" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} />
        <MetricCard label="Lead → Client" value={`${leadToClientRate}%`} icon={<MessageSquare className="h-4 w-4 text-accent" />} />
        <MetricCard label="Revenue" value={`₹${revenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-emerald-400" />} />
        <MetricCard label="Pending" value={`₹${pendingRevenue.toLocaleString()}`} icon={<TrendingDown className="h-4 w-4 text-amber-400" />} />
        <MetricCard label="Link Clicks" value={totalLinkClicks.toLocaleString()} icon={<MousePointer className="h-4 w-4 text-accent" />} />
        <MetricCard label="Discovery" value={totalDiscovery.toLocaleString()} icon={<FileText className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Monthly Trends (Leads · Revenue K · Visitors)</h3>
        <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-2">
          {months.map(m => {
            const d = monthlyData[m]
            const hLeads = (d.leads / maxVal) * 100
            const hRev = ((d.revenue / 1000) / maxVal) * 100
            const hVis = (d.visitors / maxVal) * 100
            return (
              <div key={m} className="flex-1 min-w-[28px] flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col items-center justify-end h-32 gap-0.5">
                  <div className="w-4 rounded-t bg-amber-400/60 transition-all" style={{ height: `${Math.max(hVis, 0.5)}%` }} title={`${m} Visitors: ${d.visitors}`} />
                  <div className="w-4 rounded-t bg-accent/60 transition-all" style={{ height: `${Math.max(hLeads, 0.5)}%` }} title={`${m} Leads: ${d.leads}`} />
                  <div className="w-4 rounded-t bg-emerald-400/60 transition-all" style={{ height: `${Math.max(hRev, 0.5)}%` }} title={`${m} Revenue: ₹${(d.revenue / 1000).toFixed(1)}K`} />
                </div>
                <span className="text-[9px] text-white/30 font-mono">{m}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/60" /> Visitors</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/60" /> Leads</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/60" /> Revenue (₹K)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Lead Breakdown</h3>
          <div className="space-y-3">
            {['New', 'Viewed', 'Responded', 'Archived'].map(status => {
              const count = leads.filter((l: any) => l.status === status).length
              const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0'
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{status}</span>
                    <span className="text-white font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${status === 'New' ? 'bg-accent' : status === 'Viewed' ? 'bg-amber-400' : status === 'Responded' ? 'bg-emerald-400' : 'bg-white/20'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Invoice Status</h3>
          <div className="space-y-3">
            {['Paid', 'Pending', 'Overdue'].map(status => {
              const count = invoices.filter((i: any) => i.status === status).length
              const pct = totalInvoices > 0 ? ((count / totalInvoices) * 100).toFixed(1) : '0'
              const amt = invoices.filter((i: any) => i.status === status).reduce((s: number, i: any) => s + i.totalAmount, 0)
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{status}</span>
                    <span className="text-white font-mono">{count} · ₹{amt.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${status === 'Paid' ? 'bg-emerald-400' : status === 'Pending' ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/10 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-sm font-bold text-white font-mono">{value}</div>
      {sub && <div className="text-[10px] text-white/30">{sub}</div>}
    </div>
  )
}
