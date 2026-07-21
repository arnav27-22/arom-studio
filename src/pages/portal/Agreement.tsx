import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, CheckCircle2, Mail, Edit, Eye } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { generateAgreementPDF } from '../../lib/professionalPDF'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

type SupportPeriod = '7' | '15' | '30'

interface AgreementData {
  clientName: string
  clientAddress: string
  clientEmail: string
  clientPhone: string
  effectiveDate: string
  projectDescription: string
  scopeItems: string[]
  timeline: string
  advancePercentage: string
  finalPercentage: string
  supportPeriod: SupportPeriod
  selectedServices: string[]
}

const defaultData: AgreementData = {
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  projectDescription: '',
  scopeItems: ['Website Design', 'Website Development', 'Responsive Design'],
  timeline: '4-6 Weeks',
  advancePercentage: '50',
  finalPercentage: '50',
  supportPeriod: '30',
  selectedServices: [],
}

const availableServices = [
  'Website Design', 'Website Development', 'Responsive Design',
  'Landing Pages', 'E-commerce Development', 'Custom Features',
  'CMS Integration', 'SEO Optimization', 'Website Deployment',
]

export default function Agreement() {
  const [data, setData] = useState<AgreementData>(defaultData)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [generated, setGenerated] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const update = (field: keyof AgreementData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleService = (service: string) => {
    setData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }))
  }

  const handleGeneratePDF = () => {
    generateAgreementPDF({
      clientName: data.clientName,
      clientAddress: data.clientAddress,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      effectiveDate: data.effectiveDate,
      projectDescription: data.projectDescription,
      selectedServices: data.selectedServices,
      timeline: data.timeline,
      advancePercentage: data.advancePercentage,
      finalPercentage: data.finalPercentage,
      supportPeriod: data.supportPeriod,
    })
    setGenerated(true)
  }

  const effDateStr = data.effectiveDate
    ? new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '____'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Website Development Agreement</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">Fill in your details, review, and download as PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === 'edit' ? 'secondary' : 'outline'} size="sm" onClick={() => setMode('edit')}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant={mode === 'preview' ? 'secondary' : 'outline'} size="sm" onClick={() => setMode('preview')}>
            <Eye className="h-4 w-4" /> Preview
          </Button>
        </div>
      </div>

      {mode === 'edit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard hover={false} className="p-6 md:p-8 mb-6">
            <h3 className="font-heading text-xl text-white mb-6">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Client / Company Name *</label>
                <input value={data.clientName} onChange={(e) => update('clientName', e.target.value)} placeholder="e.g. ABC Corporation" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Effective Date</label>
                <input type="date" value={data.effectiveDate} onChange={(e) => update('effectiveDate', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Email</label>
                <input type="email" value={data.clientEmail} onChange={(e) => update('clientEmail', e.target.value)} placeholder="client@email.com" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Phone</label>
                <input type="tel" value={data.clientPhone} onChange={(e) => update('clientPhone', e.target.value)} placeholder="+91 98765 43210" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 font-body mb-1 block">Address</label>
                <input value={data.clientAddress} onChange={(e) => update('clientAddress', e.target.value)} placeholder="Client's address" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            </div>

            <h3 className="font-heading text-xl text-white mb-4">Project Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 font-body mb-1 block">Project Description</label>
                <textarea value={data.projectDescription} onChange={(e) => update('projectDescription', e.target.value)} placeholder="Briefly describe the project..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Estimated Timeline</label>
                <input value={data.timeline} onChange={(e) => update('timeline', e.target.value)} placeholder="e.g. 4-6 Weeks" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            </div>

            <h3 className="font-heading text-xl text-white mb-4">Services Included</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {availableServices.map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-body transition-all ${
                    data.selectedServices.includes(service)
                      ? 'bg-accent/20 border-accent/50 text-accent'
                      : 'border-white/10 text-white/50 hover:border-white/30'
                  }`}
                >
                  {data.selectedServices.includes(service) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                  {service}
                </button>
              ))}
            </div>

            <h3 className="font-heading text-xl text-white mb-4">Payment Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Advance Payment (%)</label>
                <input value={data.advancePercentage} onChange={(e) => update('advancePercentage', e.target.value)} placeholder="50" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Final Payment (%)</label>
                <input value={data.finalPercentage} onChange={(e) => update('finalPercentage', e.target.value)} placeholder="50" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            </div>

            <h3 className="font-heading text-xl text-white mb-4">Support Period</h3>
            <div className="flex gap-3 mb-6">
              {(['7', '15', '30'] as SupportPeriod[]).map((days) => (
                <button
                  key={days}
                  onClick={() => update('supportPeriod', days)}
                  className={`text-sm px-5 py-2.5 rounded-full border font-body transition-all ${
                    data.supportPeriod === days
                      ? 'bg-accent/20 border-accent/50 text-accent'
                      : 'border-white/10 text-white/50 hover:border-white/30'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <Button variant="secondary" size="lg" onClick={handleGeneratePDF} className="w-full">
              <Download className="h-4 w-4" /> Download Agreement as PDF
            </Button>

            {generated && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-white/60 font-body text-center mb-4">Share this agreement via:</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/918767990061?text=${encodeURIComponent(
                      `Hi Arnav,\n\nI've reviewed the Website Development Agreement. Here are my details:\n\nClient: ${data.clientName}\nEmail: ${data.clientEmail}\nDate: ${effDateStr}\n\nPlease find the signed PDF attached.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-5 py-3 transition-all"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Share on WhatsApp
                  </a>
                  <a
                    href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Website Development Agreement - ${data.clientName || 'Client'}`)}&body=${encodeURIComponent(
                      `Hi Arnav,\n\nI've reviewed and accepted the Website Development Agreement.\n\nClient: ${data.clientName}\nEmail: ${data.clientEmail}\nPhone: ${data.clientPhone}\nDate: ${effDateStr}\n\nPlease find the signed PDF attached.\n\nThanks!`
                    )}`}
                    className="flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-5 py-3 transition-all"
                  >
                    <Mail className="h-5 w-5" />
                    Share via Email
                  </a>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {mode === 'preview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} ref={previewRef}>
          <GlassCard hover={false} className="p-8 md:p-10 mb-6 text-sm leading-relaxed text-white/80 font-body">
            <div className="max-w-none">
              <div className="border-b-2 border-accent pb-4 mb-6">
                <h2 className="font-heading text-2xl text-accent">AROM Studio</h2>
                <p className="text-sm text-white/50">Website Development Agreement</p>
              </div>

              <h3 className="font-heading text-lg text-white mb-3">Parties</h3>
              <p className="mb-2">This Website Development Agreement ("Agreement") is entered into between:</p>
              <p className="mb-1"><strong>Agency:</strong> AROM Studio</p>
              <p className="mb-1"><strong>Client:</strong> {data.clientName || <span className="text-white/30 italic">[Client Name]</span>}</p>
              {data.clientAddress && <p className="mb-1">Address: {data.clientAddress}</p>}
              {(data.clientEmail || data.clientPhone) && <p className="mb-3">Contact: {data.clientEmail}{data.clientEmail && data.clientPhone ? ' | ' : ''}{data.clientPhone}</p>}
              <p className="mb-6">This Agreement becomes effective from <strong>{effDateStr}</strong>.</p>

              <h3 className="font-heading text-lg text-white mb-3">1. Project Overview</h3>
              <p className="mb-2">The Client has requested AROM Studio to design and/or develop a website.</p>
              <p className="mb-6">The specific project requirements, deliverables, pricing, and timeline will be defined in the approved Project Proposal.{data.projectDescription ? <span className="block mt-1">Project Description: {data.projectDescription}</span> : ''}</p>

              <h3 className="font-heading text-lg text-white mb-3">2. Scope of Work</h3>
              <p className="mb-2">AROM Studio agrees to provide the services specified in the approved Project Proposal.</p>
              <p className="mb-2">Services may include:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1">
                {(data.selectedServices.length > 0 ? data.selectedServices : availableServices).map((s) => <li key={s}>{s}</li>)}
              </ul>
              <p className="mb-6">Any work outside the agreed scope shall be considered additional work and may require a separate quotation.</p>

              <h3 className="font-heading text-lg text-white mb-3">3. Project Timeline</h3>
              <p className="mb-2">The estimated project duration is <strong>{data.timeline || '[Timeline]'}</strong>.</p>
              <p className="mb-1">The timeline may change if:</p>
              <ul className="list-disc pl-5 mb-1 space-y-1">
                <li>Client delays providing content or assets.</li>
                <li>Additional features are requested.</li>
                <li>Project requirements change.</li>
                <li>Third-party services cause delays.</li>
              </ul>
              <p className="mb-6">AROM Studio will communicate any timeline changes as early as possible.</p>

              <h3 className="font-heading text-lg text-white mb-3">4. Payment Terms</h3>
              <p className="mb-2">Payment schedule: <strong>{data.advancePercentage || '50'}%</strong> Advance before project commencement. <strong>{data.finalPercentage || '50'}%</strong> Final Payment before final website delivery or deployment.</p>
              <p className="mb-2">Additional work requested after project approval will be charged separately.</p>
              <p className="mb-6">Payments are due within the agreed payment period.</p>

              <h3 className="font-heading text-lg text-white mb-3">5. Client Responsibilities</h3>
              <p className="mb-2">The Client agrees to provide:</p>
              <ul className="list-disc pl-5 mb-1 space-y-1">
                <li>Logo, Brand Colors, Images, Videos</li>
                <li>Website Content, Contact Information, Social Media Links</li>
                <li>Domain Details (if applicable), Hosting Details (if applicable)</li>
              </ul>
              <p className="mb-6">The Client is responsible for ensuring that all supplied content is accurate and legally owned or licensed.</p>

              <h3 className="font-heading text-lg text-white mb-3">6. Project Communication</h3>
              <p className="mb-2">The Client should provide timely feedback and approvals to avoid unnecessary delays.</p>
              <p className="mb-6">Preferred communication methods include: Email, WhatsApp, Google Meet, Phone Call.</p>

              <h3 className="font-heading text-lg text-white mb-3">7. Revisions</h3>
              <p className="mb-1">Unless otherwise agreed in writing:</p>
              <ul className="list-disc pl-5 mb-1 space-y-1">
                <li>Minor revisions are included within the agreed revision limit.</li>
                <li>Requests outside the original scope may require additional charges.</li>
                <li>Major redesigns after approval are treated as new work.</li>
              </ul>
              <p className="mb-6">&nbsp;</p>

              <h3 className="font-heading text-lg text-white mb-3">8. Change Requests</h3>
              <p className="mb-2">If the Client requests additional pages, new features, major design changes, third-party integrations, or functional changes, AROM Studio will provide a revised quotation before starting the additional work.</p>
              <p className="mb-6">&nbsp;</p>

              <h3 className="font-heading text-lg text-white mb-3">9. Domain & Hosting</h3>
              <p className="mb-2">Unless specifically included in the proposal, domain registration and hosting purchase are the Client's responsibility.</p>
              <p className="mb-6">If AROM Studio assists with these services, any third-party costs will be billed separately.</p>

              <h3 className="font-heading text-lg text-white mb-3">10. Content Ownership</h3>
              <p className="mb-2">The Client retains ownership of: Logos, Images, Videos, Written Content, Brand Assets.</p>
              <p className="mb-6">The Client confirms they have permission to use all provided materials.</p>

              <h3 className="font-heading text-lg text-white mb-3">11. Intellectual Property</h3>
              <p className="mb-2">After full payment has been received, the Client owns the completed website and receives all agreed project files.</p>
              <p className="mb-6">AROM Studio retains ownership of its internal tools, reusable code libraries, templates, frameworks, and development methodologies unless otherwise agreed.</p>

              <h3 className="font-heading text-lg text-white mb-3">12. Confidentiality</h3>
              <p className="mb-2">Both parties agree to keep confidential information private.</p>
              <p className="mb-6">Business information, passwords, source files, and sensitive project information shall not be shared with third parties without permission, unless required by law.</p>

              <h3 className="font-heading text-lg text-white mb-3">13. Cancellation</h3>
              <p className="mb-2">Either party may cancel the project. If cancelled, work completed up to the cancellation date must be paid for. Advance payments are generally non-refundable. Completed deliverables may be provided after outstanding payments are settled.</p>
              <p className="mb-6">&nbsp;</p>

              <h3 className="font-heading text-lg text-white mb-3">14. Website Launch</h3>
              <p className="mb-6">The website will be deployed after final approval, final payment, and required domain/hosting access (if applicable).</p>

              <h3 className="font-heading text-lg text-white mb-3">15. Support</h3>
              <p className="mb-2">After website delivery, the included support period is <strong>{data.supportPeriod || '30'} days</strong>.</p>
              <p className="mb-1">Support includes: Bug Fixes, Minor Technical Assistance.</p>
              <p className="mb-6">Support does not include: New Features, Major Design Changes, Additional Pages, Third-party software issues.</p>

              <h3 className="font-heading text-lg text-white mb-3">16. Limitation of Liability</h3>
              <p className="mb-6">AROM Studio shall not be responsible for third-party hosting failures, domain provider issues, payment gateway outages, search engine ranking changes, client-added errors after handover, or cyberattacks beyond our control.</p>

              <h3 className="font-heading text-lg text-white mb-3">17. Portfolio Rights</h3>
              <p className="mb-6">Unless the Client specifically requests confidentiality in writing, AROM Studio may showcase the completed project in its portfolio, website, and social media for promotional purposes.</p>

              <h3 className="font-heading text-lg text-white mb-3">18. Force Majeure</h3>
              <p className="mb-6">Neither party shall be liable for delays caused by events beyond reasonable control, including natural disasters, government actions, internet outages, pandemics, or other unforeseen circumstances.</p>

              <h3 className="font-heading text-lg text-white mb-3">19. Governing Law</h3>
              <p className="mb-2">This Agreement shall be governed by the applicable laws of India.</p>
              <p className="mb-6">Any disputes shall first be attempted to be resolved through mutual discussion before pursuing legal remedies.</p>

              <h3 className="font-heading text-lg text-white mb-3">20. Acceptance</h3>
              <p className="mb-6">By proceeding with the project and making the agreed advance payment after accepting the proposal, the Client acknowledges that they have read, understood, and accepted the terms of this Agreement.</p>

              <div className="border-t border-white/20 pt-6 mt-8">
                <p className="font-heading text-lg text-white mb-4">Accepted and agreed by:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Client</p>
                    <div className="border-b border-white/20 pb-1 mb-1"><p className="text-white">{data.clientName || <span className="text-white/30 italic">[Sign here]</span>}</p></div>
                    <p className="text-xs text-white/40">Date: _______________</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">AROM Studio</p>
                    <div className="border-b border-white/20 pb-1 mb-1"><p className="text-white">Arnav (Founder)</p></div>
                    <p className="text-xs text-white/40">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-6 text-xs text-white/40">
                <p className="font-heading text-sm text-white/60 mb-1">Contact Information</p>
                <p>AROM Studio | Website: https://arom-studio.vercel.app | Email: aromstudio27@gmail.com | Phone: +91 8767990061</p>
              </div>
            </div>
          </GlassCard>

          <Button variant="secondary" size="lg" onClick={handleGeneratePDF} className="w-full mb-4">
            <Download className="h-4 w-4" /> Download Agreement as PDF
          </Button>

          <div className="text-center">
            <p className="text-sm text-white/50 font-body mb-3">Share this agreement:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/918767990061?text=${encodeURIComponent(`Hi Arnav,\n\nI've reviewed the Website Development Agreement. Here are my details:\n\nClient: ${data.clientName}\nEmail: ${data.clientEmail}\nDate: ${effDateStr}\n\nPlease find the signed PDF attached.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-5 py-3 transition-all"
              >
                <WhatsAppIcon className="h-5 w-5" /> Share on WhatsApp
              </a>
              <a
                href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Website Development Agreement - ${data.clientName || 'Client'}`)}&body=${encodeURIComponent(`Hi Arnav,\n\nI've reviewed and accepted the Website Development Agreement.\n\nClient: ${data.clientName}\nEmail: ${data.clientEmail}\nPhone: ${data.clientPhone}\nDate: ${effDateStr}\n\nPlease find the signed PDF attached.\n\nThanks!`)}`}
                className="flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-5 py-3 transition-all"
              >
                <Mail className="h-5 w-5" /> Share via Email
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
