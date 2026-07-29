import { useState, useEffect } from 'react'
import { Image, Search, Trash2, FolderOpen, X, Plus, Link } from 'lucide-react'
import { getAdminStore, syncFromCloud, logAuditEvent } from '../adminStore'

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'logo' | 'icon' | 'other'
  url: string
  category: string
  tags: string
  fileSize: string
  notes: string
  createdAt: string
}

const uid = () => `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function MediaLibrary() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState(''); const [type, setType] = useState<MediaItem['type']>('image')
  const [url, setUrl] = useState(''); const [category, setCategory] = useState(''); const [tags, setTags] = useState('')
  const [fileSize, setFileSize] = useState(''); const [notes, setNotes] = useState('')

  const reload = () => { syncFromCloud().then(s => setStore(s)) }
  useEffect(() => { reload() }, [])

  const items: MediaItem[] = (store.media || []).map((m: any) => ({
    id: m.id, name: m.name || '', type: m.type || 'other', url: m.url || '',
    category: m.category || '', tags: m.tags || '', fileSize: m.fileSize || '',
    notes: m.notes || '', createdAt: m.createdAt || m._createdAt || '',
  }))

  const filtered = items.filter(m => {
    if (filterType !== 'All' && m.type !== filterType) return false
    if (!search) return true
    const q = search.toLowerCase()
    return m.name?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q) || m.tags?.toLowerCase().includes(q)
  })

  const categories = [...new Set(items.map(m => m.category).filter(Boolean))]

  const save = async (media: MediaItem) => {
    await fetch('/api/admin/media', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(media) })
    logAuditEvent('system', 'Media Added', media.name)
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !url) return
    await save({ id: uid(), name, type, url, category, tags, fileSize, notes, createdAt: new Date().toISOString() })
    setShowModal(false); setName(''); setType('image'); setUrl(''); setCategory(''); setTags(''); setFileSize(''); setNotes('')
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE', credentials: 'include' })
    reload()
  }

  const typeIcon = (t: string) => {
    switch(t) {
      case 'image': case 'logo': case 'icon': return <Image className="h-8 w-8 text-accent" />
      default: return <Link className="h-8 w-8 text-accent" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><Image className="h-5 w-5 text-accent" /> Media Library</h2>
          <p className="text-xs text-white/50">Manage images, logos, icons, videos & documents</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> Add Media
        </button>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, category, tags..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-accent/50" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {['All', 'image', 'logo', 'icon', 'video', 'document'].map(f => (
              <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize ${filterType === f ? 'bg-accent/20 text-accent border border-accent/30' : 'text-white/50 hover:text-white bg-white/5'}`}>{f}</button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <FolderOpen className="h-3 w-3" /> Categories: {categories.map(c => <span key={c} className="bg-white/5 px-2 py-0.5 rounded">{c}</span>)}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(m => (
            <div key={m.id} className="glass rounded-xl p-3 border border-white/10 hover:border-accent/30 transition-all group">
              <div className="flex items-center justify-center h-16 mb-2 bg-white/5 rounded-lg">{typeIcon(m.type)}</div>
              <div className="text-xs text-white font-medium truncate">{m.name}</div>
              <div className="text-[10px] text-white/40 capitalize">{m.type}{m.fileSize ? ` • ${m.fileSize}` : ''}</div>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Open</a>
                <button onClick={() => deleteItem(m.id)} className="ml-auto text-red-400/60 hover:text-red-400 text-[10px]">Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-8 text-white/30 text-xs">No media items found.</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Add Media Item</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Name *</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Type</label><select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"><option>image</option><option>logo</option><option>icon</option><option>video</option><option>document</option><option>other</option></select></div>
              </div>
              <div><label className="text-white/60 block mb-1">URL *</label><input required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[11px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Category</label><input value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">File Size</label><input value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="e.g. 2.4 MB" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              </div>
              <div><label className="text-white/60 block mb-1">Tags (comma separated)</label><input value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div><label className="text-white/60 block mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold">Add Media</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
