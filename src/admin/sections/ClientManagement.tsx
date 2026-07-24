import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { UserCheck, Search, Plus, ExternalLink, Mail, Phone, DollarSign, Briefcase, Eye, Trash2, X, Clock, Download } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, formatIST, type AdminClient } from '../adminStore'
import { generateAdminReportPDF } from '../../lib/professionalPDF'

export function ClientManagement() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // New Client Form
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    status: 'Active' as const,
    notes: '',
    revenue: 0,
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const clients = store.clients || []

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === 'Active').length
  const onboardingClients = clients.filter((c) => c.status === 'Onboarding').length
  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName || !form.email) return

    const newClient: AdminClient = {
      id: 'cli_' + Math.random().toString(36).slice(2, 9),
      companyName: form.companyName,
      contactPerson: form.contactPerson || 'Primary Contact',
      email: form.email,
      phone: form.phone || 'N/A',
      website: form.website || 'https://',
      activeProjectsCount: 1,
      status: form.status,
      totalRevenue: Number(form.revenue) || 0,
      notes: form.notes || 'Client added from admin dashboard.',
      createdAt: new Date().toISOString(),
      timeline: [
        { date: new Date().toISOString().slice(0, 10), event: 'Client Account Created' },
      ],
    }

    const updated = { ...store, clients: [newClient, ...store.clients] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
    setForm({ companyName: '', contactPerson: '', email: '', phone: '', website: '', status: 'Active', notes: '', revenue: 0 })
  }

  const handleDeleteClient = (id: string) => {
    const c = store.clients.find((x) => x.id === id)
    moveToRecycleBin('clients', id, c?.companyName, c?.email)
    setStore(getAdminStore())
    if (selectedClient?.id === id) setSelectedClient(null)
  }

  const columns = [
    {
      key: 'companyName',
      label: 'Company & Contact',
      render: (v: string, row: AdminClient) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.contactPerson}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (v: string, row: AdminClient) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <Mail className="h-3 w-3 text-accent" /> {v}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono">
            <Phone className="h-3 w-3" /> {row.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'website',
      label: 'Website',
      render: (v: string) => (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-white/70 hover:text-accent flex items-center gap-1 underline font-mono">
          {v.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      key: 'activeProjectsCount',
      label: 'Active Projects',
      render: (v: number) => (
        <span className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-bold text-xs font-mono">
          {v} Active
        </span>
      ),
    },
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      render: (v: number) => (
        <span className="text-emerald-400 font-bold text-xs font-mono">
          ₹{(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          v === 'Onboarding' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
          v === 'Completed' ? 'bg-accent/10 border-accent/30 text-accent' :
          'bg-white/5 border-white/10 text-white/40'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminClient) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedClient(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
            title="View Profile & Timeline"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteClient(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Client"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-accent" /> Client Account Management
          </h2>
          <p className="text-xs text-white/50">Manage accounts, active projects, revenue history & client timelines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Download className="h-4 w-4 text-accent" /> Export PDF Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add New Client
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={totalClients} icon={<UserCheck className="h-4 w-4 text-accent" />} />
        <StatCard label="Active Retainers" value={activeClients} icon={<Briefcase className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="In Onboarding" value={onboardingClients} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-emerald-400" />} />
      </div>

      {/* Filter & Search Bar */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search company, contact person, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Active', 'Onboarding', 'Completed', 'Inactive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={filteredClients} />
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Add New Client Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Company Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="john@acme.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Website</label>
                  <input
                    type="text"
                    placeholder="https://acme.com"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Completed">Completed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Revenue Generated ($)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={form.revenue}
                  onChange={(e) => setForm({ ...form, revenue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Notes & Brief</label>
                <textarea
                  rows={3}
                  placeholder="Key project goals, preferences..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Client Profile Drawer/Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">{selectedClient.companyName}</h3>
                <p className="text-xs text-accent">Contact: {selectedClient.contactPerson}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/40 block">Email</span>
                <span className="text-white font-mono">{selectedClient.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/40 block">Phone</span>
                <span className="text-white font-mono">{selectedClient.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/40 block">Total Revenue</span>
                <span className="text-emerald-400 font-bold font-mono">${selectedClient.totalRevenue?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/40 block">Created On</span>
                <span className="text-white font-mono">{formatIST(selectedClient.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">Client Notes</h4>
              <p className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed font-body">
                {selectedClient.notes || 'No custom notes provided for this client.'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" /> Client Activity Timeline
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedClient.timeline?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-white/90">{item.event}</span>
                    <span className="text-[10px] font-mono text-accent">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedClient(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
