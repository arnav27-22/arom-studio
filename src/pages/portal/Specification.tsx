import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Share2, Check, ChevronDown, ChevronUp, Mail, MessageSquare } from 'lucide-react'
import Button from '../../components/ui/Button'
import { prdChapters, prdMeta } from '../../data/prd'
import { generatePDF } from '../../lib/generatePDF'

export default function Specification() {
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({ 0: true })
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ '1.1': true, '1.2': true, '1.3': true, '1.4': true })
  const [showShare, setShowShare] = useState(false)

  const toggleChapter = (i: number) => setExpandedChapters((p) => ({ ...p, [i]: !p[i] }))
  const toggleSection = (id: string) => setExpandedSections((p) => ({ ...p, [id]: !p[id] }))

  const getShareText = () => {
    return `AROM Studio Client Portal — Master PRD\nVersion: ${prdMeta.version} | ${prdMeta.date}\n${prdMeta.website}\n\nComprehensive specification covering ${prdMeta.totalFeatures} features across ${prdMeta.totalPhases} phases. Download the full document at ${window.location.href}`
  }

  const handleDownloadPDF = () => {
    const allSections = prdChapters.flatMap((ch) =>
      ch.sections.map((s) => ({
        title: `${s.id} — ${s.title}`,
        content: s.content,
      }))
    )
    generatePDF({
      filename: `AROM_Studio_PRD_v${prdMeta.version}.pdf`,
      title: prdMeta.title,
      sections: [
        { title: 'Document Info', content: [`Version: ${prdMeta.version}`, `Date: ${prdMeta.date}`, `Author: ${prdMeta.author}`, `Email: ${prdMeta.email}`, `Website: ${prdMeta.website}`, `Total Phases: ${prdMeta.totalPhases}`, `Total Features: ${prdMeta.totalFeatures}`] },
        ...allSections,
      ],
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Master Specification</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Full product requirements document for the AROM Studio Client Portal.</p>
      </div>

      {/* Meta info + actions */}
      <div className="glass rounded-[24px] p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 text-sm font-body">
            <p className="text-white/80"><FileText className="h-4 w-4 inline mr-2 text-accent" />{prdMeta.title}</p>
            <p className="text-white/50">Version {prdMeta.version} — {prdMeta.date}</p>
            <p className="text-white/50">{prdMeta.totalPhases} Phases · {prdMeta.totalFeatures} Features · 100+ Pages</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowShare(!showShare)}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
              {showShare && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 z-10 glass-strong rounded-[16px] p-3 min-w-[200px] space-y-2">
                  <a href={`https://wa.me/918767990061?text=${encodeURIComponent(getShareText())}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-accent transition-colors p-2 rounded-xl hover:bg-white/5">
                    <MessageSquare className="h-4 w-4 text-green-400" /> Share via WhatsApp
                  </a>
                  <a href={`mailto:?subject=${encodeURIComponent(prdMeta.title)}&body=${encodeURIComponent(getShareText())}`} className="flex items-center gap-2 text-sm text-white/80 hover:text-accent transition-colors p-2 rounded-xl hover:bg-white/5">
                    <Mail className="h-4 w-4 text-accent" /> Share via Email
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      {prdChapters.map((chapter, ci) => (
        <motion.div key={chapter.phase} className="mb-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
          {/* Phase header */}
          <button onClick={() => toggleChapter(ci)} className="w-full glass rounded-[24px] p-5 flex items-center justify-between group hover:border-white/15 transition-all text-left">
            <div>
              <span className="text-[10px] text-accent font-body uppercase tracking-[0.15em]">{chapter.phase}</span>
              <h2 className="font-heading text-xl text-white mt-0.5">{chapter.title}</h2>
            </div>
            {expandedChapters[ci] ? <ChevronUp className="h-5 w-5 text-white/40" /> : <ChevronDown className="h-5 w-5 text-white/40" />}
          </button>

          {/* Sections */}
          {expandedChapters[ci] && (
            <div className="mt-3 space-y-3 pl-4 md:pl-8">
              {chapter.sections.map((section) => (
                <div key={section.id}>
                  <button onClick={() => toggleSection(section.id)} className="w-full glass rounded-[20px] p-4 flex items-center justify-between group hover:border-white/15 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-accent/70 font-mono font-medium min-w-[3rem]">{section.id}</span>
                      <h3 className="font-heading text-base text-white group-hover:text-accent transition-colors">{section.title}</h3>
                    </div>
                    {expandedSections[section.id] ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                  </button>
                  {expandedSections[section.id] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                      <div className="glass rounded-[20px] p-5 mt-2 ml-8 md:ml-16">
                        <ul className="space-y-1.5">
                          {section.content.map((line, li) => (
                            <li key={li} className="text-sm text-white/65 font-body font-light leading-relaxed flex items-start gap-2">
                              {line.startsWith('🎯') ? (
                                <span className="text-accent shrink-0 mt-0.5">{line.split(':')[0]}</span>
                              ) : (
                                <span className="text-white/30 shrink-0 mt-1.5">—</span>
                              )}
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}

      {/* Bottom CTA */}
      <div className="glass rounded-[28px] p-8 text-center mt-8 mb-8">
        <Check className="h-8 w-8 text-green-400 mx-auto mb-4" />
        <h3 className="font-heading text-2xl text-white mb-2">Full Specification Complete</h3>
        <p className="text-sm text-white/50 font-body font-light mb-6 max-w-md mx-auto">
          {prdMeta.totalPhases} phases · {prdMeta.totalFeatures} features · 100+ pages of detailed specifications.
          Download the PDF to share with your development team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" size="lg" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" /> Download Full PRD (PDF)
          </Button>
          <a href="https://wa.me/918767990061?text=I%20have%20reviewed%20the%20AROM%20Studio%20Client%20Portal%20PRD.%20Let%27s%20discuss%20the%20next%20steps." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body font-medium text-white/70 hover:text-white transition-colors rounded-full px-6 py-3">
            <MessageSquare className="h-4 w-4 text-green-400" /> Send to WhatsApp
          </a>
          <a href={`mailto:?subject=${encodeURIComponent(prdMeta.title)}&body=${encodeURIComponent(`I've prepared the full AROM Studio Client Portal PRD. Download it here: ${window.location.href}`)}`} className="inline-flex items-center gap-2 text-sm font-body font-medium text-white/70 hover:text-white transition-colors rounded-full px-6 py-3">
            <Mail className="h-4 w-4 text-accent" /> Send to Email
          </a>
        </div>
      </div>
    </div>
  )
}
