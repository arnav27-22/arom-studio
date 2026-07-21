import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Download, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { generateRevisionsPDF } from '../../lib/professionalPDF'

interface Revision {
  id: number
  page: string
  priority: 'low' | 'medium' | 'high'
  description: string
  screenshot: string | null
  deadline: string
  status: 'pending' | 'in-progress' | 'resolved'
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  medium: { label: 'Medium', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
  high: { label: 'High', color: 'text-red-400 bg-red-500/20 border-red-500/30' },
}

const statusConfig = {
  pending: { icon: Circle, label: 'Pending', color: 'text-white/50' },
  'in-progress': { icon: Clock, label: 'In Progress', color: 'text-amber-400' },
  resolved: { icon: CheckCircle2, label: 'Resolved', color: 'text-green-400' },
}

export default function RevisionRequests() {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{ page: string; priority: 'low' | 'medium' | 'high'; description: string; screenshot: string; deadline: string }>({ page: '', priority: 'medium', description: '', screenshot: '', deadline: '' })

  const handleSubmit = () => {
    if (!form.page.trim() || !form.description.trim()) return
    setRevisions((prev) => [{
      id: Date.now(),
      ...form,
      screenshot: form.screenshot || null,
      status: 'pending',
    }, ...prev])
    setForm({ page: '', priority: 'medium', description: '', screenshot: '', deadline: '' })
    setShowForm(false)
  }

  const handleDownloadPDF = () => {
    generateRevisionsPDF(revisions.map((r) => ({
      page: r.page,
      priority: r.priority,
      description: r.description,
      status: r.status,
    })))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Revision Requests</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">Track and manage design revisions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="glass rounded-[28px] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl text-white">New Revision Request</h3>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-white/70 font-body block mb-1.5">Page Name</label>
                  <input value={form.page} onChange={(e) => setForm((p) => ({ ...p, page: e.target.value }))} placeholder="e.g. Homepage, About" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                </div>
                <div>
                  <label className="text-sm text-white/70 font-body block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as 'low' | 'medium' | 'high' }))} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body appearance-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm text-white/70 font-body block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the changes needed..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-white/70 font-body block mb-1.5">Screenshot URL (optional)</label>
                  <input value={form.screenshot} onChange={(e) => setForm((p) => ({ ...p, screenshot: e.target.value }))} placeholder="Paste image link" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                </div>
                <div>
                  <label className="text-sm text-white/70 font-body block mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="secondary" size="sm" onClick={handleSubmit}>Submit Request</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revisions.length === 0 ? (
        <div className="glass rounded-[24px] p-10 text-center">
          <AlertCircle className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 font-body">No revision requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {revisions.map((rev, i) => {
            const StatusIcon = statusConfig[rev.status].icon
            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-[20px] p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn('h-4 w-4', statusConfig[rev.status].color)} />
                    <h4 className="font-heading text-lg text-white">{rev.page}</h4>
                  </div>
                  <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-body font-medium border', priorityConfig[rev.priority].color)}>
                    {priorityConfig[rev.priority].label}
                  </span>
                </div>
                <p className="text-sm text-white/60 font-body font-light mb-2">{rev.description}</p>
                <div className="flex items-center gap-4 text-xs text-white/40 font-body">
                  <span className={statusConfig[rev.status].color}>{statusConfig[rev.status].label}</span>
                  {rev.deadline && <span>Due: {rev.deadline}</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
