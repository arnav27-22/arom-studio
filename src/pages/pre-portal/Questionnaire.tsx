import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Download, Save, Send } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../components/ui/Section'
import { SEO } from '../../components/ui/SEO'
import Button from '../../components/ui/Button'
import { generatePDF } from '../../lib/generatePDF'
import { cn } from '../../lib/cn'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../../lib/emailjs'

const STORAGE_KEY = 'arom_questionnaire'

const sections = [
  { id: 'business', label: 'Business Info' },
  { id: 'goals', label: 'Goals & Audience' },
  { id: 'design', label: 'Design Preferences' },
  { id: 'features', label: 'Features & Pages' },
  { id: 'timeline', label: 'Timeline & Budget' },
  { id: 'notes', label: 'Additional Notes' },
]

const prompts: Record<string, string> = {
  business: 'Tell us about your business — industry, size, location, and what you do.',
  goals: 'What are your primary goals for this project? Who is your target audience?',
  design: 'Do you have design preferences? Style references, color schemes, websites you admire?',
  features: 'What features and pages do you need? Any integrations or special functionality?',
  timeline: 'What is your preferred timeline and budget range? Any launch deadlines?',
  notes: 'Anything else we should know? Questions, concerns, or special requirements?',
}

export default function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(0)
  const [content, setContent] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  }, [content])

  const updateContent = useCallback((id: string, value: string) => {
    setContent((prev) => ({ ...prev, [id]: value }))
    setSaved(false)
  }, [])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDownload = () => {
    generatePDF({
      filename: `Questionnaire_${new Date().toISOString().split('T')[0]}.pdf`,
      title: 'Project Questionnaire',
      sections: sections.map((s) => ({
        title: s.label,
        content: [content[s.id]?.trim() || '(Not provided)'],
      })),
    })
  }

  const handleSubmit = async () => {
    setSending(true)
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: 'Questionnaire Submission',
          subject: 'New Project Questionnaire',
          message: sections.map((s) => `=== ${s.label} ===\n${content[s.id]?.trim() || '(Not provided)'}`).join('\n\n'),
        },
        EMAILJS_CONFIG.PUBLIC_KEY,
      )
    } catch {
      // non-blocking
    }
    setSending(false)
    setSubmitted(true)
  }

  const section = sections[currentStep]
  const progress = ((currentStep + 1) / sections.length) * 100
  const allFilled = sections.every((s) => content[s.id]?.trim())

  if (submitted) {
    return (
      <main>
        <SEO title="Questionnaire Submitted" description="Your project questionnaire has been submitted to AROM STUDIO." />
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto glass rounded-[32px] p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-400" />
              </motion.div>
              <h1 className="font-heading text-3xl text-white mb-3">Questionnaire Submitted!</h1>
              <p className="text-sm text-white/60 font-body font-light mb-6">We have received your project requirements. Our team will review them and prepare a tailored proposal.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button>
                <a href="/contact" className="inline-flex items-center gap-2 text-sm font-body font-medium text-white/70 hover:text-white transition-colors rounded-full px-6 py-3">Contact Us <ChevronRight className="h-4 w-4" /></a>
              </div>
            </motion.div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main>
      <SEO title="Project Questionnaire" description="Help us understand your project better with our detailed questionnaire." />
      <Section>
        <Container>
          <SectionHeader badge="Questionnaire" title="Tell Us" highlightWord="Everything" description="Help us understand your project inside and out. Your answers shape your custom proposal." headingLevel="h1" />

          <div className="max-w-2xl mx-auto glass rounded-[32px] p-8 md:p-10">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>
              <span className="text-xs text-white/40 font-body whitespace-nowrap">{currentStep + 1}/{sections.length}</span>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {sections.map((s, i) => (
                <button key={s.id} onClick={() => setCurrentStep(i)}
                  className={cn('text-xs px-3 py-1.5 rounded-full transition-all font-body',
                    i === currentStep ? 'glass-strong text-white' : 'text-white/40 hover:text-white/70',
                    content[s.id]?.trim() && i !== currentStep ? 'border border-accent/30' : '',
                  )}>
                  {content[s.id]?.trim() && i !== currentStep ? <Check className="h-3 w-3 inline mr-1 text-accent" /> : null}
                  {s.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div key={section.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h2 className="font-heading text-2xl text-white mb-2">{section.label}</h2>
                <p className="text-sm text-white/50 font-body font-light mb-5">{prompts[section.id]}</p>
                <textarea value={content[section.id] || ''} onChange={(e) => updateContent(section.id, e.target.value)}
                  placeholder={`Enter your ${section.label.toLowerCase()} here...`} rows={10}
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 transition-colors font-body resize-y" />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-8">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(Math.min(sections.length - 1, currentStep + 1))} disabled={currentStep === sections.length - 1}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Button variant="primary" size="lg" onClick={handleSubmit} isLoading={sending} disabled={!allFilled}>
                <Send className="h-4 w-4" /> {sending ? 'Submitting...' : 'Submit Questionnaire'}
              </Button>
              {!allFilled && <p className="text-[10px] text-white/30 font-body mt-2">Please fill in all sections before submitting.</p>}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
