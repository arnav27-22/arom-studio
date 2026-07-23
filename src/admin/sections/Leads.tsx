import { useState, useEffect, useCallback } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Mail, CheckCircle2, Archive, Eye, Download } from 'lucide-react'

const DEFAULT_LEADS = {
  total: 5,
  byService: {
    'Custom Business Website': 2,
    'E-commerce Development': 1,
    'SaaS Platform': 1,
    'UI/UX Design': 1,
  },
  leads: [
    { id: '1', createdAt: new Date().toISOString(), name: 'Rahul Sharma', email: 'rahul@nexusfin.com', service: 'Custom Business Website', country: 'IN', status: 'New', message: 'Looking for a premium website redesign for our financial firm.' },
    { id: '2', createdAt: new Date(Date.now() - 86400000).toISOString(), name: 'Priya Verma', email: 'priya@organics.in', service: 'E-commerce Development', country: 'IN', status: 'Responded', message: 'Need an online store with Razorpay payment integration.' },
    { id: '3', createdAt: new Date(Date.now() - 172800000).toISOString(), name: 'Vikram Joshi', email: 'vikram@buildcraft.com', service: 'SaaS Platform', country: 'IN', status: 'Viewed', message: 'Interested in building a multi-tenant client portal.' },
    { id: '4', createdAt: new Date(Date.now() - 259200000).toISOString(), name: 'Ananya Reddy', email: 'ananya@stellarcuisine.com', service: 'UI/UX Design', country: 'IN', status: 'Responded', message: 'Looking for brand identity and mobile app wireframes.' },
    { id: '5', createdAt: new Date(Date.now() - 345600000).toISOString(), name: 'Neha Gupta', email: 'neha@edusphere.io', service: 'Custom Business Website', country: 'IN', status: 'Archived', message: 'Corporate site inquiry.' },
  ],
}

export function Leads() {
  const [data, setData] = useState<any>(DEFAULT_LEADS)
  const [full, setFull] = useState<any>(null)

  const load = useCallback(() => {
    fetch('/api/admin/leads', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error && d.leads) setData(d)
      })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = (id: string, status: string) => {
    setData((prev: any) => ({
      ...prev,
      leads: prev.leads.map((l: any) => (l.id === id ? { ...l, status } : l)),
    }))
    fetch('/api/admin/leads', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).catch(() => {})
  }

  const viewFull = (id: string) => {
    const found = data.leads.find((l: any) => l.id === id)
    if (found) setFull(found)
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

  const columns = [
    { key: 'createdAt', label: 'Date', render: (v: string) => new Date(v || Date.now()).toLocaleDateString('en-IN') },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'service', label: 'Service', render: (v: string) => v || '—' },
    { key: 'country', label: 'Country', render: (v: string) => v || 'IN' },
    {
      key: 'status', label: 'Status', render: (v: string) => (
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
          v === 'Responded' ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' :
          v === 'Archived' ? 'bg-white/10 text-white/50' :
          v === 'Viewed' ? 'bg-blue-400/10 border border-blue-400/20 text-blue-400' :
          'bg-amber-400/10 border border-amber-400/20 text-amber-400'
        }`}>{v || 'New'}</span>
      ),
    },
    {
      key: 'actions', label: 'Actions', render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => viewFull(row.id)} className="p-1 text-white/50 hover:text-white transition-colors" title="View details">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => updateStatus(row.id, 'Responded')} className="p-1 text-white/50 hover:text-emerald-400 transition-colors" title="Mark responded">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => updateStatus(row.id, 'Archived')} className="p-1 text-white/50 hover:text-amber-400 transition-colors" title="Archive">
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Form Leads" value={data.total} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="New Leads" value={data.leads?.filter((l: any) => !l.status || l.status === 'New').length || 0} icon={<Mail className="h-4 w-4" />} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {data.byService && (
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Leads By Service</h3>
          <div className="space-y-3">
            {Object.entries(data.byService).sort(([,a], [,b]) => (b as number) - (a as number)).map(([svc, count]) => (
              <div key={svc} className="flex items-center gap-3 text-xs">
                <span className="text-white/70 w-44 truncate">{svc}</span>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${((count as number) / (data.total || 1)) * 100}%` }} />
                </div>
                <span className="text-white/80 font-mono w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">All Form Inquiries</h3>
        <DataTable columns={columns} data={data.leads || []} />
      </div>

      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setFull(null)}>
          <div className="glass rounded-[24px] p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-heading text-white mb-4 pb-2 border-b border-white/10">Inquiry Details</h3>
            <div className="space-y-3 text-xs font-body text-white/80">
              <div><span className="text-white/40">Name:</span> <span className="text-white font-medium ml-2">{full.name}</span></div>
              <div><span className="text-white/40">Email:</span> <span className="text-white font-medium ml-2">{full.email}</span></div>
              <div><span className="text-white/40">Service:</span> <span className="text-white font-medium ml-2">{full.service || '—'}</span></div>
              <div><span className="text-white/40">Date:</span> <span className="text-white font-medium ml-2">{new Date(full.createdAt || Date.now()).toLocaleString()}</span></div>
              <div><span className="text-white/40 block mb-1">Message:</span> <p className="text-white/90 p-3 bg-white/5 rounded-xl border border-white/10 leading-relaxed">{full.message || '—'}</p></div>
            </div>
            <button onClick={() => setFull(null)} className="mt-5 w-full glass-strong text-xs text-white py-2.5 rounded-xl transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
