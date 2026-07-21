import { motion } from 'framer-motion'
import { FileText, Download, Calendar, DollarSign } from 'lucide-react'
import { cn } from '../../lib/cn'

const invoices = [
  { id: 'INV-001', issueDate: '2026-07-21', dueDate: '2026-07-28', amount: '$380', status: 'pending', description: 'Professional Website — Initial Deposit' },
  { id: 'INV-002', issueDate: '2026-08-15', dueDate: '2026-08-22', amount: '$190', status: 'upcoming', description: 'Professional Website — Progress Payment' },
  { id: 'INV-003', issueDate: '2026-09-01', dueDate: '2026-09-08', amount: '$190', status: 'upcoming', description: 'Professional Website — Final Payment' },
]

const statusStyles: Record<string, string> = {
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  upcoming: 'bg-white/10 text-white/50 border-white/10',
}

const handleDownload = (inv: typeof invoices[0]) => {
  const text = [
    'INVOICE — AROM STUDIO',
    '=====================',
    `Invoice #: ${inv.id}`,
    `Date: ${inv.issueDate}`,
    `Due: ${inv.dueDate}`,
    `Description: ${inv.description}`,
    `Amount: ${inv.amount}`,
    `Status: ${inv.status.toUpperCase()}`,
    '=====================',
    'AROM STUDIO',
    'aromstudio27@gmail.com',
    'https://aromstudio.vercel.app',
  ].join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${inv.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Invoices() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Invoices</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">View and download your invoices.</p>
      </div>

      <div className="space-y-3">
        {invoices.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-[10px] bg-accent/20 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-heading text-base text-white">{inv.id}</h4>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-body font-medium border', statusStyles[inv.status])}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-white/50 font-body mt-0.5 truncate">{inv.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/40 font-body shrink-0">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{inv.issueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-white/80 font-heading text-sm">{inv.amount}</span>
              </div>
              <button
                onClick={() => handleDownload(inv)}
                className="flex items-center gap-1.5 text-accent hover:text-white transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
