import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Circle } from 'lucide-react'
import { cn } from '../../lib/cn'

const phases = [
  { name: 'Discovery', status: 'completed', duration: 'Week 1', desc: 'Understanding goals, audience, and requirements.' },
  { name: 'Planning', status: 'active', duration: 'Week 2', desc: 'Sitemap, wireframes, and project roadmap.' },
  { name: 'UI Design', status: 'upcoming', duration: 'Weeks 3-4', desc: 'Visual design, prototyping in Figma.' },
  { name: 'Development', status: 'upcoming', duration: 'Weeks 5-7', desc: 'Building with Next.js, TypeScript, Tailwind CSS.' },
  { name: 'Testing', status: 'upcoming', duration: 'Week 8', desc: 'QA, performance benchmarking, accessibility.' },
  { name: 'Revision', status: 'upcoming', duration: 'Week 9', desc: 'Client feedback and refinements.' },
  { name: 'Deployment', status: 'upcoming', duration: 'Week 10', desc: 'Launch, CDN, SSL, analytics setup.' },
  { name: 'Completed', status: 'upcoming', duration: '', desc: 'Project handover and 1 Year Support begins.' },
]

export default function ProjectTimeline() {
  const completed = phases.filter((p) => p.status === 'completed').length
  const total = phases.length
  const progress = (completed / total) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Project Timeline</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Track your project progress from start to finish.</p>
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
        <p className="text-xs text-white/40 font-body mt-3">
          Estimated completion: <span className="text-white/70">Week 10</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-6">
          {phases.map((phase, i) => {
            const Icon = phase.status === 'completed' ? CheckCircle2 : phase.status === 'active' ? Clock : Circle
            return (
              <motion.div
                key={phase.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
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
                <div className={cn(
                  'glass rounded-[20px] p-5 transition-all duration-300',
                  phase.status === 'active' ? 'border border-accent/30' : '',
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      'font-heading text-lg',
                      phase.status === 'completed' ? 'text-white/60' : 'text-white',
                    )}>{phase.name}</h3>
                    {phase.duration && (
                      <span className="text-[10px] text-white/40 font-body uppercase tracking-[0.1em]">{phase.duration}</span>
                    )}
                  </div>
                  <p className={cn(
                    'text-xs font-body font-light',
                    phase.status === 'completed' ? 'text-white/40' : 'text-white/60',
                  )}>{phase.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
