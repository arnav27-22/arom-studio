import type React from 'react'
import { useState } from 'react'
import { Clock, Send, AlertCircle, FileText, X, ExternalLink } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../lib/emailjs'

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
import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { FadeIn } from '../components/motion/FadeIn'
import { SOCIAL_LINKS } from '../constants/navigation'
import { sanitize, validateContactForm, type ValidationErrors } from '../lib/validation'

export default function Contact() {
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
  const [showModal, setShowModal] = useState(false)

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
      // Email send is non-blocking — modal appears either way
    }

    setShowModal(true)
  }

  const inputClass = (field: keyof ValidationErrors) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/50' : 'border-white/10'} rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body`

  return (
    <main className="pt-32">
      <SEO
        title="Contact"
        description="Get in touch with AROM STUDIO. Contact us via email at aromstudio27@gmail.com or WhatsApp at +91 8767990061. We respond within 24 hours."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mb-12">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Contact</span>
            <h1 className="font-heading text-5xl md:text-7xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Let&apos;s build
              <br />
              <span className="text-accent">something great</span>
            </h1>
            <p className="text-base text-white/60 font-body font-light max-w-xl">
              Tell us about your project. We&apos;ll get back to you within 24 hours with a personalized proposal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <FadeIn>
                <GlassCard hover={false}>
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs text-white/50 font-body mb-2">Name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClass('name')}
                            placeholder="Your name"
                            maxLength={60}
                            autoComplete="name"
                          />
                          {errors.name && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5">
                              <AlertCircle className="h-3 w-3" /> {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 font-body mb-2">Email *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClass('email')}
                            placeholder="your@email.com"
                            autoComplete="email"
                          />
                          {errors.email && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5">
                              <AlertCircle className="h-3 w-3" /> {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs text-white/50 font-body mb-2">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClass('phone')}
                            placeholder="+91 98765 43210"
                            autoComplete="tel"
                          />
                          {errors.phone && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5">
                              <AlertCircle className="h-3 w-3" /> {errors.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 font-body mb-2">Service Needed *</label>
                          <select
                            name="service"
                            required
                            value={formData.service}
                            onChange={handleChange}
                            className={inputClass('service') + ' appearance-none'}
                          >
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
                            <input
                              type="text"
                              name="customService"
                              value={formData.customService}
                              onChange={handleChange}
                              placeholder="Please specify your service..."
                              className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body mt-2"
                            />
                          )}
                          {errors.service && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5">
                              <AlertCircle className="h-3 w-3" /> {errors.service}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 font-body mb-2">Budget Range</label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body appearance-none"
                        >
                          <option value="" className="bg-bg">Select budget range</option>
                          <option value="12000-25000" className="bg-bg">₹12,000 - ₹25,000</option>
                          <option value="25000-45000" className="bg-bg">₹25,000 - ₹45,000</option>
                          <option value="45000-75000" className="bg-bg">₹45,000 - ₹75,000</option>
                          <option value="75000-plus" className="bg-bg">₹75,000+</option>
                          <option value="custom" className="bg-bg">Custom / Enterprise</option>
                        </select>
                        {formData.budget === 'custom' && (
                          <input
                            type="text"
                            name="customBudget"
                            value={formData.customBudget}
                            onChange={handleChange}
                            placeholder="Enter your budget..."
                            className="w-full bg-white/5 border border-white/10 rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body mt-2"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 font-body mb-2">Message *</label>
                        <textarea
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          className={inputClass('message') + ' resize-none'}
                          placeholder="Tell us about your project..."
                          maxLength={2000}
                        />
                        {errors.message && (
                          <p className="flex items-center gap-1 text-[11px] text-red-400 font-body mt-1.5">
                            <AlertCircle className="h-3 w-3" /> {errors.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-accent text-white text-sm md:text-base font-body font-semibold rounded-full px-8 py-3.5 inline-flex items-center gap-2 shadow-[0_0_20px_4px_rgba(78,133,191,0.3)] hover:shadow-[0_0_30px_6px_rgba(78,133,191,0.5)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                      >
                        <Send className="h-4 w-4" />
                        Send Message
                      </button>
                    </form>
                  </GlassCard>
              </FadeIn>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <FadeIn delay={0.1}>
                <GlassCard hover={false}>
                  <FileText className="h-5 w-5 text-accent mb-3" />
                  <h3 className="font-heading text-sm text-white mb-1">Client Inquiry Form</h3>
                  <p className="text-xs text-white/60 font-body font-light mb-4">
                    Prefer a structured form? Fill out our detailed inquiry form and we'll get back to you within 24–48 hours.
                  </p>
                  <a
                    href="https://forms.gle/fGwvkaTRdtb5ZH3x6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-light transition-colors duration-200 font-body font-medium inline-flex items-center gap-1"
                  >
                    Open Form <FileText className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://forms.gle/kBeLEHtnouuBXBsk6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-light transition-colors duration-200 font-body font-medium inline-flex items-center gap-1 mt-2"
                  >
                    AROM Studio – Project Proposal <FileText className="h-3.5 w-3.5" />
                  </a>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.2}>
                <GlassCard hover={false}>
                  <MailIcon className="h-5 w-5 text-accent mb-3" />
                  <h3 className="font-heading text-lg text-white mb-1">Email</h3>
                  <a href={SOCIAL_LINKS.email} className="text-sm text-white/60 hover:text-accent transition-colors font-body">
                    aromstudio27@gmail.com
                  </a>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.3}>
                <GlassCard hover={false}>
                  <WhatsAppIcon className="h-5 w-5 text-whatsapp mb-3" />
                  <h3 className="font-heading text-lg text-white mb-1">WhatsApp</h3>
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-whatsapp transition-colors font-body"
                  >
                    Chat with Arnav
                  </a>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.4}>
                <GlassCard hover={false}>
                  <Clock className="h-5 w-5 text-accent mb-3" />
                  <h3 className="font-heading text-lg text-white mb-1">Response Time</h3>
                  <p className="text-sm text-white/60 font-body font-light">
                    We typically respond within 24 hours on business days.
                  </p>
                </GlassCard>
              </FadeIn>
            </div>
          </div>
        </Container>
      </Section>
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md">
            <GlassCard hover={false} className="text-center py-10 px-8">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-5">
                <Send className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-heading text-3xl text-white mb-2">Message Sent!</h2>
              <p className="text-sm text-white/60 font-body font-light mb-6">
                Your details have been sent to Arnav. Choose how to follow up:
              </p>
              <div className="space-y-3">
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
                <p className="text-xs text-white/40 font-body uppercase tracking-wider">
                  Also, check out:
                </p>
                <a
                  href="https://forms.gle/fGwvkaTRdtb5ZH3x6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full glass-strong text-sm font-body font-medium text-white rounded-full px-5 py-3 hover:shadow-[0_0_20px_2px_rgba(78,133,191,0.3)] transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    Open Form
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                </a>
                <a
                  href="https://forms.gle/kBeLEHtnouuBXBsk6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full glass-strong text-sm font-body font-medium text-white rounded-full px-5 py-3 hover:shadow-[0_0_20px_2px_rgba(78,133,191,0.3)] transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    AROM Studio – Project Proposal
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                </a>
                <p className="text-[11px] text-white/30 font-body pt-2">
                  More forms &amp; PDFs will be added here soon.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </main>
  )
}
