import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileSpreadsheet, Search, Plus, Download, Copy, CheckCircle2, Eye, Clock, FileText, X, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, type AdminProposal } from '../adminStore'

export function ProposalManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<AdminProposal | null>(null)

  // Form State
  const [form, setForm] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    amount: 12000,
    scopeSummary: 'Full custom design, React development, real-time analytics & ongoing support.',
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const proposals = store.proposals || []

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.proposalNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalProposals = proposals.length
  const acceptedProposals = proposals.filter((p) => p.status === 'Accepted').length
  const pendingProposals = proposals.filter((p) => p.status === 'Sent' || p.status === 'Viewed').length
  const totalValue = proposals.reduce((acc, p) => acc + (p.amount || 0), 0)

  const handleDeleteProposal = (id: string) => {
    if (confirm('Delete this proposal?')) {
      const updated = { ...store, proposals: store.proposals.filter((p) => p.id !== id) }
      saveAdminStore(updated)
      setStore(updated)
      if (selectedProposal?.id === id) setSelectedProposal(null)
    }
  }

  const handleGenerateProposal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.clientName) return

    const num = `PROP-2026-${(proposals.length + 1).toString().padStart(3, '0')}`
    const newProp: AdminProposal = {
      id: 'prop_' + Math.random().toString(36).slice(2, 9),
      proposalNumber: num,
      title: form.title,
      clientName: form.clientName,
      clientEmail: form.clientEmail || 'client@example.com',
      amount: Number(form.amount) || 5000,
      status: 'Sent',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      scopeSummary: form.scopeSummary,
    }

    const updated = { ...store, proposals: [newProp, ...store.proposals] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const handleDuplicateProposal = (prop: AdminProposal) => {
    const num = `PROP-2026-${(proposals.length + 1).toString().padStart(3, '0')}`
    const dup: AdminProposal = {
      ...prop,
      id: 'prop_' + Math.random().toString(36).slice(2, 9),
      proposalNumber: num,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    }
    const updated = { ...store, proposals: [dup, ...store.proposals] }
    saveAdminStore(updated)
    setStore(updated)
  }

  const columns = [
    {
      key: 'proposalNumber',
      label: 'Proposal # & Title',
      render: (v: string, row: AdminProposal) => (
        <div>
          <span className="text-accent font-mono font-bold text-xs">{v}</span>
          <div className="text-white font-medium text-xs mt-0.5">{row.title}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client Details',
      render: (v: string, row: AdminProposal) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[10px] text-white/50 font-mono">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Value ($)',
      render: (v: number) => (
        <span className="text-emerald-400 font-bold text-xs font-mono">
          ${(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      render: (v: string) => (
        <span className="text-white/70 text-xs font-mono">{v || '30 days'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Accepted' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          v === 'Viewed' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
          v === 'Sent' ? 'bg-accent/20 border-accent/40 text-accent' :
          v === 'Rejected' ? 'bg-red-500/20 border-red-500/40 text-red-400' :
          'bg-white/5 border-white/10 text-white/40'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminProposal) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedProposal(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
            title="Preview Scope Summary"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDuplicateProposal(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 text-white/60 transition-colors cursor-pointer"
            title="Duplicate Proposal"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => alert(`Downloading Proposal ${row.proposalNumber} PDF...`)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteProposal(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Proposal"
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
            <FileSpreadsheet className="h-5 w-5 text-accent" /> Proposal Manager
          </h2>
          <p className="text-xs text-white/50">Draft, send, track client views, duplicate and generate proposal documents</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Generate New Proposal
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Proposals" value={totalProposals} icon={<FileSpreadsheet className="h-4 w-4 text-accent" />} />
        <StatCard label="Accepted Proposals" value={acceptedProposals} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Pending Decision" value={pendingProposals} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Pipeline Value" value={`$${totalValue.toLocaleString()}`} icon={<FileText className="h-4 w-4 text-emerald-400" />} />
      </div>

      {/* Filters & Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search proposal #, client name, or project title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected'].map((st) => (
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

        <DataTable columns={columns} data={filteredProposals} />
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Generate New Proposal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateProposal} className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-medium">Proposal Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. E-Commerce Redesign & Custom CMS"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Client Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Acme Global"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Client Email</label>
                  <input
                    type="email"
                    placeholder="client@acme.com"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Estimated Amount ($)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Scope Summary</label>
                <textarea
                  rows={3}
                  value={form.scopeSummary}
                  onChange={(e) => setForm({ ...form, scopeSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Generate & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scope Preview Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">{selectedProposal.proposalNumber}</h3>
                <p className="text-xs text-accent">{selectedProposal.title}</p>
              </div>
              <button onClick={() => setSelectedProposal(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-white/50 uppercase tracking-wider font-semibold block">Scope Summary</span>
              <p className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-white/80 leading-relaxed font-body">
                {selectedProposal.scopeSummary}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedProposal(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium cursor-pointer">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
