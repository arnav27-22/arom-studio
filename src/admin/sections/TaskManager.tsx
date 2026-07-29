import { useState, useEffect } from 'react'
import { CheckSquare, Plus, Search, Trash2, Calendar, Edit3, X } from 'lucide-react'
import { getAdminStore, syncFromCloud, logAuditEvent } from '../adminStore'

interface Task {
  id: string
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  dueDate: string
  progress: number
  assignee: string
  notes: string
  createdAt: string
}

const uid = () => `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function TaskManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [notes, setNotes] = useState('')

  const reload = () => { syncFromCloud().then(s => setStore(s)) }

  useEffect(() => { reload() }, [])

  const tasks: Task[] = (store.tasks || []).map((t: any) => ({
    id: t.id || t._id,
    title: t.title || '',
    description: t.description || '',
    priority: t.priority || 'Medium',
    status: t.status || 'Pending',
    dueDate: t.dueDate || '',
    progress: t.progress || 0,
    assignee: t.assignee || '',
    notes: t.notes || '',
    createdAt: t.createdAt || t._createdAt || new Date().toISOString(),
  }))

  const filtered = tasks.filter(t => {
    if (filter !== 'All' && t.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    urgent: tasks.filter(t => t.priority === 'Urgent').length,
  }

  const saveTask = async (task: Task) => {
    await fetch(`/api/admin/tasks${editing ? `/${editing.id}` : ''}`, {
      method: editing ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    logAuditEvent('system', editing ? 'Task Updated' : 'Task Created', task.title)
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const task: Task = {
      id: editing?.id || uid(),
      title, description, priority, dueDate, status: editing?.status || 'Pending',
      progress: editing?.progress || 0, assignee, notes, createdAt: editing?.createdAt || new Date().toISOString(),
    }
    await saveTask(task)
    setShowModal(false)
    setEditing(null)
    setTitle(''); setDescription(''); setPriority('Medium'); setDueDate(''); setAssignee(''); setNotes('')
  }

  const toggleStatus = async (t: Task) => {
    const next = t.status === 'Completed' ? 'Pending' : t.status === 'In Progress' ? 'Completed' : 'In Progress'
    await saveTask({ ...t, status: next, progress: next === 'Completed' ? 100 : t.progress })
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE', credentials: 'include' })
    logAuditEvent('system', 'Task Deleted', id)
    reload()
  }

  const editTask = (t: Task) => {
    setEditing(t); setTitle(t.title); setDescription(t.description); setPriority(t.priority)
    setDueDate(t.dueDate); setAssignee(t.assignee); setNotes(t.notes); setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-accent" /> Task Manager
          </h2>
          <p className="text-xs text-white/50">Internal tasks, priorities, deadlines & progress tracking</p>
        </div>
        <button onClick={() => { setEditing(null); setTitle(''); setDescription(''); setPriority('Medium'); setDueDate(''); setAssignee(''); setNotes(''); setShowModal(true) }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-white/10"><div className="text-2xl font-bold text-white">{stats.total}</div><div className="text-xs text-white/50">Total Tasks</div></div>
        <div className="glass rounded-2xl p-4 border border-white/10"><div className="text-2xl font-bold text-emerald-400">{stats.completed}</div><div className="text-xs text-white/50">Completed</div></div>
        <div className="glass rounded-2xl p-4 border border-white/10"><div className="text-2xl font-bold text-amber-400">{stats.inProgress}</div><div className="text-xs text-white/50">In Progress</div></div>
        <div className="glass rounded-2xl p-4 border border-white/10"><div className="text-2xl font-bold text-red-400">{stats.urgent}</div><div className="text-xs text-white/50">Urgent</div></div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-accent/50" />
          </div>
          <div className="flex gap-1">{['All', 'Pending', 'In Progress', 'Completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-accent/20 text-accent border border-accent/30' : 'text-white/50 hover:text-white bg-white/5'}`}>{f}</button>
          ))}</div>
        </div>

        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-all">
              <button onClick={() => toggleStatus(t)} className={`p-1.5 rounded-lg transition-colors ${t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30 hover:text-white'}`}>
                <CheckSquare className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${t.status === 'Completed' ? 'text-white/40 line-through' : 'text-white'}`}>{t.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    t.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                    t.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    t.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-white/10 text-white/50'
                  }`}>{t.priority}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                  {t.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.dueDate}</span>}
                  {t.assignee && <span>Assignee: {t.assignee}</span>}
                  {t.progress > 0 && <span>{t.progress}%</span>}
                </div>
              </div>
              <button onClick={() => editTask(t)} className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg"><Edit3 className="h-3.5 w-3.5" /></button>
              <button onClick={() => deleteTask(t.id)} className="p-1.5 text-red-400/60 hover:text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-white/30 text-xs">No tasks found. Create one to get started.</div>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">{editing ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div><label className="text-white/60 block mb-1">Title *</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div><label className="text-white/60 block mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Priority</label><select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></div>
                <div><label className="text-white/60 block mb-1">Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              </div>
              <div><label className="text-white/60 block mb-1">Assignee</label><input value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div><label className="text-white/60 block mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold">{editing ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
