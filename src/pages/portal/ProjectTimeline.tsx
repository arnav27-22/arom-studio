import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, Circle, ChevronDown, Edit3, Plus, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Phase {
  name: string
  status: 'completed' | 'active' | 'upcoming'
  duration: string
  desc: string
  details: string
}

const defaultPhases: Phase[] = [
  { name: 'Discovery', status: 'completed', duration: 'Week 1', desc: 'Understanding goals, audience, and requirements.', details: 'We discuss your business goals, target audience, brand identity, competitor landscape, and project requirements.' },
  { name: 'Planning', status: 'active', duration: 'Week 2', desc: 'Sitemap, wireframes, and project roadmap.', details: 'We create a detailed sitemap, wireframes for key layouts, and a comprehensive project roadmap.' },
  { name: 'UI Design', status: 'upcoming', duration: 'Weeks 3-4', desc: 'Visual design, prototyping in Figma.', details: 'High-fidelity mockups covering all pages and device sizes for your review.' },
  { name: 'Development', status: 'upcoming', duration: 'Weeks 5-7', desc: 'Building with modern tech stack.', details: 'Development using Next.js, TypeScript, and Tailwind CSS with responsive design.' },
  { name: 'Testing', status: 'upcoming', duration: 'Week 8', desc: 'QA, performance, accessibility.', details: 'Cross-browser testing, performance benchmarking, and accessibility compliance.' },
  { name: 'Revision', status: 'upcoming', duration: 'Week 9', desc: 'Client feedback and refinements.', details: 'Up to 3 rounds of revisions based on your feedback.' },
  { name: 'Deployment', status: 'upcoming', duration: 'Week 10', desc: 'Launch, CDN, SSL, analytics.', details: 'Production deployment with CDN, SSL, and analytics setup.' },
  { name: 'Completed', status: 'upcoming', duration: '', desc: 'Handover and support begins.', details: 'Project files, source code, documentation handed over. 1 year support starts.' },
]

const statuses = ['completed', 'active', 'upcoming'] as const

export default function ProjectTimeline() {
  const [phases, setPhases] = useState<Phase[]>(defaultPhases)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [editPhase, setEditPhase] = useState<Phase | null>(null)

  const completed = phases.filter((p) => p.status === 'completed').length
  const total = phases.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  const addPhase = () => {
    setPhases((prev) => [...prev, { name: 'New Phase', status: 'upcoming', duration: 'Week ?', desc: 'Description', details: '' }])
  }

  const removePhase = (index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index))
  }

  const startEditing = (index: number) => {
    setEditing(index)
    setEditPhase({ ...phases[index] })
  }

  const saveEditing = () => {
    if (editing !== null && editPhase) {
      setPhases((prev) => prev.map((p, i) => i === editing ? { ...p, ...editPhase } : p))
    }
    setEditing(null)
    setEditPhase(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Project Timeline</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">Track your project progress from start to finish.</p>
        </div>
        <button onClick={addPhase} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-body font-medium whitespace-nowrap">
          <Plus className="h-3.5 w-3.5" /> Add Phase
        </button>
      </div>

      {/* Overall progress */}
      <div className="glass rounded-[24px] p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70 font-body">Overall Progress</span>
          <span className="text-sm text-accent font-heading">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-white/40 font-body">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20" /> Upcoming</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-6">
          {phases.map((phase, i) => {
            const Icon = phase.status === 'completed' ? CheckCircle2 : phase.status === 'active' ? Clock : Circle
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative pl-12"
              >
                <div className={cn(
                  'absolute left-0 w-[38px] h-[38px] rounded-full flex items-center justify-center',
                  phase.status === 'completed' ? 'bg-green-500/20' : phase.status === 'active' ? 'bg-accent/20' : 'bg-white/5',
                )}>
                  <Icon className={cn(
                    'h-5 w-5',
                    phase.status === 'completed' ? 'text-green-400' : phase.status === 'active' ? 'text-accent' : 'text-white/30',
                  )} />
                </div>

                {editing === i ? (
                  <div className="glass rounded-[20px] p-5 border border-accent/40">
                    <div className="space-y-3">
                      <input value={editPhase?.name || ''} onChange={(e) => setEditPhase((prev) => prev ? { ...prev, name: e.target.value } : null)} placeholder="Phase name" className="w-full bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body font-heading" />
                      <input value={editPhase?.duration || ''} onChange={(e) => setEditPhase((prev) => prev ? { ...prev, duration: e.target.value } : null)} placeholder="Duration (e.g. Week 1)" className="w-full bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                      <div className="flex gap-2">
                        {statuses.map((s) => (
                          <button key={s} onClick={() => setEditPhase((prev) => prev ? { ...prev, status: s } : null)} className={cn('text-xs px-3 py-1.5 rounded-full border font-body transition-all', editPhase?.status === s ? 'bg-accent/20 border-accent/50 text-accent' : 'border-white/10 text-white/50 hover:border-white/30')}>{s}</button>
                        ))}
                      </div>
                      <textarea value={editPhase?.desc || ''} onChange={(e) => setEditPhase((prev) => prev ? { ...prev, desc: e.target.value } : null)} placeholder="Short description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
                      <textarea value={editPhase?.details || ''} onChange={(e) => setEditPhase((prev) => prev ? { ...prev, details: e.target.value } : null)} placeholder="Detailed description (optional)" rows={3} className="w-full bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
                      <div className="flex justify-between pt-1">
                        <button onClick={() => { removePhase(i); setEditing(null) }} className="text-xs text-red-400 hover:text-red-300 font-body flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>
                        <button onClick={saveEditing} className="text-xs text-accent hover:text-accent/80 font-body">Done</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className={cn(
                      'w-full text-left glass rounded-[20px] p-5 transition-all duration-300 cursor-pointer',
                      phase.status === 'active' ? 'border border-accent/30' : '',
                      expanded === i ? 'border-accent/40' : '',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={cn(
                        'font-heading text-lg',
                        phase.status === 'completed' ? 'text-white/60' : 'text-white',
                      )}>{phase.name}</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); startEditing(i) }} className="text-white/30 hover:text-accent transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
                        {phase.duration && (
                          <span className="text-[10px] text-white/40 font-body uppercase tracking-[0.1em]">{phase.duration}</span>
                        )}
                        <ChevronDown className={cn(
                          'h-4 w-4 text-white/30 transition-transform duration-300',
                          expanded === i ? 'rotate-180' : '',
                        )} />
                      </div>
                    </div>
                    <p className={cn(
                      'text-xs font-body font-light',
                      phase.status === 'completed' ? 'text-white/40' : 'text-white/60',
                    )}>{phase.desc}</p>
                    <AnimatePresence>
                      {expanded === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-white/50 font-body font-light mt-3 pt-3 border-t border-white/10">{phase.details}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
