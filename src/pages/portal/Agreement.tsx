import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Mail, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { buildAgreementPDF, type AgreementData } from '../../lib/agreementPDF'
import { getAdminStore, saveAdminStore } from '../../admin/adminStore'
import { uploadPDF } from '../../lib/tracker'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

const allSections = [
  { num: 1, title: 'Parties', id: 'sec1_parties', content: 'This Website Development Agreement ("Agreement") is entered into between AROM Studio ("Agency") and the Client identified in the project proposal ("Client"). Both parties agree to the terms and conditions set forth herein.' },
  { num: 2, title: 'Definitions', id: 'sec2_definitions', content: '"Agreement" means this Website Development Agreement including all schedules and the Project Proposal. "Client" means the individual or entity engaging AROM Studio. "Agency" means AROM Studio. "Deliverables" means the specific work products to be delivered. "Project" means the website design and development project described in the Proposal. "Services" means all work to be performed by the Agency.' },
  { num: 3, title: 'Project Overview', id: 'sec3_overview', content: 'The Client has engaged AROM Studio to design, develop, and deliver a website as described in the Project Proposal. The Agency agrees to apply its professional expertise to fulfill the objectives of the Project.' },
  { num: 4, title: 'Scope of Work', id: 'sec4_scope', content: 'The Agency agrees to provide the Services as defined in the Project Proposal, which may include website design, development, responsive design, landing pages, e-commerce, custom features, CMS integration, SEO optimization, and deployment.' },
  { num: 5, title: 'Deliverables', id: 'sec5_deliverables', content: 'Upon completion of the Services and subject to full payment, the Agency shall deliver the Deliverables specified in the Proposal, which may include designed web pages, source code, graphic assets, and documentation.' },
  { num: 6, title: 'Timeline', id: 'sec6_timeline', content: 'The estimated duration for completion is defined in the Proposal. The Agency shall make reasonable efforts to adhere to the timeline. Delays caused by the Client or third-party services may extend the schedule.' },
  { num: 7, title: 'Client Responsibilities', id: 'sec7_client_resp', content: 'The Client agrees to provide all necessary Content including text, images, logos, brand colors, and timely feedback. The Client warrants that all Content provided is legally owned or licensed.' },
  { num: 8, title: 'Agency Responsibilities', id: 'sec8_agency_resp', content: 'The Agency agrees to perform all Services with reasonable skill and care, communicate regularly regarding progress, meet agreed deadlines, and maintain high standards of quality in all Deliverables.' },
  { num: 9, title: 'Payment Terms', id: 'sec9_payment', content: 'The Client agrees to pay the total Project fee as set forth in the Proposal. An advance payment is due before work commences. The remaining balance is due prior to final delivery or deployment.' },
  { num: 10, title: 'Additional Work', id: 'sec10_additional', content: 'Any work requested outside the Scope of Work shall be considered Additional Work and shall require a separate written agreement and additional compensation.' },
  { num: 11, title: 'Revisions', id: 'sec11_revisions', content: 'The Client is entitled to revision rounds as specified in the Proposal. Requests introducing new features or functionality beyond the original scope shall be treated as Additional Work.' },
  { num: 12, title: 'Communication', id: 'sec12_communication', content: 'The Parties agree to maintain open communication using email, WhatsApp, Google Meet, Zoom, or phone calls. The Client should provide feedback within five business days.' },
  { num: 13, title: 'Domain and Hosting', id: 'sec13_domain', content: 'Unless included in the Proposal, domain registration and hosting are the Client\'s responsibility. The Agency shall not be liable for downtime or data loss from the Client\'s hosting provider.' },
  { num: 14, title: 'Third-Party Services', id: 'sec14_thirdparty', content: 'The Agency may use third-party tools and services. Costs associated with third-party services shall be communicated in advance. The Agency is not liable for failures of third-party services.' },
  { num: 15, title: 'Intellectual Property', id: 'sec15_ip', content: 'Upon full payment, the Agency assigns to the Client all rights to the final Deliverables. The Agency retains ownership of its pre-existing tools, reusable code libraries, and frameworks.' },
  { num: 16, title: 'Confidentiality', id: 'sec16_confidentiality', content: 'Both Parties agree to maintain confidentiality of all Confidential Information disclosed during the Project and to use such information solely for performing obligations under this Agreement.' },
  { num: 17, title: 'Cancellation', id: 'sec17_cancellation', content: 'Either Party may cancel the Agreement by providing written notice. The Client shall pay for all work completed up to the date of cancellation. Advance payments shall be applied to work completed.' },
  { num: 18, title: 'Website Launch', id: 'sec18_launch', content: 'The Website shall be deployed after final written approval by the Client, receipt of all outstanding payments, and provision of necessary access credentials.' },
  { num: 19, title: 'Warranty', id: 'sec19_warranty', content: 'The Agency warrants that Deliverables will conform to specifications and be free from material defects for the Warranty Period specified in the Proposal. The warranty does not cover modifications by the Client or third parties.' },
  { num: 20, title: 'Maintenance', id: 'sec20_maintenance', content: 'After the Warranty Period, ongoing maintenance may be provided under a separate Maintenance Agreement. Without a Maintenance Agreement, the Agency has no obligation to provide support after the Warranty Period.' },
  { num: 21, title: 'Limitation of Liability', id: 'sec21_liability', content: 'The Agency shall not be liable for indirect, incidental, or consequential damages. The Agency\'s total liability shall not exceed the total amount paid by the Client under this Agreement.' },
  { num: 22, title: 'Portfolio Rights', id: 'sec22_portfolio', content: 'Unless the Client requests confidentiality in writing, the Agency may showcase the completed Website in its portfolio and on social media for promotional purposes.' },
  { num: 23, title: 'Force Majeure', id: 'sec23_force', content: 'Neither Party shall be liable for delays caused by events beyond reasonable control, including acts of God, natural disasters, war, pandemics, internet outages, or government actions.' },
  { num: 24, title: 'Governing Law', id: 'sec24_law', content: 'This Agreement shall be governed by the laws of India. Any disputes shall first be attempted through mutual negotiation before pursuing legal remedies.' },
  { num: 25, title: 'Dispute Resolution', id: 'sec25_dispute', content: 'Any dispute shall be resolved through informal negotiation, then mediation by a mutually agreed neutral mediator, and if still unresolved, through binding arbitration or court proceedings.' },
  { num: 26, title: 'Privacy', id: 'sec26_privacy', content: 'The Agency collects and processes personal information solely for performing the Services. The Agency implements reasonable measures to protect personal information from unauthorized access.' },
  { num: 27, title: 'Browser Support', id: 'sec27_browser', content: 'The Agency warrants the Website shall function on the latest two major versions of Chrome, Firefox, Safari, and Edge. The Website may not function on older or unsupported browsers.' },
  { num: 28, title: 'SEO Disclaimer', id: 'sec28_seo', content: 'The Agency makes no guarantees regarding specific search engine ranking positions. SEO is an ongoing process and maintaining rankings may require continued effort beyond the scope of this Agreement.' },
  { num: 29, title: 'Security Disclaimer', id: 'sec29_security', content: 'The Agency implements industry-standard security practices. No website can be guaranteed completely secure. The Agency is not liable for breaches from vulnerabilities not known at the time of development.' },
  { num: 30, title: 'Electronic Signatures', id: 'sec30_electronic', content: 'Acceptance of this Agreement through the Client Portal, including by clicking to accept after reviewing, shall constitute a legally binding electronic signature with the same force as a handwritten signature.' },
  { num: 31, title: 'Entire Agreement', id: 'sec31_entire', content: 'This Agreement together with the Project Proposal constitutes the entire agreement between the Parties and supersedes all prior discussions and understandings.' },
  { num: 32, title: 'Contact Information', id: 'sec32_contact', content: 'All communications should be directed to AROM Studio at aromstudio27@gmail.com or through the contact form on the Agency\'s website.' },
]

