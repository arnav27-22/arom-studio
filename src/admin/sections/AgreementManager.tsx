import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { FileSignature, Search, Download, CheckCircle2, Clock, Plus, X } from 'lucide-react'
import { getAdminStore, saveAdminStore, formatIST, type AdminAgreement } from '../adminStore'

export function AgreementManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showAddModal, setShowAddModal] = useState(false)

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    version: 'v1.0',
    status: 'Pending' as 'Pending' | 'Signed',
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const agreements = store.agreements || []

  const filteredAgreements = agreements.filter((a) => {
    const matchesSearch =
      a.agreementNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.clientEmail.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || a.status === (statusFilter as any)
    return matchesSearch && matchesStatus
  })

  const totalAgreements = agreements.length
  const signedAgreements = agreements.filter((a) => a.status === 'Signed').length
  const pendingAgreements = agreements.filter((a) => a.status === 'Pending').length

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName) return

    const num = `AGR-2026-${(agreements.length + 1).toString().padStart(3, '0')}`
    const newAgr: AdminAgreement = {
      id: 'agr_' + Math.random().toString(36).slice(2, 9),
      agreementNumber: num,
      clientName: form.clientName,
      clientEmail: form.clientEmail || 'client@example.com',
      status: form.status,
      agreementVersion: form.version,
      createdAt: new Date().toISOString(),
      signedDate: form.status === 'Signed' ? new Date().toISOString() : undefined,
    }

    const updated = { ...store, agreements: [newAgr, ...store.agreements] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const columns = [
    {
      key: 'agreementNumber',
      label: 'Agreement # & Version',
      render: (v: string, row: AdminAgreement) => (
        <div>
          <span className="text-accent font-mono font-bold text-xs">{v}</span>
          <div className="text-[10px] text-white/50 font-mono">Ver: {row.agreementVersion}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client Name & Email',
      render: (v: string, row: AdminAgreement) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[10px] text-white/50 font-mono">{row.clientEmail}</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (v: string) => (
        <span className="text-white/70 text-xs font-mono">{formatIST(v)}</span>
      ),
    },
    {
      key: 'signedDate',
      label: 'Signed Date',
      render: (v?: string) => (
        <span className="text-xs font-mono">{v ? formatIST(v) : '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
          v === 'Signed' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          'bg-amber-500/20 border-amber-500/40 text-amber-400'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminAgreement) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Downloading Agreement ${row.agreementNumber} PDF...`)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-colors cursor-pointer"
            title="Download Signed Agreement"
          >
            <Download className="h-3.5 w-3.5" />
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
            <FileSignature className="h-5 w-5 text-accent" /> Website Agreement Management
          </h2>
          <p className="text-xs text-white/50">Manage signed website build contracts, terms of service, NDA versions & PDF downloads</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Agreement Contract
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Contracts" value={totalAgreements} icon={<FileSignature className="h-4 w-4 text-accent" />} />
        <StatCard label="Signed Contracts" value={signedAgreements} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Pending Signature" value={pendingAgreements} icon={<Clock className="h-4 w-4 text-amber-400" />} />
      </div>

      {/* Filters & Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search agreement #, client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Pending', 'Signed'].map((st) => (
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

        <DataTable columns={columns} data={filteredAgreements} />
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Add New Agreement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgreement} className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-medium">Client Name *</label>
                <input
                  required
                  type="text"
                  placeholder="LuxeLiving Interior Studio"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Client Email</label>
                <input
                  type="email"
                  placeholder="vikram@luxeliving.co.in"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Agreement Version</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Signed">Signed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
