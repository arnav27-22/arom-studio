import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { CheckSquare, Search, ExternalLink, MessageSquare, CheckCircle2, Clock, AlertTriangle, Plus, X, Send, Trash2, Download } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, formatIST, type AdminDesignApproval } from '../adminStore'
import { generateAdminReportPDF } from '../../lib/professionalPDF'

export function DesignApproval() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedApproval, setSelectedApproval] = useState<AdminDesignApproval | null>(null)
  const [newComment, setNewComment] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const [form, setForm] = useState({
    projectName: '',
    clientName: '',
    previewUrl: 'https://figma.com/@arom-studio',
    version: 'v1.0',
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const approvals = store.approvals || []

  const handleDeleteApproval = (id: string) => {
    const a = approvals.find((x) => x.id === id)
    moveToRecycleBin('approvals', id, a?.projectName || 'Design Approval', a?.clientName)
    setStore(getAdminStore())
    if (selectedApproval?.id === id) setSelectedApproval(null)
  }

  const filteredApprovals = approvals.filter((a) => {
    const matchesSearch =
      a.projectName.toLowerCase().includes(search.toLowerCase()) ||
      a.clientName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const total = approvals.length
  const approved = approvals.filter((a) => a.status === 'Approved').length
  const waiting = approvals.filter((a) => a.status === 'Waiting Approval').length
  const needsRevision = approvals.filter((a) => a.status === 'Needs Revision').length

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment || !selectedApproval) return

    const updatedApprovals = approvals.map((app) => {
      if (app.id === selectedApproval.id) {
        return {
          ...app,
          comments: [
            ...app.comments,
            { author: 'Admin (Arnav)', text: newComment, createdAt: new Date().toISOString() },
          ],
        }
      }
      return app
    })

    const updated = { ...store, approvals: updatedApprovals }
    saveAdminStore(updated)
    setStore(updated)
    setSelectedApproval(updatedApprovals.find((a) => a.id === selectedApproval.id) || null)
    setNewComment('')
  }

  const handleToggleStatus = (id: string, nextStatus: 'Approved' | 'Needs Revision' | 'Waiting Approval') => {
    const updatedApprovals = approvals.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status: nextStatus,
          approvalDate: nextStatus === 'Approved' ? new Date().toISOString() : app.approvalDate,
        }
      }
      return app
    })
    const updated = { ...store, approvals: updatedApprovals }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectName) return

    const newApp: AdminDesignApproval = {
      id: 'app_' + Math.random().toString(36).slice(2, 9),
      projectName: form.projectName,
      clientName: form.clientName || 'Apex Innovations',
      status: 'Waiting Approval',
      previewUrl: form.previewUrl,
      version: form.version,
      comments: [
        { author: 'Om (Lead Designer)', text: 'Initial design prototype ready for client sign-off.', createdAt: new Date().toISOString() },
      ],
    }

    const updated = { ...store, approvals: [newApp, ...store.approvals] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const columns = [
    {
      key: 'projectName',
      label: 'Design Prototype & Client',
      render: (v: string, row: AdminDesignApproval) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.clientName}</div>
        </div>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (v: string) => (
        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white/80">
          {v}
        </span>
      ),
    },
    {
      key: 'previewUrl',
      label: 'Figma / Prototype Link',
      render: (v: string) => (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-white/80 hover:text-accent flex items-center gap-1 underline font-mono">
          <ExternalLink className="h-3.5 w-3.5 text-accent" /> Live Preview
        </a>
      ),
    },
    {
      key: 'approvalDate',
      label: 'Approval Date',
      render: (v?: string) => (
        <span className="text-xs font-mono text-white/70">{v ? formatIST(v) : 'Pending Sign-off'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
            v === 'Approved' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
            v === 'Needs Revision' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
            'bg-purple-500/20 border-purple-500/40 text-purple-300'
          }`}>
            {v}
          </span>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminDesignApproval) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedApproval(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="View Comments & Feedback"
          >
            <MessageSquare className="h-3.5 w-3.5" /> ({row.comments?.length || 0})
          </button>
          {row.status !== 'Approved' && (
            <button
              onClick={() => handleToggleStatus(row.id, 'Approved')}
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer text-[10px] font-semibold"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => handleDeleteApproval(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Design Approval"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const handleExportApprovalsPDF = () => {
    generateAdminReportPDF({
      sectionTitle: 'UI/UX Design Sign-Off & Approvals Audit',
      subtitle: `${total} Prototypes Submitted | ${approved} Signed-off Approved`,
      headers: ['Project Name', 'Client Name', 'Version', 'Status', 'Approved Date'],
      rows: approvals.map((a) => [a.projectName, a.clientName, a.version, a.status, a.approvalDate ? formatIST(a.approvalDate) : 'Pending']),
      summaryLines: [
        `Total Design System Prototypes: ${total}`,
        `Approved & Signed Off: ${approved}`,
        `Revision Requested: ${needsRevision}`,
      ],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-accent" /> Design Approval Manager
          </h2>
          <p className="text-xs text-white/50">Figma design system prototypes, client feedback threads, revision requests &amp; approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportApprovalsPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Download className="h-4 w-4 text-accent" /> Export PDF Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Submit Design Prototype
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Submissions" value={total} icon={<CheckSquare className="h-4 w-4 text-accent" />} />
        <StatCard label="Approved Designs" value={approved} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Waiting Approval" value={waiting} icon={<Clock className="h-4 w-4 text-purple-300" />} />
        <StatCard label="Needs Revision" value={needsRevision} icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} />
      </div>

      {/* Table & Filters */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search prototype name or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Waiting Approval', 'Approved', 'Needs Revision'].map((st) => (
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

        <DataTable columns={columns} data={filteredApprovals} />
      </div>

      {/* Submit Prototype Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Submit Design Prototype</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApproval} className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-medium">Prototype / Feature Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Dark Mode Landing Page v2"
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

              <div>
                <label className="text-white/60 block mb-1 font-medium">Figma / Prototype Link</label>
                <input
                  type="text"
                  value={form.previewUrl}
                  onChange={(e) => setForm({ ...form, previewUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Version Tag</label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">{selectedApproval.projectName}</h3>
                <p className="text-xs text-accent">Client Feedback & Comment Thread</p>
              </div>
              <button onClick={() => setSelectedApproval(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {selectedApproval.comments?.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-accent">{c.author}</span>
                    <span className="text-[10px] font-mono text-white/40">{formatIST(c.createdAt)}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed font-body">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add feedback comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-accent text-black font-bold text-xs shadow flex items-center gap-1 cursor-pointer">
                <Send className="h-3.5 w-3.5" /> Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
