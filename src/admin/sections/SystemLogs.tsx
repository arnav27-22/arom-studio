import { useState, useEffect } from 'react'
import { DataTable } from '../components/DataTable'
import { StatCard } from '../components/StatCard'
import { Download, ShieldCheck, Filter, Calendar, Activity, Lock, Layers } from 'lucide-react'
import { getAdminStore, formatIST, type AdminSystemLog } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function SystemLogs() {
  const [data, setData] = useState<AdminSystemLog[]>(getAdminStore().logs || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all')

  const reloadLogs = () => {
    fetch('/api/admin/logs', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.logs)) setData(d.logs)
        else setData(getAdminStore().logs || [])
      })
      .catch(() => {
        setData(getAdminStore().logs || [])
      })
  }

  useEffect(() => {
    reloadLogs()
  }, [])

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `audit-logs-history-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const exportCSV = () => {
    const headers = ['Timestamp', 'Category', 'Event Title', 'Severity', 'Description']
    const rows = data.map((l) => [
      `"${formatIST(l.createdAt)}"`,
      `"${l.type || 'system'}"`,
      `"${l.event || 'System Event'}"`,
      `"${l.severity || 'info'}"`,
      `"${(l.detail || '—').replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadLogsPDF = () => {
    const logs = data || []
    const headers = ['Time (IST)', 'Category', 'Event Title', 'Severity', 'Description']
    const rows = logs.map((l) => [
      formatIST(l.createdAt),
      l.type || 'system',
      l.event || l.detail || 'System Event',
      l.severity || 'info',
      l.detail || '—',
    ])
    exportSectionReportPDF('System Audit Trail Report', 'AROM Studio System Event & Security Audit Stream', headers, rows, 'System_Logs_Audit_Report')
  }

  // Filtering Logic
  const now = Date.now()
  const filtered = data.filter((l) => {
    // Search Term Filter
    if (searchTerm) {
      const matchText = `${l.event} ${l.detail} ${l.type} ${l.severity}`.toLowerCase()
      if (!matchText.includes(searchTerm.toLowerCase())) return false
    }

    // Category Filter
    if (selectedCategory !== 'all' && (l.type || 'system') !== selectedCategory) {
      return false
    }

    // Timeframe Filter
    if (selectedTimeframe !== 'all') {
      const logTime = new Date(l.createdAt).getTime()
      if (selectedTimeframe === 'today' && now - logTime > 86400000) return false
      if (selectedTimeframe === '7days' && now - logTime > 7 * 86400000) return false
      if (selectedTimeframe === '30days' && now - logTime > 30 * 86400000) return false
    }

    return true
  })

  // Metrics Summary
  const authEventsCount = data.filter((l) => l.type === 'auth' || l.type === 'security' || l.type === 'admin').length
  const visitEventsCount = data.filter((l) => l.type === 'visit').length
  const pdfEventsCount = data.filter((l) => l.type === 'pdf').length

  const columns = [
    { key: 'createdAt', label: 'Timestamp (IST)', render: (v: string) => formatIST(v) },
    {
      key: 'type',
      label: 'Category',
      render: (v: string) => (
        <span className="uppercase text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-accent tracking-wider">
          {v || 'system'}
        </span>
      ),
    },
    { key: 'event', label: 'Event Action', render: (v: string) => <span className="text-white font-medium">{v}</span> },
    {
      key: 'severity',
      label: 'Severity',
      render: (v: string) => {
        const colors: Record<string, string> = {
          info: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          warn: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          error: 'text-red-400 bg-red-500/10 border-red-500/20',
        }
        return (
          <span className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full border ${colors[v] || 'text-white/60 bg-white/5 border-white/10'}`}>
            {v || 'info'}
          </span>
        )
      },
    },
    { key: 'detail', label: 'Audit Description', render: (v: string) => <span className="text-white/70 line-clamp-2">{v || '—'}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" /> Enterprise System Audit &amp; Activity History
          </h2>
          <p className="text-xs text-white/50">Permanent central database history for all website events, admin actions, and security logs</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleDownloadLogsPDF} className="flex items-center gap-2 text-xs font-semibold text-black bg-accent hover:bg-accent/90 px-3.5 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer">
            <Download className="h-4 w-4" /> PDF Report
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={exportJSON} className="flex items-center gap-2 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">
            <Download className="h-3.5 w-3.5" /> JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Audit Events" value={data.length} icon={<Activity className="h-4 w-4 text-accent" />} />
        <StatCard label="Security & Auth Logs" value={authEventsCount} icon={<Lock className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Traffic & Visit Logs" value={visitEventsCount} icon={<Layers className="h-4 w-4 text-accent" />} />
        <StatCard label="Document PDF Logs" value={pdfEventsCount} icon={<ShieldCheck className="h-4 w-4 text-blue-400" />} />
      </div>

      {/* Category & Timeframe Filters */}
      <div className="glass rounded-[20px] p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search audit history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 w-full md:w-64"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Filter className="h-3.5 w-3.5 text-accent" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent/40 font-body"
            >
              <option value="all">All Categories</option>
              <option value="visit">Visits &amp; Traffic</option>
              <option value="pdf">PDF Generation</option>
              <option value="lead">Inquiries &amp; Forms</option>
              <option value="ai">AI Chat</option>
              <option value="auth">Auth &amp; Login</option>
              <option value="admin">Admin Actions</option>
              <option value="security">Security</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Calendar className="h-3.5 w-3.5 text-accent" />
            <span>Timeframe:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent/40 font-body"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> System Audit Trail Stream ({filtered.length} entries)
        </h3>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No audit log entries matching selected filters.
          </div>
        )}
      </div>
    </div>
  )
}
