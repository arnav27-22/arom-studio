import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FolderUp, Search, Plus, ExternalLink, Download, CheckCircle2, AlertCircle, Clock, X, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, formatIST, type AdminAssetFolder } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function AssetsManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedAsset, setSelectedAsset] = useState<AdminAssetFolder | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDownloadAssetsPDF = () => {
    const assets = store.assets || []
    const headers = ['Client Name', 'Project Name', 'Drive Link', 'Missing Files', 'Folder Status']
    const rows = assets.map((a) => [
      a.clientName,
      a.projectName,
      a.googleDriveLink,
      (a.missingFilesCount || 0).toString(),
      a.folderStatus,
    ])
    exportSectionReportPDF('Client Assets Folder Audit', 'AROM Studio Google Drive & Asset Folders', headers, rows, 'Assets_Directory_Report')
  }

  const handleDeleteAsset = (id: string) => {
    const a = store.assets.find((x) => x.id === id)
    moveToRecycleBin('assets', id, a?.clientName || 'Asset Folder', a?.projectName)
    setStore(getAdminStore())
    if (selectedAsset?.id === id) setSelectedAsset(null)
  }

  const [form, setForm] = useState({
    clientName: '',
    projectName: '',
    googleDriveLink: 'https://drive.google.com/drive/folders/',
    folderStatus: 'Syncing' as const,
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const assets = store.assets || []

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.projectName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || a.folderStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalFolders = assets.length
  const completeFolders = assets.filter((a) => a.folderStatus === 'Complete').length
  const needsFilesFolders = assets.filter((a) => a.folderStatus === 'Needs Files').length
  const totalMissing = assets.reduce((acc, a) => acc + (a.missingFilesCount || 0), 0)

  const handleCreateAssetFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName) return

    const newFolder: AdminAssetFolder = {
      id: 'ast_' + Math.random().toString(36).slice(2, 9),
      clientName: form.clientName,
      projectName: form.projectName || 'Web Development Project',
      googleDriveLink: form.googleDriveLink,
      folderStatus: form.folderStatus,
      missingFilesCount: 2,
      uploadDate: new Date().toISOString(),
      checklist: [
        { name: 'Vector Brand Logo (SVG/AI)', received: true },
        { name: 'Brand Typography Fonts', received: true },
        { name: 'High-Res Product Imagery', received: false },
        { name: 'Brand Video Asset (MP4)', received: false },
      ],
    }

    const updated = { ...store, assets: [newFolder, ...store.assets] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const columns = [
    {
      key: 'clientName',
      label: 'Client & Project',
      render: (v: string, row: AdminAssetFolder) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.projectName}</div>
        </div>
      ),
    },
    {
      key: 'googleDriveLink',
      label: 'Google Drive Link',
      render: (v: string) => (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-white/80 hover:text-accent flex items-center gap-1 underline font-mono">
          <ExternalLink className="h-3.5 w-3.5 text-accent" /> Drive Folder
        </a>
      ),
    },
    {
      key: 'missingFilesCount',
      label: 'Missing Files',
      render: (v: number) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
          v > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {v > 0 ? `${v} Missing` : 'All Received'}
        </span>
      ),
    },
    {
      key: 'folderStatus',
      label: 'Folder Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Complete' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          v === 'Syncing' ? 'bg-accent/20 border-accent/40 text-accent' :
          'bg-amber-500/20 border-amber-500/40 text-amber-400'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'uploadDate',
      label: 'Upload Date',
      render: (v: string) => (
        <span className="text-white/60 text-xs font-mono">{formatIST(v)}</span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminAssetFolder) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedAsset(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Checklist & Drive Link"
          >
            Checklist
          </button>
          <a
            href={row.googleDriveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download Assets"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => handleDeleteAsset(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Asset Folder"
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
            <FolderUp className="h-5 w-5 text-accent" /> Assets Manager
          </h2>
          <p className="text-xs text-white/50">Google Drive links, missing brand assets tracker, folder status & asset checklist</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadAssetsPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Assets PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Link Asset Folder
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Linked Drive Folders" value={totalFolders} icon={<FolderUp className="h-4 w-4 text-accent" />} />
        <StatCard label="Fully Complete" value={completeFolders} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Needs Files" value={needsFilesFolders} icon={<AlertCircle className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Total Missing Files" value={totalMissing} icon={<Clock className="h-4 w-4 text-red-400" />} />
      </div>

      {/* Filters & Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search client or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Complete', 'Needs Files', 'Syncing'].map((st) => (
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

        <DataTable columns={columns} data={filteredAssets} />
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Link Google Drive Asset Folder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssetFolder} className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-medium">Client Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Apex Innovations Global"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Project Name</label>
                <input
                  type="text"
                  placeholder="UI Design System"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Google Drive Shareable Link *</label>
                <input
                  required
                  type="text"
                  value={form.googleDriveLink}
                  onChange={(e) => setForm({ ...form, googleDriveLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Folder Status</label>
                <select
                  value={form.folderStatus}
                  onChange={(e) => setForm({ ...form, folderStatus: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                >
                  <option value="Syncing">Syncing</option>
                  <option value="Complete">Complete</option>
                  <option value="Needs Files">Needs Files</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Save Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checklist View Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">{selectedAsset.clientName}</h3>
                <p className="text-xs text-accent">Drive Folder Checklist</p>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {selectedAsset.checklist?.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className={chk.received ? 'text-emerald-400 font-medium' : 'text-white/70'}>{chk.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chk.received ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {chk.received ? 'Received' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedAsset(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium cursor-pointer">
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
