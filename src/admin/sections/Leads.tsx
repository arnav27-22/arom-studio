import { useState, useEffect, useCallback } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Mail, CheckCircle2, Archive, Eye, Download } from 'lucide-react'

export function Leads() {
  const [data, setData] = useState<any>(null)
  const [full, setFull] = useState<any>(null)

  const load = useCallback(() => {
    fetch('/api/admin/leads', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/leads', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const viewFull = async (id: string) => {
    const r = await fetch(`/api/admin/leads?view=full&id=${id}`, { credentials: 'include' })
    const d = await r.json()
    setFull(d)
  }

  const exportCSV = () => {
    if (!data?.leads) return
    const headers = ['Date', 'Name', 'Email', 'Service', 'Status']
    const rows = data.leads.map((l: any) => [l.createdAt, l.name || '', l.email || '', l.service || '', l.status || 'New'])
    const csv = [headers.join(','), ...rows.map((r: string[]) => r.map((c: string) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'leads.csv'
    a.click()
  }

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  const columns = [
    { key: 'createdAt', label: 'Date', render: (v: string) => new Date(v).toLocaleDateString('en-IN') },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', render: (_v: string) => '***' },
    { key: 'service', label: 'Service', render: (v: string) => v || '—' },
    { key: 'country', label: 'Country', render: (v: string) => v || '—' },
    {
      key: 'status', label: 'Status', render: (v: string, _row: any) => (
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
          v === 'Responded' ? 'bg-green-400/10 text-green-400' :
          v === 'Archived' ? 'bg-text-secondary/10 text-text-secondary' :
          v === 'Viewed' ? 'bg-blue-400/10 text-blue-400' :
          'bg-amber-400/10 text-amber-400'
        }`}>{v || 'New'}</span>
      ),
    },
    {
      key: 'actions', label: '', render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => viewFull(row.id)} className="text-text-secondary hover:text-text-primary transition-colors" title="View">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => updateStatus(row.id, 'Responded')} className="text-text-secondary hover:text-green-400 transition-colors" title="Mark responded">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => updateStatus(row.id, 'Archived')} className="text-text-secondary hover:text-text-primary transition-colors" title="Archive">
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={data.total} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="New" value={data.leads?.filter((l: any) => !l.status || l.status === 'New').length || 0} icon={<Mail className="h-4 w-4" />} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-light hover:bg-white/10 px-3 py-2 rounded-lg transition-all">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {data.byService && (
        <div className="glass rounded-[--radius-card] p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">By Service</h3>
          <div className="space-y-1.5">
            {Object.entries(data.byService).sort(([,a], [,b]) => (b as number) - (a as number)).map(([svc, count]) => (
              <div key={svc} className="flex items-center gap-3 text-xs">
                <span className="text-text-secondary w-40 truncate">{svc}</span>
                <div className="flex-1 h-4 bg-surface-light rounded-full overflow-hidden">
                  <div className="h-full bg-accent/40 rounded-full" style={{ width: `${((count as number) / data.total) * 100}%` }} />
                </div>
                <span className="text-text-secondary w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">All Leads</h3>
        <DataTable columns={columns} data={data.leads || []} />
      </div>

      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setFull(null)}>
          <div className="glass rounded-[--radius-dialog] p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-stroke" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Lead Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-text-secondary">Name:</span> <span className="text-text-secondary ml-2">{full.name}</span></div>
              <div><span className="text-text-secondary">Email:</span> <span className="text-text-secondary ml-2">{full.email}</span></div>
              <div><span className="text-text-secondary">Service:</span> <span className="text-text-secondary ml-2">{full.service || '—'}</span></div>
              <div><span className="text-text-secondary">Date:</span> <span className="text-text-secondary ml-2">{new Date(full.createdAt).toLocaleString()}</span></div>
              <div><span className="text-text-secondary">Message:</span> <p className="text-text-secondary mt-1 text-xs leading-relaxed">{full.message || '—'}</p></div>
            </div>
            <button onClick={() => setFull(null)} className="mt-4 text-xs text-text-secondary hover:text-text-primary transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
