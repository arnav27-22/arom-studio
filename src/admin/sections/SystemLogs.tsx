import { useState, useEffect } from 'react'
import { DataTable } from '../components/DataTable'
import { Download, ShieldCheck } from 'lucide-react'
import { getAdminStore, formatIST } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function SystemLogs() {
  const [data, setData] = useState<any[]>(getAdminStore().logs)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/admin/logs', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.logs) setData(d.logs)
      })
      .catch(() => {})
  }, [])

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
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

  const filtered = filter
    ? data.filter((l: any) => JSON.stringify(l).toLowerCase().includes(filter.toLowerCase()))
    : data

  const columns = [
    { key: 'createdAt', label: 'Timestamp (IST)', render: (v: string) => formatIST(v) },
    { key: 'type', label: 'Category', render: (v: string) => <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-accent font-medium">{v || 'system'}</span> },
    { key: 'event', label: 'Event Title', render: (v: string) => <span className="text-white font-medium">{v}</span> },
    { key: 'severity', label: 'Severity', render: (v: string) => {
      const colors: Record<string, string> = { info: 'text-emerald-400', warn: 'text-amber-400', error: 'text-red-400' }
      return <span className={`font-medium uppercase text-[10px] ${colors[v] || 'text-white/60'}`}>{v || 'info'}</span>
    }},
    { key: 'detail', label: 'Log Description', render: (v: string) => <span className="text-white/70">{v || '—'}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search system logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 w-64"
          />
          <span className="text-xs text-white/50 font-body">
            Showing {filtered.length} of {data.length} logs
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleDownloadLogsPDF} className="flex items-center gap-2 text-xs font-semibold text-black bg-accent hover:bg-accent/90 px-3.5 py-2.5 rounded-xl transition-all shadow-lg">
            <Download className="h-4 w-4" /> Download Logs PDF
          </button>
          <button onClick={exportJSON} className="flex items-center gap-2 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-all">
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> System Audit Trail (Indian Standard Time)
        </h3>
        <DataTable columns={columns} data={filtered} />
      </div>
    </div>
  )
}
