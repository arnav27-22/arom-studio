import { useState, useEffect } from 'react'
import { Lock, Plus, Search, Eye, EyeOff, Copy, Trash2, X, Globe, Server, Mail, Smartphone } from 'lucide-react'
import { getAdminStore, syncFromCloud, logAuditEvent } from '../adminStore'

interface VaultEntry {
  id: string
  name: string
  type: 'hosting' | 'domain' | 'cloud' | 'email' | 'social' | 'third_party' | 'other'
  url: string
  username: string
  password: string
  notes: string
  category: string
  createdAt: string
}

const uid = () => `vault_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const TYPE_ICONS: Record<string, any> = { hosting: Server, domain: Globe, cloud: Server, email: Mail, social: Smartphone, third_party: Lock, other: Lock }

export function PasswordVault() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  const [name, setName] = useState(''); const [type, setType] = useState<VaultEntry['type']>('hosting')
  const [url, setUrl] = useState(''); const [username, setUsername] = useState('')
  const [password, setPassword] = useState(''); const [category, setCategory] = useState(''); const [notes, setNotes] = useState('')

  const reload = () => { syncFromCloud().then(s => setStore(s)) }
  useEffect(() => { reload() }, [])

  const entries: VaultEntry[] = (store.passwords || []).map((p: any) => ({
    id: p.id, name: p.name || '', type: p.type || 'other', url: p.url || '',
    username: p.username || '', password: p.password || '', notes: p.notes || '',
    category: p.category || '', createdAt: p.createdAt || p._createdAt || '',
  }))

  const filtered = entries.filter(e => {
    if (filterType !== 'All' && e.type !== filterType) return false
    if (!search) return true
    const q = search.toLowerCase()
    return e.name?.toLowerCase().includes(q) || e.url?.toLowerCase().includes(q) || e.username?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q)
  })

  const save = async (entry: VaultEntry) => {
    await fetch('/api/admin/passwords', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
    logAuditEvent('security', 'Password Vault Entry Added', entry.name)
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !username || !password) return
    await save({ id: uid(), name, type, url, username, password, notes, category, createdAt: new Date().toISOString() })
    setShowModal(false); setName(''); setType('hosting'); setUrl(''); setUsername(''); setPassword(''); setCategory(''); setNotes('')
  }

  const deleteEntry = async (id: string) => {
    await fetch(`/api/admin/passwords/${id}`, { method: 'DELETE', credentials: 'include' })
    reload()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><Lock className="h-5 w-5 text-accent" /> Password Vault</h2>
          <p className="text-xs text-white/50">Securely store business credentials — hosting, domains, cloud services & more</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> Add Credential
        </button>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, URL, username..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-accent/50" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {['All', 'hosting', 'domain', 'cloud', 'email', 'social', 'third_party'].map(f => (
              <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize ${filterType === f ? 'bg-accent/20 text-accent border border-accent/30' : 'text-white/50 hover:text-white bg-white/5'}`}>{f.replace(/_/g, ' ')}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(e => {
            const Icon = TYPE_ICONS[e.type] || Lock
            const isVisible = visible[e.id]
            return (
              <div key={e.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-all">
                <div className="p-2 rounded-lg bg-accent/10 text-accent"><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white">{e.name}</div>
                  <div className="text-[10px] text-white/40">{e.url || e.type}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/50 font-mono">{e.username}</span>
                    <span className="text-[10px] font-mono flex items-center gap-1">
                      {isVisible ? e.password : '••••••••'}
                      <button onClick={() => setVisible({ ...visible, [e.id]: !isVisible })} className="text-white/30 hover:text-white">
                        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </span>
                  </div>
                </div>
                <button onClick={() => copyToClipboard(e.username)} className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg" title="Copy username"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => copyToClipboard(e.password)} className="p-1.5 text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-lg" title="Copy password"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteEntry(e.id)} className="p-1.5 text-red-400/60 hover:text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center py-8 text-white/30 text-xs">No credentials stored. Add your first one.</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Add Credential</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Name *</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Type</label><select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white">
                  <option value="hosting">Hosting</option><option value="domain">Domain</option><option value="cloud">Cloud Service</option>
                  <option value="email">Email</option><option value="social">Social Media</option><option value="third_party">Third Party</option><option value="other">Other</option>
                </select></div>
              </div>
              <div><label className="text-white/60 block mb-1">URL / Login Page</label><input value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Username / Email *</label><input required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Password *</label><input required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" /></div>
              </div>
              <div><label className="text-white/60 block mb-1">Category</label><input value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div><label className="text-white/60 block mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold">Save Credential</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
