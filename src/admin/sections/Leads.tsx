import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Mail, CheckCircle2, Archive, Eye, Download, Plus, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, formatIST, type AdminLead } from '../adminStore'
import { generateAdminReportPDF } from '../../lib/professionalPDF'

export function Leads() {
  const [store, setStore] = useState(getAdminStore())
  const [full, setFull] = useState<AdminLead | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Add lead form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('Custom Business Website')
  const [message, setMessage] = useState('')

  const reload = () => setStore(getAdminStore())

  useEffect(() => {
    reload()
  }, [])

  const leads = store.leads || []
  const newLeads = leads.filter((l) => l.status === 'New').length
  const contactedLeads = leads.filter((l) => l.status === 'Contacted').length
  const closedLeads = leads.filter((l) => l.status === 'Closed').length

  const handleExportLeadsPDF = () => {
    generateAdminReportPDF({
      sectionTitle: 'Contact Form Leads & Inquiries Report',
      subtitle: `${leads.length} Inquiries Received | New: ${newLeads} | Contacted: ${contactedLeads}`,
      headers: ['Received (IST)', 'Lead Name', 'Email', 'Phone', 'Service Interested', 'Status'],
      rows: leads.map((l) => [formatIST(l.createdAt), l.name, l.email, l.phone || '—', l.service || 'Website Build', l.status]),
      summaryLines: [
        `Total Contact Inquiries: ${leads.length}`,
        `New Unread Leads: ${newLeads}`,
        `In Progress / Contacted Leads: ${contactedLeads}`,
        `Closed & Converted Leads: ${closedLeads}`,
      ],
    })
  }

  const updateStatus = (id: string, status: AdminLead['status']) => {
    const s = getAdminStore()
    s.leads = s.leads.map((l) => (l.id === id ? { ...l, status } : l))
    saveAdminStore(s)
    reload()
  }

  const handleDeleteLead = (id: string) => {
    if (confirm('Delete lead inquiry?')) {
      const s = getAdminStore()
      s.leads = s.leads.filter((l) => l.id !== id)
      saveAdminStore(s)
      reload()
    }
  }

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    const s = getAdminStore()
    const newLead: AdminLead = {
      id: 'l_' + Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      name,
      email,
      phone,
      service,
      message,
      status: 'New',
      country: 'India',
    }
    s.leads.unshift(newLead)
    saveAdminStore(s)
    reload()
    setShowAddModal(false)
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
  }

  const exportCSV = () => {
    const leads = store.leads || []
    const headers = ['Date (IST)', 'Name', 'Email', 'Phone', 'Service', 'Status']
    const rows = leads.map((l) => [formatIST(l.createdAt), l.name || '', l.email || '', l.phone || '', l.service || '', l.status || 'New'])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const leads = store.leads || []

  const columns = [
    { key: 'createdAt', label: 'Date (IST)', render: (v: string) => formatIST(v) },
    { key: 'name', label: 'Lead Name', render: (v: string) => <span className="text-white font-medium">{v}</span> },
    { key: 'email', label: 'Email', render: (v: string, row: any) => (
      <div>
        <p className="text-white/90">{v}</p>
        {row.phone && <p className="text-white/40 text-[10px]">{row.phone}</p>}
      </div>
    ) },
    { key: 'service', label: 'Service Interested', render: (v: string) => <span className="text-accent">{v || 'General'}</span> },
    {
      key: 'status', label: 'Status', render: (v: string) => (
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium uppercase ${
          v === 'Responded' ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' :
          v === 'Archived' ? 'bg-white/10 text-white/50' :
          v === 'Viewed' ? 'bg-blue-400/10 border border-blue-400/20 text-blue-400' :
          'bg-amber-400/10 border border-amber-400/20 text-amber-400'
        }`}>{v || 'New'}</span>
      ),
    },
    {
      key: 'actions', label: 'Actions', render: (_: any, row: AdminLead) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => setFull(row)} className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="View details">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => updateStatus(row.id, 'Responded')} className="p-1.5 text-white/60 hover:text-emerald-400 bg-white/5 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Mark Responded">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => updateStatus(row.id, 'Archived')} className="p-1.5 text-white/60 hover:text-amber-400 bg-white/5 hover:bg-amber-400/10 rounded-lg transition-colors" title="Archive">
            <Archive className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleDeleteLead(row.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-400/10 rounded-lg transition-colors" title="Delete Lead">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
          <StatCard label="Total Inquiries" value={leads.length} icon={<Mail className="h-4 w-4 text-accent" />} />
          <StatCard label="New Pending" value={leads.filter(l => !l.status || l.status === 'New').length} icon={<Mail className="h-4 w-4 text-amber-400" />} />
          <StatCard label="Responded" value={leads.filter(l => l.status === 'Responded').length} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleExportLeadsPDF} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">
            <Download className="h-4 w-4 text-accent" /> Export PDF Report
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Lead
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">All Form Inquiries (IST)</h3>
        <DataTable columns={columns} data={leads} />
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)}>
          <div className="glass rounded-[24px] p-6 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-heading text-white mb-4 pb-2 border-b border-white/10">Add New Lead</h3>
            <form onSubmit={handleAddLead} className="space-y-3 text-xs font-body">
              <div>
                <label className="text-white/60 block mb-1">Full Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Email Address *</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ramesh@company.com" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Service Requested</label>
                <select value={service} onChange={(e) => setService(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white bg-bg">
                  <option value="Custom Business Website">Custom Business Website</option>
                  <option value="E-commerce Website">E-commerce Website</option>
                  <option value="SaaS Platform">SaaS Platform</option>
                  <option value="UI/UX Redesign">UI/UX Redesign</option>
                  <option value="SEO & Performance">SEO &amp; Performance</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 block mb-1">Project Message</label>
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Project description..." className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white resize-none" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-2 text-white/50 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-xl font-medium">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setFull(null)}>
          <div className="glass rounded-[24px] p-6 max-w-lg w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-heading text-white mb-4 pb-2 border-b border-white/10">Inquiry Details</h3>
            <div className="space-y-3 text-xs font-body text-white/80">
              <div><span className="text-white/40">Name:</span> <span className="text-white font-medium ml-2">{full.name}</span></div>
              <div><span className="text-white/40">Email:</span> <span className="text-white font-medium ml-2">{full.email}</span></div>
              {full.phone && <div><span className="text-white/40">Phone:</span> <span className="text-white font-medium ml-2">{full.phone}</span></div>}
              <div><span className="text-white/40">Service:</span> <span className="text-accent font-medium ml-2">{full.service || '—'}</span></div>
              <div><span className="text-white/40">Date (IST):</span> <span className="text-white font-medium ml-2">{formatIST(full.createdAt)}</span></div>
              <div><span className="text-white/40 block mb-1">Message:</span> <p className="text-white/90 p-3 bg-white/5 rounded-xl border border-white/10 leading-relaxed">{full.message || '—'}</p></div>
            </div>
            <button onClick={() => setFull(null)} className="mt-5 w-full glass-strong text-xs text-white py-2.5 rounded-xl transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
