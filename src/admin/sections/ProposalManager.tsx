import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileSpreadsheet, Search, Plus, Download, Copy, CheckCircle2, Eye, Clock, FileText, X, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, type AdminProposal } from '../adminStore'
import { exportSectionReportPDF, generateProposalPDF } from '../../lib/professionalPDF'

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

  const reload = () => setStore(getAdminStore())

  const handleDownloadProposalsPDF = () => {
    const proposals = store.proposals || []
    const headers = ['Prop Number', 'Proposal Title', 'Client Name', 'Amount', 'Valid Until', 'Status']
    const rows = proposals.map((p) => [
      p.proposalNumber,
      p.title,
      p.clientName,
      `₹${(p.amount || 0).toLocaleString()}`,
      p.validUntil,
      p.status,
    ])
    exportSectionReportPDF('Proposals Pipeline Report', 'AROM Studio Agency Proposal Audit', headers, rows, 'Proposals_Pipeline_Report')
  }

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.clientName) return
    const newProp: AdminProposal = {
      id: 'prop_' + Math.random().toString(36).slice(2, 9),
      proposalNumber: `PROP-2026-${String(store.proposals.length + 1).padStart(3, '0')}`,
      title: form.title,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      amount: Number(form.amount),
      status: 'Sent',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      scopeSummary: form.scopeSummary,
    }
    const updated = { ...store, proposals: [newProp, ...store.proposals] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
    setForm({ title: '', clientName: '', clientEmail: '', amount: 12000, scopeSummary: '' })
  }

  const handleDuplicateProposal = (row: AdminProposal) => {
    const dup: AdminProposal = {
      ...row,
      id: 'prop_' + Math.random().toString(36).slice(2, 9),
      proposalNumber: `PROP-2026-${String(store.proposals.length + 1).padStart(3, '0')}`,
      title: `${row.title} (Copy)`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    }
    const updated = { ...store, proposals: [dup, ...store.proposals] }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleDeleteProposal = (id: string) => {
    const p = store.proposals.find((x) => x.id === id)
    moveToRecycleBin('proposals', id, `${p?.proposalNumber || 'Proposal'} - ${p?.clientName || 'Client'}`, `₹${p?.amount || 0}`)
    reload()
  }

  const proposals = store.proposals || []
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          p.proposalNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalProposals = proposals.length
  const acceptedProposals = proposals.filter((p) => p.status === 'Accepted').length
  const pendingProposals = proposals.filter((p) => p.status === 'Sent' || p.status === 'Draft' || p.status === 'Viewed').length
  const totalValue = proposals.reduce((sum, p) => sum + (p.amount || 0), 0)

  const columns = [
    {
      key: 'proposalNumber',
      label: 'Proposal #',
      render: (v: string) => (
        <span className="font-mono text-xs font-bold text-accent">{v}</span>
      ),
    },
    {
      key: 'title',
      label: 'Proposal Title & Scope',
      render: (v: string, row: AdminProposal) => (
        <div>
          <div className="text-white font-medium text-xs">{v}</div>
          <div className="text-[10px] text-white/40 truncate max-w-xs">{row.scopeSummary}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client Details',
      render: (v: string, row: AdminProposal) => (
        <div>
          <div className="text-white/90 text-xs font-medium">{v}</div>
          <div className="text-[10px] text-white/50 font-mono">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Value (₹)',
      render: (v: number) => (
        <span className="text-emerald-400 font-bold text-xs font-mono">
          ₹{(v || 0).toLocaleString()}
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
            onClick={() => generateProposalPDF({
              projectName: row.title,
              clientName: row.clientName,
              preparedBy: 'AROM Studio',
              date: new Date().toLocaleDateString('en-IN'),
              executiveSummary: row.scopeSummary || 'Full-stack Web Application & Custom Platform Development',
              objectives: ['Deliver a responsive high-performance web interface', 'Integrate secure real-time tracking and database', 'Ensure optimized SEO and fast loading times'],
              scope: ['Custom Design & Development', 'Backend API Integration', 'Deployment & Staging Setup'],
              deliverables: ['Production Ready Codebase', 'Admin Dashboard Access', 'Technical Documentation'],
              milestones: [{ phase: 'Phase 1', description: 'Design & Architecture', timeline: '2 Weeks' }, { phase: 'Phase 2', description: 'Development & Testing', timeline: '3 Weeks' }],
              pricingItems: [{ service: row.title, description: row.scopeSummary, amount: `₹${(row.amount || 0).toLocaleString()}` }],
              totalAmount: `₹${(row.amount || 0).toLocaleString()}`,
              paymentSchedule: ['50% Upfront Advance Payment', '50% Upon Final Deployment & Sign-off'],
              assumptions: ['Client will provide content & brand assets in a timely manner'],
              exclusions: ['Third-party API subscription costs'],
              technologies: ['React', 'TypeScript', 'Node.js', 'TailwindCSS'],
              supportDescription: '30 Days Post-launch Maintenance & Technical Support included.',
            })}
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
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadProposalsPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Proposals PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Generate New Proposal
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Proposals" value={totalProposals} icon={<FileSpreadsheet className="h-4 w-4 text-accent" />} />
        <StatCard label="Accepted Proposals" value={acceptedProposals} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Pending Decision" value={pendingProposals} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Pipeline Value" value={`₹${totalValue.toLocaleString()}`} icon={<FileText className="h-4 w-4 text-emerald-400" />} />
      </div>

      {/* Filters & Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search proposal #, title, client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['All', 'Sent', 'Viewed', 'Accepted', 'Draft', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === st ? 'bg-accent text-black font-semibold' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
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

            <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
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
