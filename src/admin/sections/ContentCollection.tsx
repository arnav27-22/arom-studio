import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FolderKanban, Search, Download, CheckCircle2, Clock, FileText, Eye, X, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, formatIST, type AdminContentItem } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function ContentCollection() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedItem, setSelectedItem] = useState<AdminContentItem | null>(null)

  const handleDownloadContentPDF = () => {
    const contentList = store.content || []
    const headers = ['Client Name', 'Project Title', 'Completion', 'Last Updated', 'Status']
    const rows = contentList.map((c) => [
      c.clientName,
      c.projectName,
      `${c.completionPercentage}%`,
      formatIST(c.updatedAt),
      c.status,
    ])
    exportSectionReportPDF('Content Collection Audit Report', 'AROM Studio Website Content Trackers', headers, rows, 'Content_Collection_Report')
  }



  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const items = store.content || []

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.clientName.toLowerCase().includes(search.toLowerCase()) ||
      i.projectName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const total = items.length
  const submitted = items.filter((i) => i.status === 'Submitted').length
  const pending = items.filter((i) => i.status === 'Pending' || i.status === 'Review').length
  const avgCompletion = items.length ? Math.round(items.reduce((acc, i) => acc + (i.completionPercentage || 0), 0) / items.length) : 0

  const handleToggleChecklist = (contentId: string, sectionIndex: number) => {
    const updatedContent = items.map((c) => {
      if (c.id === contentId) {
        const nextChecklist = [...c.checklist]
        const curr = nextChecklist[sectionIndex].status
        nextChecklist[sectionIndex].status = curr === 'Complete' ? 'Pending' : 'Complete'
        const compCount = nextChecklist.filter((x) => x.status === 'Complete').length
        const nextPct = Math.round((compCount / nextChecklist.length) * 100)
        const nextStatus = nextPct === 100 ? ('Submitted' as const) : ('Pending' as const)
        return { ...c, checklist: nextChecklist, completionPercentage: nextPct, status: nextStatus }
      }
      return c
    })
    const updated = { ...store, content: updatedContent }
    saveAdminStore(updated)
    setStore(updated)
    if (selectedItem?.id === contentId) {
      setSelectedItem(updatedContent.find((x) => x.id === contentId) || null)
    }
  }

  const handleDeleteContent = (id: string) => {
    const item = items.find((x) => x.id === id)
    moveToRecycleBin('content', id, item?.clientName || 'Content Item', item?.projectName)
    setStore(getAdminStore())
    if (selectedItem?.id === id) setSelectedItem(null)
  }

  const columns = [
    {
      key: 'clientName',
      label: 'Client & Project',
      render: (v: string, row: AdminContentItem) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.projectName}</div>
        </div>
      ),
    },
    {
      key: 'completionPercentage',
      label: 'Completion %',
      render: (v: number) => (
        <div className="w-36 space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-white/80">
            <span>Content Received</span>
            <span>{v}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-accent rounded-full" style={{ width: `${v}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Submitted' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          v === 'Review' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
          v === 'Pending' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
          'bg-red-500/20 border-red-500/40 text-red-400'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Update',
      render: (v: string) => (
        <span className="text-white/60 text-xs font-mono">{formatIST(v)}</span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminContentItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedItem(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
            title="View Content Checklist"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => alert(`Exporting Content Collection Summary PDF for ${row.clientName}...`)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download Content Summary PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteContent(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Content Record"
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
            <FolderKanban className="h-5 w-5 text-accent" /> Content Collection Manager
          </h2>
          <p className="text-xs text-white/50">Track client copy submissions, missing branding sections, review status & PDF briefs</p>
        </div>
        <button
          onClick={handleDownloadContentPDF}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" /> Download Content PDF
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Content Projects" value={total} icon={<FolderKanban className="h-4 w-4 text-accent" />} />
        <StatCard label="Fully Submitted" value={submitted} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Pending Items" value={pending} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Avg Completion" value={`${avgCompletion}%`} icon={<FileText className="h-4 w-4 text-accent" />} />
      </div>

      {/* Filters & Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search client or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Submitted', 'Pending', 'Review', 'Missing'].map((st) => (
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

        <DataTable columns={columns} data={filteredItems} />
      </div>

      {/* Checklist View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">{selectedItem.clientName}</h3>
                <p className="text-xs text-accent">Completion: {selectedItem.completionPercentage}%</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">Content Section Checklist</h4>
              <div className="space-y-2">
                {selectedItem.checklist?.map((chk, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist(selectedItem.id, idx)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 cursor-pointer transition-all text-xs"
                  >
                    <span className={`font-medium ${chk.status === 'Complete' ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {chk.section}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      chk.status === 'Complete' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedItem(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
