import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { BarChart3, Download, Link } from 'lucide-react'
import { getAdminStore, formatIST } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function PageAnalytics() {
  const store = getAdminStore()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const linkClicks = store.linkClicks || []

  const stats = data || { totalPageViews: 0, uniquePages: 0, averageSessionDuration: '0s' }

  const handleDownloadAnalyticsPDF = () => {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Page Views', stats.totalPageViews || linkClicks.length],
      ['Unique Pages', stats.uniquePages || 'N/A'],
      ['Avg Session Duration', stats.averageSessionDuration || 'N/A'],
      ['Link Clicks Tracked', linkClicks.length],
    ]
    exportSectionReportPDF('Page Analytics Report', 'AROM Studio Website Analytics', headers, rows, 'Page_Analytics_Report')
  }

  const linkColumns = [
    { key: 'type', label: 'Type', render: (v: string) => <span className="text-accent font-medium">{v || 'click'}</span> },
    { key: 'label', label: 'Label / Target', render: (v: string) => <span className="text-white">{v || '—'}</span> },
    { key: 'page', label: 'Page', render: (v: string) => <span className="text-white/60 text-[11px] font-mono">{v || '/'}</span> },
    { key: 'createdAt', label: 'Timestamp', render: (v: string) => <span className="text-white/40 text-[10px] font-mono">{v ? formatIST(v) : '—'}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" /> Page Analytics
          </h2>
          <p className="text-xs text-white/50">Page views, engagement metrics & tracked link clicks</p>
        </div>
        <button
          onClick={handleDownloadAnalyticsPDF}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" /> Download Analytics PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Page Views" value={stats.totalPageViews || 'N/A'} icon={<BarChart3 className="h-4 w-4 text-accent" />} />
        <StatCard label="Unique Pages" value={stats.uniquePages || 'N/A'} icon={<BarChart3 className="h-4 w-4 text-accent" />} />
        <StatCard label="Avg Session Duration" value={stats.averageSessionDuration || 'N/A'} icon={<BarChart3 className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
          <Link className="h-3.5 w-3.5" /> Tracked Link Clicks
        </h3>
        {linkClicks.length > 0 ? (
          <DataTable columns={linkColumns} data={[...linkClicks].reverse()} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No link clicks recorded yet. Link tracking will appear here as users interact with the site.
          </div>
        )}
      </div>
    </div>
  )
}
