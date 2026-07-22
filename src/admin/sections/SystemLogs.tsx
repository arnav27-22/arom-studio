import { useState, useEffect } from 'react'
import { DataTable } from '../components/DataTable'
import { Download } from 'lucide-react'

export function SystemLogs() {
  const [data, setData] = useState<any>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/admin/logs', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const exportJSON = () => {
    if (!data?.logs) return
    const blob = new Blob([JSON.stringify(data.logs, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'system-logs.json'
    a.click()
  }

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  const filtered = filter
    ? data.logs.filter((l: any) => JSON.stringify(l).toLowerCase().includes(filter.toLowerCase()))
    : data.logs

  const columns = [
    { key: 'timestamp', label: 'Time', render: (v: string) => v ? new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—' },
    { key: 'type', label: 'Type', render: (v: string) => <span className="capitalize">{v || '—'}</span> },
    { key: 'event', label: 'Event' },
    { key: 'severity', label: 'Severity', render: (v: string) => {
      const colors: Record<string, string> = { info: 'text-green-400', warn: 'text-amber-400', error: 'text-red-400' }
      return <span className={`font-medium ${colors[v] || 'text-text-secondary'}`}>{v || '—'}</span>
    }},
    { key: 'detail', label: 'Detail', render: (v: string) => v || '—' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-surface-light border border-stroke rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 w-48"
        />
        <button onClick={exportJSON} className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-light hover:bg-white/10 px-3 py-2 rounded-lg transition-all">
          <Download className="h-3.5 w-3.5" /> Export JSON
        </button>
        <span className="text-xs text-muted">
          {filtered.length} of {data.logs?.length || 0} entries
        </span>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <DataTable columns={columns} data={filtered} />
      </div>
    </div>
  )
}
