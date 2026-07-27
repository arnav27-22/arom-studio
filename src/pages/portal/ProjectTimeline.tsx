import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, Circle, ChevronDown, Route } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Phase {
  name: string
  status: 'completed' | 'active' | 'upcoming'
  duration: string
  desc: string
  details: string
}

const defaultPhases: Phase[] = []

export default function ProjectTimeline() {
  const [phases] = useState<Phase[]>(defaultPhases)
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Project Timeline</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">Track your project progress from start to finish.</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-6">
          {phases.length === 0 ? (
            <div className="pl-12 glass rounded-[20px] p-12 flex flex-col items-center justify-center gap-3">
              <Route className="h-10 w-10 text-white/20" />
              <p className="text-white/30 font-body text-sm">No timeline set yet. Your project roadmap will appear here once it's ready.</p>
            </div>
          ) : phases.map((phase, i) => {
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
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}