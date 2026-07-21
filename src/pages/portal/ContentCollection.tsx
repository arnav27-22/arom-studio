import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Download, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { generatePDF } from '../../lib/generatePDF'

const STORAGE_KEY = 'arom_content_collection'

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer' },
  { id: 'seo', label: 'SEO Information' },
]

const sectionPrompts: Record<string, string> = {
  home: 'Tell us about your business. What is your value proposition? What headline and subheadline would you like on your homepage?',
  about: 'Write about your company story, mission, vision, and team. What makes you unique?',
  services: 'List the services or products you offer. Describe each one briefly.',
  portfolio: 'Describe past projects or client work. Include links if available.',
  testimonials: 'Share client testimonials or reviews you would like to feature.',
  faqs: 'List frequently asked questions and their answers.',
  contact: 'What contact information should be displayed? Address, phone, email, business hours?',
  footer: 'What information should appear in the footer? (copyright, links, social media, etc.)',
  seo: 'Provide target keywords, meta descriptions, and any specific SEO requirements.',
}

export default function ContentCollection() {
  const [currentStep, setCurrentStep] = useState(0)
  const [content, setContent] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [saved, setSaved] = useState(false)

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
      filename: `Content_Collection_${new Date().toISOString().split('T')[0]}.pdf`,
      title: 'Content Collection',
      sections: sections.map((s) => ({
        title: s.label,
        content: [content[s.id]?.trim() || '(Not provided)'],
      })),
    })
  }

  const section = sections[currentStep]
  const progress = ((currentStep + 1) / sections.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Content Collection</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Fill in your website content section by section. Your progress is saved automatically.</p>
      </div>

      <div className="glass rounded-[32px] p-8 md:p-10">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs text-white/40 font-body whitespace-nowrap">{currentStep + 1}/{sections.length}</span>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full transition-all font-body',
                i === currentStep ? 'glass-strong text-white' : 'text-white/40 hover:text-white/70',
                content[s.id]?.trim() && i !== currentStep ? 'border border-accent/30' : '',
              )}
            >
              {content[s.id]?.trim() && i !== currentStep ? <Check className="h-3 w-3 inline mr-1 text-accent" /> : null}
              {s.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-heading text-2xl text-white mb-2">{section.label}</h2>
            <p className="text-sm text-white/50 font-body font-light mb-5">{sectionPrompts[section.id]}</p>
            <textarea
              value={content[section.id] || ''}
              onChange={(e) => updateContent(section.id, e.target.value)}
              placeholder={`Enter your ${section.label.toLowerCase()} content here...`}
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 transition-colors font-body resize-y"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.min(sections.length - 1, currentStep + 1))}
              disabled={currentStep === sections.length - 1}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
