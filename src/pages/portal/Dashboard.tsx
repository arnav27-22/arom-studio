import { motion } from 'framer-motion'
import {
  Clock, CheckCircle2, AlertCircle, Upload, CreditCard, FileText,
  RefreshCw, MessageSquare, Download, ArrowUpRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

const statCards = [
  { icon: Clock, label: 'Project Status', value: 'In Progress', sub: 'Discovery Phase', href: '/portal/timeline', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: CheckCircle2, label: 'Timeline', value: 'Week 1 of 8', sub: 'On Track', href: '/portal/timeline', color: 'from-green-500/20 to-emerald-500/20' },
  { icon: AlertCircle, label: 'Pending Actions', value: '3 Items', sub: 'Assets upload, Content, Design approval', href: '/portal/assets', color: 'from-amber-500/20 to-orange-500/20' },
  { icon: Upload, label: 'Uploaded Assets', value: '0 Files', sub: 'No assets uploaded yet', href: '/portal/assets', color: 'from-purple-500/20 to-pink-500/20' },
  { icon: CreditCard, label: 'Payments', value: '$0', sub: 'Invoice: $380', href: '/portal/payments', color: 'from-accent/20 to-blue-500/20' },
  { icon: FileText, label: 'Invoices', value: '1 Invoice', sub: 'Pending', href: '/portal/invoices', color: 'from-violet-500/20 to-purple-500/20' },
  { icon: RefreshCw, label: 'Revision Requests', value: '0', sub: 'No revisions yet', href: '/portal/revisions', color: 'from-rose-500/20 to-red-500/20' },
  { icon: MessageSquare, label: 'Messages', value: '2 New', sub: 'Unread messages', href: '/portal/chat', color: 'from-sky-500/20 to-indigo-500/20' },
  { icon: Download, label: 'Downloads', value: '0', sub: 'No downloads yet', href: '/portal/downloads', color: 'from-teal-500/20 to-cyan-500/20' },
]

export default function Dashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Welcome back!</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Your project dashboard — everything you need, in one place.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={item}>
              <Link to={card.href} className="block group">
                <div className={cn(
                  'glass rounded-[24px] p-5 relative overflow-hidden transition-all duration-300',
                  'hover:border-white/20 group-hover:-translate-y-1 group-hover:scale-[1.01]',
                )}>
                  <div className={cn('absolute inset-0 opacity-30 bg-gradient-to-br rounded-[24px]', card.color)} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-[12px] glass flex items-center justify-center">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-accent transition-colors" />
                    </div>
                    <p className="text-[11px] text-white/40 font-body font-medium uppercase tracking-[0.1em] mb-1">{card.label}</p>
                    <p className="font-heading text-2xl text-white tracking-[-0.5px]">{card.value}</p>
                    <p className="text-xs text-white/50 font-body font-light mt-1 line-clamp-1">{card.sub}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
