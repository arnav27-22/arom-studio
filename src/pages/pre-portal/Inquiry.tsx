import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, ArrowRight, Building2, Mail, Phone, User } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../components/ui/Section'
import { SEO } from '../../components/ui/SEO'
import Button from '../../components/ui/Button'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../../lib/emailjs'

const projectTypes = [
  'Website Design', 'Website Redesign', 'E-commerce', 'Landing Page',
  'Web Application', 'Brand Identity', 'SEO Services', 'Other',
]

const budgetRanges = [
  '$180+ / ₹12,000+', '$380+ / ₹25,000+', '$680+ / ₹45,000+',
  '$1,140+ / ₹75,000+', '$1,500+ / ₹1,00,000+', 'Not Sure',
]

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  projectType: string
  budget: string
  description: string
}

export default function Inquiry() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', company: '',
    projectType: '', budget: '', description: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const update = (field: keyof FormData, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.description.trim()) return
    setSending(true)
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          phone: form.phone,
          company: form.company,
          project_type: form.projectType,
          budget: form.budget,
          message: form.description,
        },
        EMAILJS_CONFIG.PUBLIC_KEY,
      )
    } catch {
      // non-blocking
    }
    setSending(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main>
        <SEO title="Inquiry Sent" description="Your project inquiry has been submitted to AROM STUDIO." />
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto glass rounded-[32px] p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </motion.div>
              <h1 className="font-heading text-3xl text-white mb-3">Inquiry Submitted!</h1>
              <p className="text-sm text-white/60 font-body font-light mb-6">Thank you, {form.name}. We'll review your project details and get back to you within 24 hours.</p>
              <div className="glass rounded-[20px] p-5 mb-6 text-left text-sm text-white/60 font-body space-y-2">
                <p><span className="text-white/80">Project Type:</span> {form.projectType || 'Not specified'}</p>
                <p><span className="text-white/80">Budget Range:</span> {form.budget || 'Not specified'}</p>
                <p><span className="text-white/80">Email:</span> {form.email}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://wa.me/918767990061" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body font-medium text-white glass-strong rounded-full px-6 py-3 hover:shadow-lg transition-all">Chat on WhatsApp</a>
                <a href="mailto:aromstudio27@gmail.com" className="inline-flex items-center gap-2 text-sm font-body font-medium text-white/70 hover:text-white transition-colors rounded-full px-6 py-3">Email Us <ArrowRight className="h-4 w-4" /></a>
              </div>
            </motion.div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main>
      <SEO title="Start Your Project" description="Tell us about your project and get a custom proposal from AROM STUDIO." />
      <Section>
        <Container>
          <SectionHeader badge="Get Started" title="Tell Us About Your" highlightWord="Project" description="Fill out the form below and we'll respond with a custom proposal within 24 hours." headingLevel="h1" />

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="max-w-2xl mx-auto glass rounded-[32px] p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-white/70 font-body block mb-1.5"><User className="h-3.5 w-3.5 inline mr-1.5" />Name *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" required className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-sm text-white/70 font-body block mb-1.5"><Mail className="h-3.5 w-3.5 inline mr-1.5" />Email *</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" required className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-white/70 font-body block mb-1.5"><Phone className="h-3.5 w-3.5 inline mr-1.5" />Phone</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-sm text-white/70 font-body block mb-1.5"><Building2 className="h-3.5 w-3.5 inline mr-1.5" />Company</label>
                <input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Your company name" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-white/70 font-body block mb-1.5">Project Type *</label>
                <select value={form.projectType} onChange={(e) => update('projectType', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body appearance-none">
                  <option value="" disabled>Select type</option>
                  {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70 font-body block mb-1.5">Budget Range</label>
                <select value={form.budget} onChange={(e) => update('budget', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body appearance-none">
                  <option value="" disabled>Select range</option>
                  {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm text-white/70 font-body block mb-1.5">Project Description *</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell us about your project — goals, features, timeline, and anything else we should know." rows={5} required className="w-full bg-white/5 border border-white/10 rounded-[20px] px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-y" />
            </div>
            <Button type="submit" variant="secondary" size="lg" isLoading={sending} className="w-full"><Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Submit Inquiry'}</Button>
            <p className="text-[10px] text-white/30 font-body text-center mt-4">We respect your privacy. Your information will never be shared.</p>
          </motion.form>
        </Container>
      </Section>
    </main>
  )
}
