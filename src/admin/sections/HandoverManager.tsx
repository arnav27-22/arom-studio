import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { PackageCheck, Search, Download, ExternalLink, Key, Globe, Server, CheckCircle2, Clock, Plus, X, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, type AdminHandover } from '../adminStore'

export function HandoverManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedHandover, setSelectedHandover] = useState<AdminHandover | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDeleteHandover = (id: string) => {
    if (confirm('Delete this handover record?')) {
      const updated = { ...store, handovers: store.handovers.filter((h) => h.id !== id) }
      saveAdminStore(updated)
      setStore(updated)
      if (selectedHandover?.id === id) setSelectedHandover(null)
    }
  }

  const [form, setForm] = useState({
    projectName: '',
    clientName: '',
    domain: '',
    hosting: 'Vercel Enterprise',
    githubLink: 'https://github.com/arom-studio/',
    adminLoginUrl: 'https://clientdomain.com/admin',
    adminUsername: 'admin@clientdomain.com',
    warrantyPeriodMonths: 12,
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const handovers = store.handovers || []

  const filteredHandovers = handovers.filter((h) => {
    const matchesSearch =
      h.projectName.toLowerCase().includes(search.toLowerCase()) ||
      h.clientName.toLowerCase().includes(search.toLowerCase()) ||
      h.domain.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || h.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const total = handovers.length
  const delivered = handovers.filter((h) => h.status === 'Delivered').length
  const ready = handovers.filter((h) => h.status === 'Ready').length

  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectName) return

    const newHnd: AdminHandover = {
      id: 'hnd_' + Math.random().toString(36).slice(2, 9),
      projectName: form.projectName,
      clientName: form.clientName || 'Apex Innovations',
      status: 'Ready',
      downloadZipUrl: '#',
      githubLink: form.githubLink,
      adminLoginUrl: form.adminLoginUrl,
      adminUsername: form.adminUsername,
      domain: form.domain || 'clientdomain.com',
      hosting: form.hosting,
      warrantyPeriodMonths: form.warrantyPeriodMonths,
      supportExpiryDate: new Date(Date.now() + form.warrantyPeriodMonths * 30 * 86400000).toISOString().slice(0, 10),
      handoverDate: new Date().toISOString().slice(0, 10),
    }

    const updated = { ...store, handovers: [newHnd, ...store.handovers] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const columns = [
    {
      key: 'projectName',
      label: 'Handover Package & Client',
      render: (v: string, row: AdminHandover) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.clientName}</div>
        </div>
      ),
    },
    {
      key: 'domain',
      label: 'Domain & Hosting',
      render: (v: string, row: AdminHandover) => (
        <div>
          <div className="flex items-center gap-1 text-xs text-white/90 font-mono">
            <Globe className="h-3 w-3 text-accent" /> {v}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/40 mt-0.5">
            <Server className="h-3 w-3" /> {row.hosting}
          </div>
        </div>
      ),
    },
    {
      key: 'githubLink',
      label: 'Source Repository',
      render: (v?: string) => (
        v ? (
          <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-white/80 hover:text-accent flex items-center gap-1 underline font-mono">
            <ExternalLink className="h-3.5 w-3.5 text-accent" /> GitHub Repo
          </a>
        ) : <span className="text-white/40 text-xs">Private</span>
      ),
    },
    {
      key: 'supportExpiryDate',
      label: 'Warranty Support Expiry',
      render: (v: string, row: AdminHandover) => (
        <div>
          <div className="text-emerald-400 font-bold text-xs font-mono">{v}</div>
          <div className="text-[10px] text-white/40">{row.warrantyPeriodMonths} Month Warranty</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Delivered' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          'bg-accent/20 border-accent/40 text-accent'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminHandover) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedHandover(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="View Credentials & Links"
          >
            <Key className="h-3.5 w-3.5" /> Credentials
          </button>
          <button
            onClick={() => alert(`Downloading Complete Source ZIP Bundle for ${row.projectName}...`)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download Handover ZIP"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteHandover(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Handover Record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-accent" /> Handover Manager
          </h2>
          <p className="text-xs text-white/50">Manage source code ZIP downloads, GitHub links, admin credentials, DNS domain configs & warranty support</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Handover Package
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Handovers" value={total} icon={<PackageCheck className="h-4 w-4 text-accent" />} />
        <StatCard label="Delivered Packages" value={delivered} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Ready for Handover" value={ready} icon={<Clock className="h-4 w-4 text-accent" />} />
      </div>

      {/* Table & Filters */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search project name, client, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Ready', 'Delivered'].map((st) => (
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

        <DataTable columns={columns} data={filteredHandovers} />
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Create Handover Package</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHandover} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Project Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="LuxeLiving Showcase"
                    value={form.projectName}
                    onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Client Name</label>
                  <input
                    type="text"
                    placeholder="LuxeLiving Studio"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Domain Name</label>
                  <input
                    type="text"
                    placeholder="luxeliving.co.in"
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Hosting Provider</label>
                  <input
                    type="text"
                    value={form.hosting}
                    onChange={(e) => setForm({ ...form, hosting: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">GitHub Repository Link</label>
                <input
                  type="text"
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Admin Login URL</label>
                  <input
                    type="text"
                    value={form.adminLoginUrl}
                    onChange={(e) => setForm({ ...form, adminLoginUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Admin Username</label>
                  <input
                    type="text"
                    value={form.adminUsername}
                    onChange={(e) => setForm({ ...form, adminUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Drawer */}
      {selectedHandover && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">{selectedHandover.projectName}</h3>
                <p className="text-xs text-accent">Admin Access Credentials & Hosting Details</p>
              </div>
              <button onClick={() => setSelectedHandover(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 block mb-0.5">Admin Login Portal</span>
                <a href={selectedHandover.adminLoginUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline font-mono">
                  {selectedHandover.adminLoginUrl}
                </a>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 block mb-0.5">Admin Username</span>
                <span className="text-white font-mono">{selectedHandover.adminUsername}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 block mb-0.5">Hosting Provider</span>
                <span className="text-white font-medium">{selectedHandover.hosting}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedHandover(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium cursor-pointer">
                Close Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