const availableServices = [
  'Website Design', 'Website Development', 'Responsive Design',
  'Landing Pages', 'E-commerce Development', 'Custom Features',
  'CMS Integration', 'SEO Optimization', 'Website Deployment',
]

function todayStr() { return new Date().toLocaleDateString('en-CA') }

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

  const handleAdvanceBlur = () => {
    const v = advancePct.trim()
    if (v === '' || isNaN(Number(v)) || Number(v) < 27) { setAdvancePct('27'); return }
    if (Number(v) > 100) { setAdvancePct('100') }
  }

  const toggleService = (s: string) => {
    setSelectedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const toggleSection = (id: string) => {
    setCheckedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allChecked = allSections.every((s) => checkedSections[s.id])
  const canGenerate = clientName.trim() && allChecked && declaration

  const handleGeneratePDF = () => {
    if (!canGenerate) return
    const agreementId = crypto.randomUUID()
    const agreementData: AgreementData = {
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
      agreementId,
      referenceNumber: 'AGR-' + String(Date.now()).slice(-6),
    }
    const doc = buildAgreementPDF(agreementData)

    const agreementFile = `Website_Agreement_${(clientName || 'Client').replace(/\s+/g, '_')}_${todayStr()}.pdf`
    uploadPDF(doc, 'Website Agreement', agreementFile, clientName, agreementId, { email: clientEmail, phone: clientPhone, company: clientAddress, title: `Website Agreement - ${clientName}` })

    doc.save(agreementFile)

    try {
      const store = getAdminStore()
      if (!Array.isArray(store.agreements)) store.agreements = []
      const existingIdx = store.agreements.findIndex((a) => a.clientName.toLowerCase() === clientName.toLowerCase())
      if (existingIdx !== -1) {
        store.agreements[existingIdx].status = 'Signed'
        store.agreements[existingIdx].signedDate = todayStr()
      } else {
        store.agreements.unshift({
          id: agreementId,
          agreementNumber: 'AGR-' + String(Date.now()).slice(-6),
          clientName: clientName,
          clientEmail: clientEmail,
          status: 'Signed',
          agreementVersion: 'v1.0',
          signedDate: todayStr(),
          createdAt: new Date().toISOString(),
          downloadUrl: '',
        })
      }
      saveAdminStore(store)
      fetch('/api/admin/agreements', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: agreementId,
          clientName,
          clientEmail,
          status: 'Signed',
          agreementVersion: 'v1.0',
          signedDate: todayStr(),
        }),
      }).catch(() => {})
    } catch (e) {
      console.error(e)
    }

    setGenerated(true)
  }

  const effDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Website Development Agreement</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Review all 32 sections, acknowledge each, and download the signed agreement.</p>
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
              <div className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white/80 font-body">{effDateStr}</div>
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
              <input type="number" value={advancePct} onChange={(e) => setAdvancePct(e.target.value)} onBlur={handleAdvanceBlur} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body" />
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
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Agreement Terms — All 32 Sections</h3>
          <p className="text-xs text-white/40 font-body mb-6">Please read each section carefully and check the box to confirm your acceptance. All 32 sections are required.</p>

          <div className="text-sm leading-relaxed text-white/80 font-body space-y-8">
            {allSections.map((sec) => (
              <div key={sec.id} className="glass rounded-[16px] p-5 border-l-2 border-accent">
                <h4 className="font-heading text-base text-white mb-3">Section {sec.num}: {sec.title}</h4>
                <p className="mb-3 text-white/70">{sec.content}</p>
                <label className="flex items-start gap-3 cursor-pointer mt-3 pt-3 border-t border-white/10">
                  <input type="checkbox" checked={!!checkedSections[sec.id]} onChange={() => toggleSection(sec.id)} className="mt-0.5 accent-accent" />
                  <span className="text-xs text-white/60 font-body">I have read and agree to Section {sec.num}: {sec.title}</span>
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
            <li>I have read and understood all 32 sections of this Agreement.</li>
            <li>All information I have provided is accurate and complete.</li>
            <li>I agree to the payment terms including the {advancePct || '50'}% advance payment.</li>
            <li>I agree to provide all required content and assets within agreed timelines.</li>
            <li>I acknowledge that this Agreement is legally binding and accept the Electronic Signatures clause (Section 30).</li>
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
            <span className="text-sm text-accent font-heading">{Object.keys(checkedSections).length}/{allSections.length}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${(Object.keys(checkedSections).length / allSections.length) * 100}%` }} />
          </div>

          <Button variant="secondary" size="lg" onClick={handleGeneratePDF} disabled={!canGenerate} className="w-full">
            <Download className="h-4 w-4" /> {canGenerate ? 'Download Signed Agreement as PDF' : 'Complete all 32 sections & declaration to download'}
          </Button>

          {!canGenerate && (
            <p className="text-xs text-red-400 font-body text-center mt-2">
              {!clientName.trim() && '• Enter client name. '}
              {!allChecked && '• Accept all 32 sections. '}
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