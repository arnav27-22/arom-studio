import { useState, useEffect, useCallback } from 'react'
import {
  Trash2, RotateCcw, Search, Filter, Calendar, AlertTriangle,
  X, CheckSquare2, Square, ShieldCheck, Package
} from 'lucide-react'
import {
  getAdminStore, restoreFromRecycleBin, permanentDeleteFromRecycleBin,
  emptyRecycleBin, bulkRestoreFromRecycleBin, bulkPermanentDeleteFromRecycleBin,
  formatIST, type AdminRecycleItem, syncFromCloud
} from '../adminStore'

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
function ConfirmDialog({
  open, title, message, confirmLabel, confirmClass, onCancel, onConfirm
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  confirmClass: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass rounded-[28px] border border-white/15 p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-white">{title}</h3>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed font-body">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Collection Label Map ─────────────────────────────────────────────────────
const COLLECTION_LABELS: Record<string, string> = {
  clients: 'Clients',
  projects: 'Projects',
  proposals: 'Proposals',
  agreements: 'Agreements',
  payments: 'Payments',
  content: 'Content',
  assets: 'Assets',
  approvals: 'Design Approvals',
  timelines: 'Timelines',
  handovers: 'Handovers',
  feedbacks: 'Feedback',
  notifications: 'Notifications',
  invoices: 'Invoices',
  leads: 'Leads',
  pdfs: 'PDFs',
  visitors: 'Visitors',
  discoveryQuestionnaires: 'Discovery Questionnaires',
  logs: 'System Logs',
}

const COLLECTION_COLORS: Record<string, string> = {
  clients: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  projects: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  proposals: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  agreements: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  payments: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  leads: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  pdfs: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

function getCollectionStyle(col: string) {
  return COLLECTION_COLORS[col] || 'text-accent bg-accent/10 border-accent/20'
}

// ─── Main RecycleBin Component ────────────────────────────────────────────────
export function RecycleBin() {
  const [items, setItems] = useState<AdminRecycleItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  // Confirmation dialog state
  const [confirm, setConfirm] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    confirmClass: string
    action: () => void
  }>({ open: false, title: '', message: '', confirmLabel: '', confirmClass: '', action: () => {} })

  const reload = useCallback(() => {
    const store = getAdminStore()
    setItems([...(store.recycleBin || [])].reverse())
    setSelected(new Set())
  }, [])

  useEffect(() => {
    reload()
    // Sync from cloud to get latest recycle bin state
    syncFromCloud().then(() => reload())
  }, [reload])

  // ── Filtering ────────────────────────────────────────────────────────────────
  const now = Date.now()
  const filtered = items.filter((item) => {
    if (searchTerm) {
      const text = `${item.title} ${item.subtitle || ''} ${item.originalCollection} ${item.deletedByName || ''}`.toLowerCase()
      if (!text.includes(searchTerm.toLowerCase())) return false
    }
    if (filterModule !== 'all' && item.originalCollection !== filterModule) return false
    if (filterTimeframe !== 'all') {
      const age = now - new Date(item.deletedAt).getTime()
      if (filterTimeframe === 'today' && age > 86400000) return false
      if (filterTimeframe === '7days' && age > 7 * 86400000) return false
      if (filterTimeframe === '30days' && age > 30 * 86400000) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Selection ────────────────────────────────────────────────────────────────
  const allPageSelected = paginated.length > 0 && paginated.every((i) => selected.has(i.id))
  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => { const n = new Set(prev); paginated.forEach((i) => n.delete(i.id)); return n })
    } else {
      setSelected((prev) => { const n = new Set(prev); paginated.forEach((i) => n.add(i.id)); return n })
    }
  }
  const toggleOne = (id: string) => {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id) } else { n.add(id) }; return n })
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  const openConfirm = (
    title: string, message: string, confirmLabel: string,
    confirmClass: string, action: () => void
  ) => setConfirm({ open: true, title, message, confirmLabel, confirmClass, action })

  const closeConfirm = () => setConfirm((p) => ({ ...p, open: false }))

  const doRestore = (id: string) => {
    restoreFromRecycleBin(id)
    reload()
  }

  const doDelete = (id: string) => {
    openConfirm(
      'Permanently Delete Item',
      'This action is irreversible. The selected item will be permanently removed from the database and cannot be recovered.',
      'Permanently Delete',
      'bg-red-500 hover:bg-red-600 text-white',
      () => { permanentDeleteFromRecycleBin(id); reload(); closeConfirm() }
    )
  }

  const doBulkRestore = () => {
    if (selected.size === 0) return
    openConfirm(
      `Restore ${selected.size} Item${selected.size > 1 ? 's' : ''}`,
      `This will restore ${selected.size} selected item(s) back to their original modules. They will immediately reappear in their respective sections.`,
      'Restore All Selected',
      'bg-emerald-500 hover:bg-emerald-600 text-white',
      () => { bulkRestoreFromRecycleBin(Array.from(selected)); reload(); closeConfirm() }
    )
  }

  const doBulkDelete = () => {
    if (selected.size === 0) return
    openConfirm(
      `Permanently Delete ${selected.size} Item${selected.size > 1 ? 's' : ''}`,
      `This action is irreversible. All ${selected.size} selected item(s) will be permanently removed from the database and cannot be recovered.`,
      `Permanently Delete ${selected.size} Items`,
      'bg-red-500 hover:bg-red-600 text-white',
      () => { bulkPermanentDeleteFromRecycleBin(Array.from(selected)); reload(); closeConfirm() }
    )
  }

  const doEmptyBin = () => {
    openConfirm(
      'Empty Entire Recycle Bin',
      `This will permanently delete ALL ${items.length} item(s) in the Recycle Bin. This action is irreversible and cannot be undone.`,
      'Empty Recycle Bin',
      'bg-red-500 hover:bg-red-600 text-white',
      () => { emptyRecycleBin(); reload(); closeConfirm() }
    )
  }

  // ── Unique module list for filter dropdown ────────────────────────────────────
  const uniqueModules = Array.from(new Set(items.map((i) => i.originalCollection)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-accent" /> Enterprise Recycle Bin
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Soft-deleted items from all admin modules. Restore or permanently delete with full audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <>
              <button
                onClick={doBulkRestore}
                className="flex items-center gap-2 text-xs font-semibold text-white bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-emerald-400" />
                Restore {selected.size} Selected
              </button>
              <button
                onClick={doBulkDelete}
                className="flex items-center gap-2 text-xs font-semibold text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
                Delete {selected.size} Selected
              </button>
            </>
          )}
          {items.length > 0 && (
            <button
              onClick={doEmptyBin}
              className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Empty Bin
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Recycled', value: items.length, icon: Trash2 },
          { label: 'Filtered Results', value: filtered.length, icon: Filter },
          { label: 'Selected', value: selected.size, icon: CheckSquare2 },
          { label: 'Modules', value: uniqueModules.length, icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-[16px] p-4 border border-white/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">{value}</div>
              <div className="text-[10px] text-white/50 font-body">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="glass rounded-[20px] p-4 border border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, email, ID, module, or keyword..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-body"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Filter className="h-3.5 w-3.5 text-accent" />
              <select
                value={filterModule}
                onChange={(e) => { setFilterModule(e.target.value); setPage(1) }}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent/40 font-body"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map((m) => (
                  <option key={m} value={m}>{COLLECTION_LABELS[m] || m}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              <select
                value={filterTimeframe}
                onChange={(e) => { setFilterTimeframe(e.target.value); setPage(1) }}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent/40 font-body"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="glass rounded-[24px] border border-white/10 overflow-hidden">
        {/* Bulk Select Header */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-white/[0.02]">
            <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors cursor-pointer">
              {allPageSelected
                ? <CheckSquare2 className="h-4 w-4 text-accent" />
                : <Square className="h-4 w-4" />
              }
              {allPageSelected ? 'Deselect Page' : 'Select Page'}
            </button>
            <span className="text-[10px] text-white/30 font-mono">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''} • Page {page}/{totalPages}
            </span>
            {selected.size > 0 && (
              <span className="text-[10px] font-semibold text-accent font-mono">
                {selected.size} selected
              </span>
            )}
          </div>
        )}

        {/* Items */}
        <div className="divide-y divide-white/5">
          {paginated.length > 0 ? (
            paginated.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-all group ${selected.has(item.id) ? 'bg-accent/5 border-l-2 border-accent/40' : ''}`}
              >
                {/* Checkbox */}
                <button onClick={() => toggleOne(item.id)} className="flex-shrink-0 cursor-pointer">
                  {selected.has(item.id)
                    ? <CheckSquare2 className="h-4 w-4 text-accent" />
                    : <Square className="h-4 w-4 text-white/30 group-hover:text-white/60" />
                  }
                </button>

                {/* Module Badge */}
                <div className="shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getCollectionStyle(item.originalCollection)}`}>
                    {COLLECTION_LABELS[item.originalCollection] || item.originalCollection}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white font-heading truncate">{item.title}</span>
                  </div>
                  {item.subtitle && (
                    <div className="text-[11px] text-white/50 truncate mt-0.5">{item.subtitle}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] text-white/35 font-mono">
                      Deleted: {formatIST(item.deletedAt)}
                    </span>
                    {item.originalCreatedAt && (
                      <span className="text-[10px] text-white/30 font-mono">
                        Created: {formatIST(item.originalCreatedAt)}
                      </span>
                    )}
                    {item.deletedByName && (
                      <span className="text-[10px] text-white/35 font-mono">
                        By: {item.deletedByName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => doRestore(item.id)}
                    title="Restore to original module"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Restore</span>
                  </button>
                  <button
                    onClick={() => doDelete(item.id)}
                    title="Permanently Delete"
                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-white/20" />
              </div>
              <h3 className="text-sm font-heading font-semibold text-white/40 mb-1">
                {items.length === 0 ? 'Recycle Bin is Empty' : 'No Items Match Filters'}
              </h3>
              <p className="text-xs text-white/25 font-body max-w-xs">
                {items.length === 0
                  ? 'Items deleted from any admin module will appear here for safe recovery before permanent deletion.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {items.length > 0 && (searchTerm || filterModule !== 'all' || filterTimeframe !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterModule('all'); setFilterTimeframe('all') }}
                  className="mt-4 flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
            <span className="text-xs text-white/40 font-body">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span key={`ellipsis-${p}`} className="text-white/30 text-xs px-1">…</span>
                    )}
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-7 w-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        page === p
                          ? 'bg-accent text-black font-bold'
                          : 'text-white/50 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  </>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Note */}
      <div className="flex items-center gap-2 text-[11px] text-white/30 font-body">
        <ShieldCheck className="h-3.5 w-3.5 text-accent/50" />
        All recycle bin operations are permanently recorded in the System Audit Trail. Restoration is instantaneous.
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        confirmClass={confirm.confirmClass}
        onCancel={closeConfirm}
        onConfirm={confirm.action}
      />
    </div>
  )
}
