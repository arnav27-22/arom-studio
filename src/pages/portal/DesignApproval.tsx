import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, MessageSquare, Download, Eye } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'

const designs = [
  { id: 1, page: 'Homepage', status: 'pending', preview: 'https://placehold.co/800x450/0a0a0a/4e85bf?text=Homepage+Design', notes: '' },
  { id: 2, page: 'About Page', status: 'pending', preview: 'https://placehold.co/800x450/0a0a0a/4e85bf?text=About+Design', notes: '' },
  { id: 3, page: 'Services', status: 'pending', preview: 'https://placehold.co/800x450/0a0a0a/4e85bf?text=Services+Design', notes: '' },
  { id: 4, page: 'Contact', status: 'pending', preview: 'https://placehold.co/800x450/0a0a0a/4e85bf?text=Contact+Design', notes: '' },
  { id: 5, page: 'Mobile Design', status: 'pending', preview: 'https://placehold.co/400x800/0a0a0a/4e85bf?text=Mobile+Design', notes: '' },
]

export default function DesignApproval() {
  const [items, setItems] = useState(designs)
  const [commentModal, setCommentModal] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [history, setHistory] = useState<{ id: number; action: string; time: string; page: string }[]>([])

  const handleAction = (id: number, action: 'approved' | 'changes', note?: string) => {
    setItems((prev) => prev.map((d) => d.id === id ? { ...d, status: action, notes: note || d.notes } : d))
    const page = items.find((d) => d.id === id)?.page || ''
    setHistory((prev) => [{ id, action, time: new Date().toLocaleString(), page }, ...prev])
    setCommentModal(null)
    setComment('')
  }

  const approved = items.filter((d) => d.status === 'approved').length
  const progress = (approved / items.length) * 100

  const handleDownloadPDF = () => {
    const lines = items.map((d) => {
      const status = d.status === 'approved' ? 'APPROVED' : d.status === 'changes' ? 'CHANGES REQUESTED' : 'PENDING'
      return `${d.page}: ${status}${d.notes ? ` — ${d.notes}` : ''}`
    })
    const text = [
      'DESIGN APPROVAL REPORT — AROM STUDIO',
      '=====================================',
      `Date: ${new Date().toLocaleDateString('en-IN')}`,
      '',
      ...lines,
      '',
      '=====================================',
      `Overall: ${approved}/${items.length} approved`,
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Design_Approval_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Design Approval</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">Review and approve project designs.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4" /> Approval PDF
        </Button>
      </div>

      {/* Progress */}
      <div className="glass rounded-[24px] p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70 font-body">{approved} of {items.length} approved</span>
          <span className="text-sm text-accent font-heading">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>

      {/* Design cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {items.map((design, i) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-[24px] overflow-hidden"
          >
            <div className="relative group">
              <img src={design.preview} alt={design.page} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="glass rounded-full p-3 hover:bg-white/20 transition-colors">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute top-3 right-3">
                <span className={cn(
                  'text-[10px] px-2.5 py-1 rounded-full font-body font-medium uppercase tracking-wider',
                  design.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  design.status === 'changes' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-white/10 text-white/50 border border-white/10',
                )}>
                  {design.status === 'approved' ? 'Approved' : design.status === 'changes' ? 'Changes' : 'Pending'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-heading text-lg text-white mb-3">{design.page}</h3>
              {design.notes && <p className="text-xs text-white/50 font-body mb-3 italic">"{design.notes}"</p>}
              <div className="flex gap-2">
                <Button
                  variant={design.status === 'approved' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleAction(design.id, 'approved')}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button
                  variant={design.status === 'changes' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCommentModal(design.id)}
                >
                  <XCircle className="h-4 w-4" /> Request Changes
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comment modal */}
      <AnimatePresence>
        {commentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setCommentModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong rounded-[28px] p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-xl text-white mb-4">Request Changes — {items.find((d) => d.id === commentModal)?.page}</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the changes you'd like..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setCommentModal(null)}>Cancel</Button>
                <Button variant="secondary" size="sm" onClick={() => handleAction(commentModal, 'changes', comment)}>
                  <MessageSquare className="h-4 w-4" /> Submit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval history */}
      {history.length > 0 && (
        <div className="glass rounded-[24px] p-6">
          <h3 className="font-heading text-lg text-white mb-4">Approval History</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {h.action === 'approved' ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                <span className="text-white/70 font-body">{h.page} — <span className={h.action === 'approved' ? 'text-green-400' : 'text-red-400'}>{h.action === 'approved' ? 'Approved' : 'Changes requested'}</span></span>
                <span className="text-white/30 font-body text-xs ml-auto">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
