import { useState, useEffect } from 'react'
import { getAdminStore, subscribe, syncFromCloud, formatIST, saveAdminStore } from '../adminStore'
import { FileText, Download, Plus, Search, Trash2, X, File as FileIcon, ExternalLink, Filter } from 'lucide-react'

const DOCUMENT_TYPES = [
  'Receipt', 'Quotation', 'Project Brief', 'Brand Guideline',
  'SEO Report', 'Audit Report', 'Certificate', 'Support Contract',
]

export function DocumentCenter() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)

  const [form, setForm] = useState({
    name: '',
    type: 'Receipt',
    clientName: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    fileUrl: '',
    fileType: 'pdf',
    amount: 0,
  })

  useEffect(() => {
    const unsub = subscribe(() => setStore(getAdminStore()))
    syncFromCloud().then(setStore)
    return unsub
  }, [])

  const documents = store.documents || []

  const filtered = documents.filter((d: any) => {
    const s = search.toLowerCase()
    const matchesSearch = !s || (d.name || d.data?.name || '').toLowerCase().includes(s) || (d.clientName || d.data?.clientName || '').toLowerCase().includes(s)
    const matchesType = typeFilter === 'All' || (d.type || d.data?.type) === typeFilter
    return matchesSearch && matchesType
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { getAdminStore: g } = await import('../adminStore')
    const doc = {
      name: form.name, type: form.type, clientName: form.clientName,
      date: form.date, notes: form.notes, fileUrl: form.fileUrl,
      fileType: form.fileType, amount: form.amount,
      createdAt: new Date().toISOString(),
    }
    const res = await fetch('/api/admin/documents', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    })
    if (res.ok) {
      const created = await res.json()
      const s = g()
      s.documents = [created, ...s.documents]
      saveAdminStore(s)
      setStore(s)
    }
    setShowAdd(false)
    setForm({ name: '', type: 'Receipt', clientName: '', date: new Date().toISOString().slice(0, 10), notes: '', fileUrl: '', fileType: 'pdf', amount: 0 })
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/documents/${id}`, { method: 'DELETE', credentials: 'include' })
    const s = getAdminStore()
    s.documents = s.documents.filter((d: any) => d.id !== id)
    saveAdminStore(s)
    setStore(s)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><FileText className="h-5 w-5 text-accent" /> Document Center</h2>
          <p className="text-xs text-white/50">Receipts, quotations, brand guidelines, SEO reports, audits, certificates, contracts</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 border border-white/10 cursor-pointer"><Plus className="h-4 w-4" /> Add Document</button>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', ...DOCUMENT_TYPES].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${typeFilter === t ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-white/50 hover:text-white bg-white/5'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-xs text-white/40 text-center py-8">No documents yet.</p>}
          {filtered.map((d: any) => {
            const data = d.data || d
            return (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${data.type === 'Receipt' ? 'bg-emerald-500/10' : data.type === 'Quotation' ? 'bg-blue-500/10' : data.type === 'Brand Guideline' ? 'bg-purple-500/10' : data.type === 'SEO Report' ? 'bg-amber-500/10' : data.type === 'Audit Report' ? 'bg-red-500/10' : data.type === 'Certificate' ? 'bg-cyan-500/10' : data.type === 'Support Contract' ? 'bg-rose-500/10' : 'bg-white/10'}`}>
                    <FileIcon className={`h-4 w-4 ${data.type === 'Receipt' ? 'text-emerald-400' : data.type === 'Quotation' ? 'text-blue-400' : data.type === 'Brand Guideline' ? 'text-purple-400' : data.type === 'SEO Report' ? 'text-amber-400' : data.type === 'Audit Report' ? 'text-red-400' : data.type === 'Certificate' ? 'text-cyan-400' : 'text-rose-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-white font-medium truncate flex items-center gap-2">
                      {data.name}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        data.type === 'Receipt' ? 'bg-emerald-500/10 text-emerald-400' :
                        data.type === 'Quotation' ? 'bg-blue-500/10 text-blue-400' :
                        data.type === 'Brand Guideline' ? 'bg-purple-500/10 text-purple-400' :
                        data.type === 'SEO Report' ? 'bg-amber-500/10 text-amber-400' :
                        data.type === 'Audit Report' ? 'bg-red-500/10 text-red-400' :
                        data.type === 'Certificate' ? 'bg-cyan-500/10 text-cyan-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>{data.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/40 mt-0.5">
                      <span>{data.clientName || 'No client'}</span>
                      <span>{data.date}</span>
                      {data.amount > 0 && <span>₹{data.amount.toLocaleString()}</span>}
                      <span className="text-[9px] uppercase">{data.fileType}</span>
                    </div>
                    {data.notes && <div className="text-[10px] text-white/30 truncate mt-0.5">{data.notes}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {data.fileUrl && (
                    <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 text-white/60 hover:text-accent transition-colors"><ExternalLink className="h-3.5 w-3.5" /></a>
                  )}
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Add Document</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Document Name *</label>
                  <input required type="text" placeholder="e.g. Q3 Invoice" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent">
                    {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Client / Project</label>
                  <input type="text" placeholder="Client name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Amount (₹)</label>
                  <input type="number" placeholder="0" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">File Type</label>
                  <select value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent">
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="xls">XLS</option>
                    <option value="image">Image</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1 font-medium">File URL (optional)</label>
                <input type="url" placeholder="https://..." value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-white/60 block mb-1 font-medium">Notes</label>
                <textarea rows={3} placeholder="Additional details..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
