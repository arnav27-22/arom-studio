import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, ArrowRight, User, Mail, Phone, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Section, Container } from '../../components/ui/Section'
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
  agreedToTerms: boolean
}

export default function Inquiry() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', company: '',
    projectType: '', budget: '', description: '',
    agreedToTerms: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [termsError, setTermsError] = useState(false)

  const update = (field: keyof FormData, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.description.trim()) return
    if (!form.agreedToTerms) { setTermsError(true); return }
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
          agreed_to_terms: 'Yes',
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
                <Link to="/proposal" className="inline-flex items-center gap-2 text-sm font-body font-medium text-white glass-strong rounded-full px-6 py-3 hover:shadow-lg transition-all">View Proposal <ArrowRight className="h-4 w-4" /></Link>
                <a href="https://wa.me/918767990061" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body font-medium text-white/70 hover:text-white transition-colors rounded-full px-6 py-3">Chat on WhatsApp</a>
              </div>
            </motion.div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main>
      <SEO title="Client Inquiry" description="Submit your project inquiry to AROM STUDIO." />
      <Section className="pt-28">
        <Container>
          <div className="max-w-2xl mx-auto mb-8">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Client Portal</span>
            <h1 className="font-heading text-4xl md:text-5xl text-white leading-[0.9] tracking-[-1px] mt-3">
              Client <span className="text-accent">Inquiry</span>
            </h1>
          </div>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="max-w-2xl mx-auto glass rounded-[32px] p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/50 font-body mb-2 block"><User className="h-3 w-3 inline mr-1" /> Name *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" required className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-2 block"><Mail className="h-3 w-3 inline mr-1" /> Email *</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" required className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-body" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/50 font-body mb-2 block"><Phone className="h-3 w-3 inline mr-1" /> Phone</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-2 block"><Building2 className="h-3 w-3 inline mr-1" /> Company</label>
                <input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Your company name" className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-body" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/50 font-body mb-2 block">Project Type *</label>
                <select value={form.projectType} onChange={(e) => update('projectType', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 font-body appearance-none">
                  <option value="" className="bg-bg">Select type</option>
                  {projectTypes.map((t) => <option key={t} className="bg-bg" value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-2 block">Budget Range</label>
                <select value={form.budget} onChange={(e) => update('budget', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50 font-body appearance-none">
                  <option value="" className="bg-bg">Select range</option>
                  {budgetRanges.map((b) => <option key={b} className="bg-bg" value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-xs text-white/50 font-body mb-2 block">Project Description *</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell us about your project — goals, features, timeline, and anything else we should know." rows={5} required className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-body resize-none" />
            </div>
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="inquiryAgreedToTerms"
                checked={form.agreedToTerms}
                onChange={(e) => { update('agreedToTerms', e.target.checked); setTermsError(false) }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border border-white/20 bg-white/5 accent-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <label htmlFor="inquiryAgreedToTerms" className="text-xs text-white/50 font-body leading-relaxed">
                I have read and agree to the{' '}
                <a href="/privacy" target="_blank" className="text-accent hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms" target="_blank" className="text-accent hover:underline">Terms &amp; Conditions</a>
                {' '}*
              </label>
            </div>
            {termsError && <p className="flex items-center gap-1 text-[11px] text-red-400 font-body -mt-2 mb-4">You must accept the Privacy Policy and Terms &amp; Conditions</p>}
            <Button type="submit" variant="secondary" size="lg" isLoading={sending} className="w-full"><Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Submit Inquiry'}</Button>
          </motion.form>
        </Container>
      </Section>
    </main>
  )
}
