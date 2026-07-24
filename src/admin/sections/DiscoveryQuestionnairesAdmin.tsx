import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileQuestion, Search, Download, Eye, X, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { getAdminStore, saveAdminStore, syncFromCloud, moveToRecycleBin, formatIST, type AdminDiscoveryQuestionnaire } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function DiscoveryQuestionnairesAdmin() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedDq, setSelectedDq] = useState<AdminDiscoveryQuestionnaire | null>(null)

  useEffect(() => {
    setStore(getAdminStore())
    const timer = setInterval(() => {
      syncFromCloud().then((updated) => setStore(updated))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const items = store.discoveryQuestionnaires || []

  const handleDownloadSectionPDF = () => {
    const headers = ['Client Name', 'Company', 'Email', 'Budget', 'Urgency', 'Launch Date', 'Status']
    const rows = items.map((d) => [
      d.fullName,
      d.company || '—',
      d.email,
      d.budget || 'Custom',
      d.urgency || 'Normal',
      d.preferredLaunchDate || 'Flexible',
      d.status,
    ])
    exportSectionReportPDF('Discovery Questionnaires Audit Report', 'AROM Studio Client Scope Requirements & Discovery Briefs', headers, rows, 'Discovery_Questionnaires_Report')
  }

  const handleDownloadDqPdf = (dq: AdminDiscoveryQuestionnaire) => {
    if (dq.pdfDataUrl) {
      const a = document.createElement('a')
      a.href = dq.pdfDataUrl
      a.download = `Discovery_Questionnaire_${(dq.fullName || 'Client').replace(/\s+/g, '_')}_${dq.createdAt.slice(0, 10)}.pdf`
      a.click()
    } else {
      // Fallback export report PDF for this questionnaire
      const headers = ['Field', 'Details']
      const rows = [
        ['Client Name', dq.fullName],
        ['Company Name', dq.company || '—'],
        ['Email Address', dq.email],
        ['Phone Number', dq.phone || '—'],
        ['Current Website', dq.website || '—'],
        ['Project Budget', dq.budget || 'Custom'],
        ['Urgency Level', dq.urgency || 'Normal'],
        ['Target Launch Date', dq.preferredLaunchDate || 'Flexible'],
        ['Content Provider', dq.contentProvider || 'Client'],
        ['Submission Date (IST)', formatIST(dq.createdAt)],
      ]
      exportSectionReportPDF(`Discovery Questionnaire — ${dq.fullName}`, `Submitted by ${dq.company || dq.fullName}`, headers, rows, `Questionnaire_${dq.fullName.replace(/\s+/g, '_')}`)
    }
  }

  const handleDeleteDq = (id: string) => {
    const item = items.find((x) => x.id === id)
    moveToRecycleBin('discoveryQuestionnaires', id, item?.fullName || 'Discovery Questionnaire', item?.company)
    setStore(getAdminStore())
    if (selectedDq?.id === id) setSelectedDq(null)
  }

  const handleStatusChange = (id: string, nextStatus: AdminDiscoveryQuestionnaire['status']) => {
    const updated = items.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    const updatedStore = { ...store, discoveryQuestionnaires: updated }
    saveAdminStore(updatedStore)
    setStore(updatedStore)
    if (selectedDq?.id === id) setSelectedDq({ ...selectedDq, status: nextStatus })
  }

  const filteredItems = items.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (d.company || '').toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const total = items.length
  const newCount = items.filter((d) => d.status === 'New').length
  const reviewedCount = items.filter((d) => d.status === 'Reviewed').length
  const highUrgency = items.filter((d) => d.urgency === 'High').length

  const columns = [
    {
      key: 'fullName',
      label: 'Client Name & Company',
      render: (v: string, row: AdminDiscoveryQuestionnaire) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.company || 'Personal / Startup'}</div>
          <div className="text-[10px] text-white/40">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'budget',
      label: 'Budget & Urgency',
      render: (v: string, row: AdminDiscoveryQuestionnaire) => (
        <div>
          <div className="text-emerald-400 font-semibold text-xs">{v || 'Custom'}</div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${row.urgency === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white/70'}`}>
            {row.urgency || 'Normal'} Urgency
          </span>
        </div>
      ),
    },
    {
      key: 'preferredLaunchDate',
      label: 'Target Launch',
      render: (v: string) => <span className="text-white/80 text-xs font-mono">{v || 'Flexible'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Submitted (IST)',
      render: (v: string) => <span className="text-white/60 text-xs font-mono">{formatIST(v)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Reviewed' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          v === 'Proposal Sent' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
          v === 'New' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
          'bg-white/10 border-white/20 text-white/50'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminDiscoveryQuestionnaire) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDq(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
            title="View Questionnaire Brief"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDownloadDqPdf(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download Questionnaire PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteDq(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Record"
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
            <FileQuestion className="h-5 w-5 text-accent" /> Discovery Questionnaires
          </h2>
          <p className="text-xs text-white/50">Client project requirements, budgets, timeline targets & discovery PDF briefs</p>
        </div>
        <button
          onClick={handleDownloadSectionPDF}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" /> Download Questionnaires PDF
        </button>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Questionnaires" value={total} icon={<FileQuestion className="h-4 w-4 text-accent" />} />
        <StatCard label="New Submissions" value={newCount} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Reviewed & Verified" value={reviewedCount} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="High Urgency" value={highUrgency} icon={<FileQuestion className="h-4 w-4 text-red-400" />} />
      </div>

      {/* Search & Filter */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search client name, company, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['All', 'New', 'Reviewed', 'Proposal Sent', 'Archived'].map((st) => (
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

        <DataTable columns={columns} data={filteredItems} />
      </div>

      {/* View Detail & PDF Modal */}
      {selectedDq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedDq(null)}>
          <div className="glass rounded-[24px] p-6 max-w-3xl w-full h-[85vh] flex flex-col border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-heading text-white text-base">Discovery Questionnaire — {selectedDq.fullName}</h3>
                <p className="text-xs text-white/50">{selectedDq.company || 'Personal Project'} • Submitted {formatIST(selectedDq.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDqPdf(selectedDq)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-accent text-black text-xs font-semibold rounded-xl hover:bg-accent/90 shadow-lg"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button onClick={() => setSelectedDq(null)} className="p-1.5 text-white/50 hover:text-white rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-body text-xs text-white/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <div><span className="text-white/40 block">Email:</span> <span className="text-white font-medium">{selectedDq.email}</span></div>
                <div><span className="text-white/40 block">Phone:</span> <span className="text-white font-medium">{selectedDq.phone || '—'}</span></div>
                <div><span className="text-white/40 block">Website:</span> <span className="text-accent font-medium">{selectedDq.website || '—'}</span></div>
                <div><span className="text-white/40 block">Budget:</span> <span className="text-emerald-400 font-semibold">{selectedDq.budget || 'Custom'}</span></div>
                <div><span className="text-white/40 block">Urgency:</span> <span className="text-white font-medium">{selectedDq.urgency || 'Normal'}</span></div>
                <div><span className="text-white/40 block">Target Launch:</span> <span className="text-white font-medium">{selectedDq.preferredLaunchDate || 'Flexible'}</span></div>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-white/60">Update Status:</span>
                <div className="flex gap-2">
                  {(['New', 'Reviewed', 'Proposal Sent', 'Archived'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedDq.id, st)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedDq.status === st ? 'bg-accent text-black font-semibold' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDq.pdfDataUrl ? (
                <div className="h-96 rounded-xl overflow-hidden border border-white/10">
                  <iframe src={selectedDq.pdfDataUrl} className="w-full h-full bg-white" title="Discovery Questionnaire PDF Preview" />
                </div>
              ) : (
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center space-y-2">
                  <FileQuestion className="h-10 w-10 text-accent mx-auto" />
                  <p className="text-white font-medium">Questionnaire Document Generated</p>
                  <p className="text-white/50 text-[11px]">Click "Download PDF" above to export the complete Discovery Brief formatted document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
