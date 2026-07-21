import { motion } from 'framer-motion'
import { Globe, Lock, Server, Link2, FileText, Shield, Clock, Download, ExternalLink } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { generateHandoverPDF } from '../../lib/professionalPDF'

const handoverItems = [
  { label: 'Website URL', value: 'https://yoursite.com', icon: Globe, color: 'from-blue-500/20 to-cyan-500/20' },
  { label: 'Admin Login', value: 'https://yoursite.com/admin', icon: Lock, color: 'from-purple-500/20 to-pink-500/20' },
  { label: 'Hosting Provider', value: 'Vercel + Cloudflare', icon: Server, color: 'from-green-500/20 to-emerald-500/20' },
  { label: 'Domain Name', value: 'yoursite.com', icon: Link2, color: 'from-amber-500/20 to-orange-500/20' },
  { label: 'Source Code', value: 'GitHub Repository', icon: ExternalLink, color: 'from-slate-500/20 to-gray-500/20' },
  { label: 'Documentation', value: 'Project documentation & guides', icon: FileText, color: 'from-indigo-500/20 to-violet-500/20' },
]

const supportInfo = [
  { label: 'Warranty', value: '30 Days', icon: Shield },
  { label: 'Support Period', value: '1 Year Included', icon: Clock },
  { label: 'Maintenance Plan', value: 'Optional — Contact us', icon: Server },
]

export default function Handover() {
  const handleDownloadPDF = () => {
    generateHandoverPDF({
      clientName: 'Client',
      projectName: 'Website Project',
      websiteUrl: 'https://yoursite.com',
      adminUrl: 'https://yoursite.com/admin',
      hostingProvider: 'Vercel + Cloudflare',
      domainName: 'yoursite.com',
      sourceCode: 'GitHub Repository',
      documentation: 'Project documentation & guides',
      warrantyPeriod: '30 Days',
      supportPeriod: '1 Year Included',
      maintenancePlan: 'Optional — Contact us',
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Website Handover</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">All project details in one place. Estimated handover: 2-4 weeks from project start.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4" /> Handover PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {handoverItems.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-[20px] p-5 relative overflow-hidden group"
            >
              <div className={cn('absolute inset-0 opacity-20 bg-gradient-to-br rounded-[20px]', item.color)} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-accent" />
                  <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-[10px] text-white/40 font-body uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm text-white/90 font-body font-medium break-all">{item.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <h3 className="font-heading text-xl text-white mb-4">Support & Warranty</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {supportInfo.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass rounded-[18px] p-4 text-center"
            >
              <Icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-white/40 font-body">{item.label}</p>
              <p className="text-sm text-white/90 font-heading mt-1">{item.value}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4" /> Download Source ZIP
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4" /> Download User Guide
        </Button>
      </div>
    </div>
  )
}
