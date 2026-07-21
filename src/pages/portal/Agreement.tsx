import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Mail, CheckCircle2 } from 'lucide-react'
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

const sectionCheckboxes = [
  { id: 'parties', label: 'I have read and agree to the Parties section' },
  { id: 'overview', label: 'I have read and agree to Section 1: Project Overview' },
  { id: 'scope', label: 'I have read and agree to Section 2: Scope of Work' },
  { id: 'timeline', label: 'I have read and agree to Section 3: Project Timeline' },
  { id: 'payment', label: 'I have read and agree to Section 4: Payment Terms' },
  { id: 'responsibilities', label: 'I have read and agree to Section 5: Client Responsibilities' },
  { id: 'communication', label: 'I have read and agree to Section 6: Project Communication' },
  { id: 'revisions', label: 'I have read and agree to Section 7: Revisions' },
  { id: 'changes', label: 'I have read and agree to Section 8: Change Requests' },
  { id: 'domain', label: 'I have read and agree to Section 9: Domain & Hosting' },
  { id: 'ownership', label: 'I have read and agree to Section 10: Content Ownership' },
  { id: 'ip', label: 'I have read and agree to Section 11: Intellectual Property' },
  { id: 'confidentiality', label: 'I have read and agree to Section 12: Confidentiality' },
  { id: 'cancellation', label: 'I have read and agree to Section 13: Cancellation' },
  { id: 'launch', label: 'I have read and agree to Section 14: Website Launch' },
  { id: 'support', label: 'I have read and agree to Section 15: Support' },
  { id: 'liability', label: 'I have read and agree to Section 16: Limitation of Liability' },
  { id: 'portfolio', label: 'I have read and agree to Section 17: Portfolio Rights' },
  { id: 'force', label: 'I have read and agree to Section 18: Force Majeure' },
  { id: 'law', label: 'I have read and agree to Section 19: Governing Law' },
  { id: 'acceptance', label: 'I have read and agree to Section 20: Digital Acceptance' },
  { id: 'entireAgreement', label: 'I have read and agree to Section 21: Entire Agreement' },
  { id: 'browserSupport', label: 'I have read and agree to Section 22: Browser Support' },
]

const availableServices = [
  'Website Design', 'Website Development', 'Responsive Design',
  'Landing Pages', 'E-commerce Development', 'Custom Features',
  'CMS Integration', 'SEO Optimization', 'Website Deployment',
]

function todayStr() { return new Date().toISOString().split('T')[0] }

