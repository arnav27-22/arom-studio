import { motion } from 'framer-motion'
import { Download, FileText, FileCheck, FileSpreadsheet, FileImage, Archive, File } from 'lucide-react'

const downloads = [
  { name: 'Project Proposal', desc: 'Initial project proposal and scope', icon: FileText, category: 'Documents' },
  { name: 'Service Agreement', desc: 'Signed service agreement', icon: FileCheck, category: 'Documents' },
  { name: 'Invoice — INV-001', desc: 'Initial deposit invoice', icon: FileSpreadsheet, category: 'Invoices' },
  { name: 'Assets Checklist', desc: 'Uploaded assets summary', icon: FileImage, category: 'Assets' },
  { name: 'Content Collection', desc: 'Completed content form', icon: FileText, category: 'Content' },
  { name: 'Design Approval', desc: 'Design approval report', icon: FileCheck, category: 'Design' },
  { name: 'Revision History', desc: 'All revision requests', icon: File, category: 'Revisions' },
  { name: 'Project Documents', desc: 'All project-related files', icon: Archive, category: 'Archive' },
  { name: 'Final ZIP', desc: 'Complete project source code', icon: Archive, category: 'Archive' },
]

const categories = [...new Set(downloads.map((d) => d.category))]

export default function Downloads() {
  const handleDownload = (name: string) => {
    const text = [
      `${name.toUpperCase()} — AROM STUDIO`,
      '================================',
      `This is a placeholder for: ${name}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      '',
      'AROM STUDIO',
      'aromstudio27@gmail.com',
      'https://aromstudio.vercel.app',
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Downloads</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Download project documents and files.</p>
      </div>

      {categories.map((cat, ci) => (
        <div key={cat} className="mb-8">
          <h3 className="text-xs text-white/40 font-body font-medium uppercase tracking-[0.15em] mb-3">{cat}</h3>
          <div className="space-y-2">
            {downloads.filter((d) => d.category === cat).map((dl, i) => {
              const Icon = dl.icon
              return (
                <motion.div
                  key={dl.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (ci * 3 + i) * 0.05 }}
                  className="glass rounded-[18px] p-4 flex items-center justify-between gap-3 hover:border-white/15 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-[10px] bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/90 font-body font-medium truncate">{dl.name}</p>
                      <p className="text-[10px] text-white/40 font-body truncate">{dl.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(dl.name)}
                    className="p-2 text-white/30 hover:text-accent transition-colors shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
