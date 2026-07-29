import { useState, useEffect } from 'react'
import { Calendar, Plus, Search, Trash2, Clock, Users, X } from 'lucide-react'
import { getAdminStore, syncFromCloud } from '../adminStore'

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  clientName: string
  participants: string
  notes: string
  summary: string
  actionItems: string
  followUpDate: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  createdAt: string
}

const uid = () => `meet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function Meetings() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Meeting | null>(null)

  const [title, setTitle] = useState(''); const [date, setDate] = useState(''); const [time, setTime] = useState('')
  const [clientName, setClientName] = useState(''); const [participants, setParticipants] = useState('')
  const [notes, setNotes] = useState(''); const [summary, setSummary] = useState('')
  const [actionItems, setActionItems] = useState(''); const [followUpDate, setFollowUpDate] = useState('')

  const reload = () => { syncFromCloud().then(s => setStore(s)) }
  useEffect(() => { reload() }, [])

  const meetings: Meeting[] = (store.meetings || []).map((m: any) => ({
    id: m.id || m._id, title: m.title || '', date: m.date || '', time: m.time || '',
    clientName: m.clientName || '', participants: m.participants || '', notes: m.notes || '',
    summary: m.summary || '', actionItems: m.actionItems || '', followUpDate: m.followUpDate || '',
    status: m.status || 'Scheduled', createdAt: m.createdAt || m._createdAt || '',
  }))

  const filtered = meetings.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.title?.toLowerCase().includes(q) || m.clientName?.toLowerCase().includes(q) || m.participants?.toLowerCase().includes(q)
  })

  const save = async (meeting: Meeting) => {
    await fetch(`/api/admin/meetings${editing ? `/${editing.id}` : ''}`, {
      method: editing ? 'PUT' : 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting),
    })
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const m: Meeting = {
      id: editing?.id || uid(), title, date, time, clientName, participants, notes, summary, actionItems,
      followUpDate, status: editing?.status || 'Scheduled', createdAt: editing?.createdAt || new Date().toISOString(),
    }
    await save(m); setShowModal(false); setEditing(null)
    setTitle(''); setDate(''); setTime(''); setClientName(''); setParticipants(''); setNotes(''); setSummary(''); setActionItems(''); setFollowUpDate('')
  }

  const deleteMeeting = async (id: string) => {
    await fetch(`/api/admin/meetings/${id}`, { method: 'DELETE', credentials: 'include' })
    reload()
  }

  const editMeeting = (m: Meeting) => {
    setEditing(m); setTitle(m.title); setDate(m.date); setTime(m.time); setClientName(m.clientName)
    setParticipants(m.participants); setNotes(m.notes); setSummary(m.summary); setActionItems(m.actionItems); setFollowUpDate(m.followUpDate)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><Calendar className="h-5 w-5 text-accent" /> Meetings</h2>
          <p className="text-xs text-white/50">Schedule, track & manage client meetings</p>
        </div>
        <button onClick={() => { setEditing(null); setTitle(''); setDate(''); setTime(''); setShowModal(true) }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> Schedule Meeting
        </button>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, client, participants..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-accent/50" />
        </div>

        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{m.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    m.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-accent/20 text-accent'
                  }`}>{m.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                  {m.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.date}</span>}
                  {m.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time}</span>}
                  {m.clientName && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{m.clientName}</span>}
                </div>
              </div>
              <button onClick={() => editMeeting(m)} className="text-xs text-accent hover:text-accent/80 px-2 py-1">Edit</button>
              <button onClick={() => deleteMeeting(m.id)} className="p-1.5 text-red-400/60 hover:text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-white/30 text-xs">No meetings scheduled.</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">{editing ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div><label className="text-white/60 block mb-1">Title *</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Client Name</label><input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Participants</label><input value={participants} onChange={e => setParticipants(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              </div>
              <div><label className="text-white/60 block mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div><label className="text-white/60 block mb-1">Summary</label><textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div><label className="text-white/60 block mb-1">Action Items</label><textarea value={actionItems} onChange={e => setActionItems(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div><label className="text-white/60 block mb-1">Follow-up Date</label><input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold">{editing ? 'Update' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