export default function Agreement() {
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [timeline, setTimeline] = useState('4-6 Weeks')
  const [advancePct, setAdvancePct] = useState('50')
  const [supportPeriod, setSupportPeriod] = useState<'7' | '15' | '30'>('30')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({})
  const [declaration, setDeclaration] = useState(false)
  const [generated, setGenerated] = useState(false)

  const finalPct = String(100 - Number(advancePct))

  const toggleService = (s: string) => {
    setSelectedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const toggleSection = (id: string) => {
    setCheckedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allChecked = sectionCheckboxes.every((s) => checkedSections[s.id])
  const canGenerate = clientName.trim() && allChecked && declaration

  const handleGeneratePDF = () => {
    if (!canGenerate) return
    generateAgreementPDF({
      clientName,
      clientAddress,
      clientEmail,
      clientPhone,
      effectiveDate: todayStr(),
      projectDescription,
      selectedServices,
      timeline,
      advancePercentage: advancePct,
      finalPercentage: finalPct,
      supportPeriod,
    })
    setGenerated(true)
  }

  const effDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Website Development Agreement</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Review, acknowledge each section, and download the signed agreement.</p>
      </div>

      <div className="space-y-6">
        {/* Client Info */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Client Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Client / Company Name *</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. ABC Corporation" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Effective Date</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white/80 font-body">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@email.com" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Phone</label>
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/50 font-body mb-1 block">Address</label>
              <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Client's address" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
          </div>
        </GlassCard>

        {/* Project Details */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Project Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-white/50 font-body mb-1 block">Project Description</label>
              <textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Briefly describe the project..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
            </div>
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Estimated Timeline</label>
              <input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 4-6 Weeks" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
          </div>

          <h4 className="font-heading text-base text-white mt-6 mb-3">Services Included</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {availableServices.map((s) => (
              <button key={s} onClick={() => toggleService(s)} className={`text-xs px-3 py-1.5 rounded-full border font-body transition-all ${selectedServices.includes(s) ? 'bg-accent/20 border-accent/50 text-accent' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
                {selectedServices.includes(s) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}{s}
              </button>
            ))}
          </div>

          <h4 className="font-heading text-base text-white mb-3">Payment Terms</h4>
          <p className="text-xs text-white/40 font-body mb-3">Minimum advance payment: 27%. Recommended: 50%</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Advance Payment (%) — minimum 27%</label>
              <input type="number" min={27} max={100} value={advancePct} onChange={(e) => setAdvancePct(Math.max(27, Math.min(100, Number(e.target.value) || 27)).toString())} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body" />
            </div>
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Final Payment (%)</label>
              <input type="number" min={0} max={100} value={finalPct} readOnly className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white/60 focus:outline-none font-body cursor-not-allowed" />
            </div>
          </div>

          <h4 className="font-heading text-base text-white mt-6 mb-3">Support Period</h4>
          <div className="flex gap-3">
            {(['7', '15', '30'] as const).map((days) => (
              <button key={days} onClick={() => setSupportPeriod(days)} className={`text-sm px-5 py-2.5 rounded-full border font-body transition-all ${supportPeriod === days ? 'bg-accent/20 border-accent/50 text-accent' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
                {days} Days
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Full Agreement Text with Checkboxes */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Agreement Terms</h3>
          <p className="text-xs text-white/40 font-body mb-6">Please read each section carefully and check the box to confirm your acceptance. All sections are required.</p>

          <div className="text-sm leading-relaxed text-white/80 font-body space-y-8">
            {/* Parties */}
            <div className="glass rounded-[16px] p-5 border-l-2 border-accent">
              <h4 className="font-heading text-base text-white mb-3">Parties</h4>
              <p className="mb-2">This Website Development Agreement ("Agreement") is entered into between:</p>
              <p className="mb-1"><strong>Agency:</strong> AROM Studio</p>
              <p className="mb-1"><strong>Client:</strong> {clientName || <span className="text-white/30 italic">[Client Name]</span>}</p>
              {clientAddress && <p className="mb-1">Address: {clientAddress}</p>}
              {(clientEmail || clientPhone) && <p className="mb-3">Contact: {[clientEmail, clientPhone].filter(Boolean).join(' | ')}</p>}
              <p className="mb-3">This Agreement becomes effective from <strong>{effDateStr}</strong>.</p>
              <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                <input type="checkbox" checked={!!checkedSections['parties']} onChange={() => toggleSection('parties')} className="mt-0.5 accent-accent" />
                <span className="text-xs text-white/60 font-body">I confirm that the party information above is accurate and I have read the Parties section.</span>
              </label>
            </div>

            {/* Section 1 */}
            <div className="glass rounded-[16px] p-5 border-l-2 border-accent">
              <h4 className="font-heading text-base text-white mb-3">1. Project Overview</h4>
              <p className="mb-2">The Client has requested AROM Studio to design and/or develop a website.</p>
              <p className="mb-3">The specific project requirements, deliverables, pricing, and timeline will be defined in the approved Project Proposal.</p>
              {projectDescription && <p className="mb-3 text-white/60">Project Description: {projectDescription}</p>}
              <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                <input type="checkbox" checked={!!checkedSections['overview']} onChange={() => toggleSection('overview')} className="mt-0.5 accent-accent" />
                <span className="text-xs text-white/60 font-body">I have read and agree to Section 1: Project Overview</span>
              </label>
            </div>

            {/* Section 2 */}
            <div className="glass rounded-[16px] p-5 border-l-2 border-accent">
              <h4 className="font-heading text-base text-white mb-3">2. Scope of Work</h4>
              <p className="mb-2">AROM Studio agrees to provide the services specified in the approved Project Proposal.</p>
              <p className="mb-2">Services may include:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1 text-white/70">
                {(selectedServices.length > 0 ? selectedServices : availableServices).map((s) => <li key={s}>{s}</li>)}
              </ul>
              <p className="mb-3">Any work outside the agreed scope shall be considered additional work and may require a separate quotation.</p>
              <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                <input type="checkbox" checked={!!checkedSections['scope']} onChange={() => toggleSection('scope')} className="mt-0.5 accent-accent" />
                <span className="text-xs text-white/60 font-body">I have read and agree to Section 2: Scope of Work</span>
              </label>
            </div>

            {/* Section 3 */}
            <div className="glass rounded-[16px] p-5 border-l-2 border-accent">
              <h4 className="font-heading text-base text-white mb-3">3. Project Timeline</h4>
              <p className="mb-2">The estimated project duration will be defined in the Project Proposal. Current estimate: <strong>{timeline}</strong>.</p>
              <p className="mb-1">The timeline may change if:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1 text-white/70">
                <li>Client delays providing content or assets.</li>
                <li>Additional features are requested.</li>
                <li>Project requirements change.</li>
                <li>Third-party services cause delays.</li>
              </ul>
              <p className="mb-3">AROM Studio will communicate any timeline changes as early as possible.</p>
              <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                <input type="checkbox" checked={!!checkedSections['timeline']} onChange={() => toggleSection('timeline')} className="mt-0.5 accent-accent" />
                <span className="text-xs text-white/60 font-body">I have read and agree to Section 3: Project Timeline</span>
              </label>
            </div>

            {/* Section 4 */}
            <div className="glass rounded-[16px] p-5 border-l-2 border-accent">
              <h4 className="font-heading text-base text-white mb-3">4. Payment Terms</h4>
              <p className="mb-2">Payment schedule:</p>
              <p className="mb-1"><strong>{advancePct || '27'}%</strong> Advance before project commencement.</p>
              <p className="mb-1"><strong>{Number(100 - Number(advancePct || 27) - Number(finalPct || 50))}%</strong> Milestone payment upon design approval.</p>
              <p className="mb-2"><strong>{finalPct || '50'}%</strong> Final Payment before final website delivery or deployment.</p>
              <p className="mb-2">Additional work requested after project approval will be charged separately.</p>
              <p className="mb-1">Payments are due within the agreed payment period.</p>
              <p className="mb-3">If payment is delayed by more than 7 days, AROM Studio may pause work until payment is received.</p>
              <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                <input type="checkbox" checked={!!checkedSections['payment']} onChange={() => toggleSection('payment')} className="mt-0.5 accent-accent" />
                <span className="text-xs text-white/60 font-body">I have read and agree to Section 4: Payment Terms</span>
              </label>
            </div>

            {/* Section 5 */}
            <div className="glass rounded-[16px] p-5 border-l-2 border-accent">
              <h4 className="font-heading text-base text-white mb-3">5. Client Responsibilities</h4>
              <p className="mb-2">The Client agrees to provide:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1 text-white/70">
                <li>Logo, Brand Colors, Images, Videos</li>
                <li>Website Content, Contact Information</li>
                <li>Social Media Links</li>
                <li>Domain Details (if applicable)</li>
                <li>Hosting Details (if applicable)</li>
              </ul>
              <p className="mb-3">The Client is responsible for ensuring that all supplied content is accurate and legally owned or licensed.</p>
              <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                <input type="checkbox" checked={!!checkedSections['responsibilities']} onChange={() => toggleSection('responsibilities')} className="mt-0.5 accent-accent" />
                <span className="text-xs text-white/60 font-body">I have read and agree to Section 5: Client Responsibilities</span>
              </label>
            </div>

            {/* Sections 6-20 in compact format */}
            {[
              { id: 'communication', title: '6. Project Communication', content: 'The Client should provide timely feedback and approvals to avoid unnecessary delays. Preferred communication methods include: Email, WhatsApp, Google Meet, Zoom, Phone Call. If the Client does not respond within 10 business days, the project may be placed on hold until communication resumes.' },
              { id: 'revisions', title: '7. Revisions', content: 'Revision limits are defined per project tier: Basic (2 revision rounds), Standard (3 revision rounds), Premium (Unlimited until design approval). Requests outside the original scope or beyond the revision limit may require additional charges. Major redesigns after approval are treated as new work.' },
              { id: 'changes', title: '8. Change Requests', content: 'If the Client requests additional pages, new features, major design changes, third-party integrations, or functional changes, AROM Studio will provide a revised quotation before starting the additional work.' },
              { id: 'domain', title: '9. Domain & Hosting', content: 'Unless specifically included in the proposal, domain registration and hosting purchase are the Client\'s responsibility. If AROM Studio assists with these services, any third-party costs will be billed separately.' },
              { id: 'ownership', title: '10. Content Ownership', content: 'The Client retains ownership of: Logos, Images, Videos, Written Content, Brand Assets. The Client confirms they have permission to use all provided materials.' },
              { id: 'ip', title: '11. Intellectual Property', content: 'After full payment has been received, the Client owns the completed website and receives all agreed project files. AROM Studio retains ownership of its internal tools, reusable code libraries, templates, frameworks, and development methodologies unless otherwise agreed.' },
              { id: 'confidentiality', title: '12. Confidentiality', content: 'Both parties agree to keep confidential information private. Business information, passwords, source files, and sensitive project information shall not be shared with third parties without permission, unless required by law.' },
              { id: 'cancellation', title: '13. Cancellation', content: 'Either party may cancel the project. If cancelled: Work completed up to the cancellation date must be paid for. Advance payments cover work already performed and are generally non-refundable. Completed deliverables up to the cancellation date may be provided after outstanding payments are settled.' },
              { id: 'launch', title: '14. Website Launch', content: 'The website will be deployed after: Final approval, Final payment received, Required domain and hosting access provided (if applicable).' },
              { id: 'support', title: '15. Support', content: `After website delivery, the included support period is ${supportPeriod || '30'} days. The warranty covers defects in delivered work. Support includes: Bug Fixes, Minor Technical Assistance. Support does not include: Client modifications, Third-party plugin updates, New Features, Major Design Changes, Additional Pages, Third-party software issues.` },
              { id: 'liability', title: '16. Limitation of Liability', content: 'AROM Studio shall not be responsible for: Third-party hosting failures, Domain provider issues, Payment gateway outages, Search engine ranking changes, Client-added errors after handover, Cyberattacks or data loss caused by third-party systems beyond AROM Studio\'s control.' },
              { id: 'portfolio', title: '17. Portfolio Rights', content: 'Unless the Client specifically requests confidentiality in writing, AROM Studio may showcase the completed project in its portfolio, website, and social media for promotional purposes. If confidentiality is requested and agreed upon, AROM Studio will not publicly display the project.' },
              { id: 'force', title: '18. Force Majeure', content: 'Neither party shall be liable for delays caused by events beyond reasonable control, including natural disasters, government actions, internet outages, pandemics, or other unforeseen circumstances.' },
              { id: 'law', title: '19. Governing Law', content: 'This Agreement shall be governed by the applicable laws of India. Any disputes shall first be attempted to be resolved through mutual discussion before pursuing legal remedies.' },
              { id: 'acceptance', title: '20. Digital Acceptance', content: 'By clicking "I Agree" in the AROM Studio Client Portal or by making the agreed advance payment after accepting the proposal, the Client acknowledges that they have read, understood, and accepted the terms of this Agreement. This constitutes a legally binding digital acceptance. No handwritten signature is required.' },
              { id: 'entireAgreement', title: '21. Entire Agreement', content: 'This Agreement, together with the approved Project Proposal, constitutes the entire agreement between the parties and supersedes any prior discussions, negotiations, or communications, whether written or oral.' },
              { id: 'browserSupport', title: '22. Browser Support', content: 'AROM Studio officially supports the latest two versions of: Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. The website may not function as intended on older or unsupported browsers.' },
            ].map((sec) => (
              <div key={sec.id} className="glass rounded-[16px] p-5 border-l-2 border-accent">
                <h4 className="font-heading text-base text-white mb-3">{sec.title}</h4>
                <p className="mb-3 text-white/70">{sec.content}</p>
                <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                  <input type="checkbox" checked={!!checkedSections[sec.id]} onChange={() => toggleSection(sec.id)} className="mt-0.5 accent-accent" />
                  <span className="text-xs text-white/60 font-body">I have read and agree to {sec.title}</span>
                </label>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Client Declaration */}
        <GlassCard hover={false} className="p-6 md:p-8 border border-accent/30">
          <h3 className="font-heading text-xl text-white mb-4">Client Declaration</h3>
          <p className="text-sm text-white/70 font-body mb-4">
            I, <strong>{clientName || '[Client Name]'}</strong>, confirm that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/60 font-body mb-6">
            <li>I have read and understood all sections of this Agreement including the Entire Agreement clause, Browser Support, and Digital Acceptance.</li>
            <li>All information I have provided is accurate and complete.</li>
            <li>I agree to the payment terms including the {advancePct || '50'}% advance payment.</li>
            <li>I agree to provide all required content and assets within agreed timelines.</li>
            <li>I acknowledge that this Agreement is legally binding and accept the Digital Acceptance clause.</li>
          </ul>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} className="mt-0.5 accent-accent" />
            <span className="text-sm text-white font-body">I hereby declare that I have read, understood, and agree to all terms and conditions of this Website Development Agreement. This declaration is required to proceed. *</span>
          </label>
        </GlassCard>

        {/* Progress & Generate */}
        <GlassCard hover={false} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/70 font-body">Section Acceptance Progress</span>
            <span className="text-sm text-accent font-heading">{Object.keys(checkedSections).length}/{sectionCheckboxes.length}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${(Object.keys(checkedSections).length / sectionCheckboxes.length) * 100}%` }} />
          </div>

          <Button variant="secondary" size="lg" onClick={handleGeneratePDF} disabled={!canGenerate} className="w-full">
            <Download className="h-4 w-4" /> {canGenerate ? 'Download Signed Agreement as PDF' : 'Complete all sections & declaration to download'}
          </Button>

          {!canGenerate && (
            <p className="text-xs text-red-400 font-body text-center mt-2">
              {!clientName.trim() && '• Enter client name. '}
              {!allChecked && '• Accept all 23 sections. '}
              {!declaration && '• Check the declaration.'}
            </p>
          )}

          {generated && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60 font-body text-center mb-4">Share this signed agreement via:</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`https://wa.me/918767990061?text=${encodeURIComponent(`Hi Arnav,\n\nI have reviewed and accepted the Website Development Agreement.\n\nClient: ${clientName}\nEmail: ${clientEmail}\nDate: ${effDateStr}\n\nSigned PDF is attached.`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-5 py-3 transition-all">
                  <WhatsAppIcon className="h-5 w-5" /> Share on WhatsApp
                </a>
                <a href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Website Development Agreement - ${clientName || 'Client'}`)}&body=${encodeURIComponent(`Hi Arnav,\n\nI have reviewed and accepted the Website Development Agreement.\n\nClient: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\nDate: ${effDateStr}\n\nSigned PDF is attached.\n\nThanks!`)}`} className="flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-5 py-3 transition-all">
                  <Mail className="h-5 w-5" /> Share via Email
                </a>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
