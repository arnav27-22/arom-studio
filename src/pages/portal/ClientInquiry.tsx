import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, AlertCircle, CheckCircle2, FileText, ExternalLink } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../../lib/emailjs'
import { GlassCard } from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { sanitize, validateContactForm, type ValidationErrors } from '../../lib/validation'

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function ClientInquiry() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    message: '',
    customService: '',
    customBudget: '',
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateContactForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          service: formData.service === 'other' ? formData.customService : formData.service,
          budget: formData.budget === 'custom' ? formData.customBudget : formData.budget,
          message: formData.message,
        },
        EMAILJS_CONFIG.PUBLIC_KEY,
      )
    } catch {
      // non-blocking
    }
    setSubmitted(true)
  }

  const inputClass = (field: keyof ValidationErrors) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/50' : 'border-white/10'} rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body`

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard hover={false} className="text-center py-12 px-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </motion.div>
            <h2 className="font-heading text-3xl text-white mb-2">Inquiry Submitted!</h2>
            <p className="text-sm text-white/60 font-body font-light mb-6">
              Your details have been sent to Arnav. Choose how to follow up:
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <a
                href={`https://wa.me/918767990061?text=${encodeURIComponent(
                  `Hi Arnav,\n\nI just submitted an inquiry on your website.\n\nName: ${sanitize(formData.name)}\nEmail: ${sanitize(formData.email)}\nService: ${sanitize(formData.service === 'other' ? formData.customService : formData.service)}\nBudget: ${sanitize(formData.budget === 'custom' ? formData.customBudget : formData.budget)}\nMessage: ${sanitize(formData.message)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-5 py-3 transition-all duration-300"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <a
                href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Project Inquiry from ${sanitize(formData.name)}`)}&body=${encodeURIComponent(
                  `Hi Arnav,\n\nI just submitted an inquiry on your website.\n\nName: ${sanitize(formData.name)}\nEmail: ${sanitize(formData.email)}\nPhone: ${sanitize(formData.phone)}\nService: ${sanitize(formData.service === 'other' ? formData.customService : formData.service)}\nBudget: ${sanitize(formData.budget === 'custom' ? formData.customBudget : formData.budget)}\nMessage: ${sanitize(formData.message)}`
                )}`}
                className="flex items-center justify-center gap-2 w-full bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-5 py-3 transition-all duration-300"
              >
                <MailIcon className="h-5 w-5" />
                Send Email
              </a>
            </div>
            <div className="border-t border-white/10 pt-5 mt-5 space-y-2">
              <p className="text-xs text-white/40 font-body uppercase tracking-wider">Next Steps:</p>
              <a
                href="/portal/proposal"
                className="flex items-center justify-between w-full glass-strong text-sm font-body font-medium text-white rounded-full px-5 py-3 hover:shadow-[0_0_20px_2px_rgba(78,133,191,0.3)] transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  View Your Proposal
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Client Inquiry Form</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">
          Tell us about your project. We'll get back to you within 24 hours.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard hover={false}>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-white/50 font-body mb-2">Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass('name')} placeholder="Your name" maxLength={60} autoComplete="name" />
                {errors.name && <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/50 font-body mb-2">Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="your@email.com" autoComplete="email" />
                {errors.email && <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-white/50 font-body mb-2">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
              <div>
                <label className="block text-xs text-white/50 font-body mb-2">Service Needed *</label>
                <select name="service" required value={formData.service} onChange={handleChange} className={inputClass('service') + ' appearance-none'}>
                  <option value="" className="bg-bg">Select a service</option>
                  <option value="business-website" className="bg-bg">Business Website</option>
                  <option value="ecommerce" className="bg-bg">E-commerce</option>
                  <option value="web-application" className="bg-bg">Web Application</option>
                  <option value="saas" className="bg-bg">SaaS Platform</option>
                  <option value="ui-ux" className="bg-bg">UI/UX Design</option>
                  <option value="redesign" className="bg-bg">Website Redesign</option>
                  <option value="seo" className="bg-bg">SEO Optimization</option>
                  <option value="other" className="bg-bg">Other</option>
                </select>
                {formData.service === 'other' && (
                  <input type="text" name="customService" value={formData.customService} onChange={handleChange} placeholder="Please specify..." className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body mt-2" />
                )}
                {errors.service && <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5"><AlertCircle className="h-3 w-3" /> {errors.service}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 font-body mb-2">Budget Range</label>
              <select name="budget" value={formData.budget} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body appearance-none">
                <option value="" className="bg-bg">Select budget range</option>
                <option value="180-380" className="bg-bg">$180 - $380 / ₹12K - ₹25K</option>
                <option value="380-680" className="bg-bg">$380 - $680 / ₹25K - ₹45K</option>
                <option value="680-1140" className="bg-bg">$680 - $1,140 / ₹45K - ₹75K</option>
                <option value="1140-plus" className="bg-bg">$1,140+ / ₹75K+</option>
                <option value="custom" className="bg-bg">Custom / Enterprise</option>
              </select>
              {formData.budget === 'custom' && (
                <input type="text" name="customBudget" value={formData.customBudget} onChange={handleChange} placeholder="Enter your budget..." className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body mt-2" />
              )}
            </div>

            <div>
              <label className="block text-xs text-white/50 font-body mb-2">Project Details *</label>
              <textarea name="message" required rows={4} value={formData.message} onChange={handleChange} className={inputClass('message') + ' resize-none'} placeholder="Tell us about your project..." maxLength={2000} />
              {errors.message && <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5"><AlertCircle className="h-3 w-3" /> {errors.message}</p>}
            </div>

            <Button type="submit" variant="secondary" size="lg" className="w-full">
              <Send className="h-4 w-4" /> Submit Inquiry
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}
