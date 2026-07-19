import type React from 'react'
import { useState } from 'react'
import { Mail, MessageCircle, Clock, Send, AlertCircle, FileText } from 'lucide-react'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateContactForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const safeName = sanitize(formData.name)
    const safeEmail = sanitize(formData.email)
    const safePhone = sanitize(formData.phone)
    const safeService = sanitize(formData.service)
    const safeBudget = sanitize(formData.budget)
    const safeMessage = sanitize(formData.message)

    const msgBody = [
      `Hi Arnav,`,
      ``,
      `I'm interested in discussing a web project.`,
      ``,
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      `Phone: ${safePhone}`,
      `Service: ${safeService}`,
      `Budget: ${safeBudget}`,
      `Message: ${safeMessage}`,
    ].join('%0A')

    window.open(`https://wa.me/918767990061?text=${encodeURIComponent(msgBody.replace(/%0A/g, '\n'))}`, '_blank')
    window.location.href = `mailto:aromstudio27@gmail.com?subject=Project Inquiry from ${encodeURIComponent(safeName)}&body=${encodeURIComponent(msgBody.replace(/%0A/g, '\n'))}`
    setSubmitted(true)
  }

  const inputClass = (field: keyof ValidationErrors) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/50' : 'border-white/10'} rounded-[18px] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors font-body`

  return (
    <main className="pt-32">
      <SEO
        title="Contact"
        description="Get in touch with AROM Studio. Contact us via email at aromstudio27@gmail.com or WhatsApp at +91 8767990061. We respond within 24 hours."
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
                {submitted ? (
                  <GlassCard hover={false} className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                      <Send className="h-8 w-8 text-accent" />
                    </div>
                    <h2 className="font-heading text-3xl text-white mb-3">Thank You!</h2>
                    <p className="text-sm text-white/60 font-body font-light max-w-md mx-auto">
                      Your message has been received. Arnav will review it and get back to you within 24 hours.
                    </p>
                  </GlassCard>
                ) : (
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
                        className="glass-strong text-sm font-body font-medium text-white rounded-full px-6 py-3 inline-flex items-center gap-2 hover:shadow-[0_0_20px_2px_rgba(78,133,191,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Send className="h-4 w-4" />
                        Send Message
                      </button>
                    </form>
                  </GlassCard>
                )}
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
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.2}>
                <GlassCard hover={false}>
                  <Mail className="h-5 w-5 text-accent mb-3" />
                  <h3 className="font-heading text-lg text-white mb-1">Email</h3>
                  <a href={SOCIAL_LINKS.email} className="text-sm text-white/60 hover:text-accent transition-colors font-body">
                    aromstudio27@gmail.com
                  </a>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.3}>
                <GlassCard hover={false}>
                  <MessageCircle className="h-5 w-5 text-whatsapp mb-3" />
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
    </main>
  )
}
