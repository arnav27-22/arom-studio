import { useState } from 'react'
import { Download, CheckCircle2 } from 'lucide-react'
import { trackPDFDownload, uploadPDF } from '../../lib/tracker'
import { recordAdminDiscoveryQuestionnaire } from '../../admin/adminStore'
import { GlassCard } from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import jsPDF from 'jspdf'

interface QData {
  fullName: string
  company: string
  designation: string
  email: string
  phone: string
  website: string
  businessDesc: string
  services: string
  yearsBusiness: string
  differentiator: string
  whyWebsite: string[]
  goals: string
  ageGroups: string[]
  targetLocation: string[]
  competitors: string
  likeCompetitors: string
  dislikeCompetitors: string
  inspiration1: string
  reason1: string
  inspiration2: string
  reason2: string
  inspiration3: string
  reason3: string
  branding: Record<string, boolean>
  pages: string[]
  features: string[]
  contentProvider: string
  contentItems: string[]
  ownDomain: string
  domainName: string
  ownHosting: string
  hostingProvider: string
  requireSEO: string
  targetKeywords: string
  targetCities: string
  startDate: string
  launchDate: string
  urgency: string
  budget: string
  communication: string[]
  meetingTime: string
  additionalNotes: string
}

const defaultData: QData = {
  fullName: '', company: '', designation: '', email: '', phone: '', website: '',
  businessDesc: '', services: '', yearsBusiness: '', differentiator: '',
  whyWebsite: [], goals: '',
  ageGroups: [], targetLocation: [],
  competitors: '', likeCompetitors: '', dislikeCompetitors: '',
  inspiration1: '', reason1: '', inspiration2: '', reason2: '', inspiration3: '', reason3: '',
  branding: {},
  pages: [], features: [], contentProvider: '', contentItems: [],
  ownDomain: '', domainName: '', ownHosting: '', hostingProvider: '',
  requireSEO: '', targetKeywords: '', targetCities: '',
  startDate: '', launchDate: '', urgency: '',
  budget: '', communication: [], meetingTime: '', additionalNotes: '',
}

const checkboxOptions = {
  whyWebsite: ['Build online presence', 'Generate leads', 'Increase sales', 'Accept online bookings', 'Showcase portfolio', 'Improve current website', 'Launch a new business', 'Other'],
  ageGroups: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'],
  targetLocation: ['Local', 'State', 'India', 'International'],
  branding: ['Logo', 'Brand Colors', 'Typography', 'Brand Guidelines', 'Social Media Branding'],
  pages: ['Home', 'About', 'Services', 'Portfolio', 'Pricing', 'Blog', 'FAQs', 'Contact', 'Privacy Policy', 'Terms & Conditions', 'Careers', 'Testimonials', 'Other'],
  features: ['Contact Form', 'WhatsApp Chat', 'Google Maps', 'Blog', 'Gallery', 'Search', 'Appointment Booking', 'Live Chat', 'Newsletter', 'Payment Gateway', 'User Login', 'Dashboard', 'CMS', 'Multi-language', 'SEO', 'Analytics', 'Custom Animations', 'API Integration', 'Other'],
  contentItems: ['Logo', 'Images', 'Videos', 'Text Content', 'Product Information', 'Team Information', 'Testimonials', 'Pricing', 'FAQs'],
  communication: ['Email', 'WhatsApp', 'Phone', 'Google Meet'],
  yearsBusiness: ['Less than 1 Year', '1–3 Years', '3–5 Years', '5+ Years'],
  budget: ['₹10,000–₹25,000', '₹25,000–₹50,000', '₹50,000–₹1,00,000', '₹1,00,000+', 'Prefer to Discuss'],
  urgency: ['Low', 'Medium', 'High'],
  requireSEO: ['Yes', 'No', 'Not Sure'],
  ownDomain: ['Yes', 'No'],
  ownHosting: ['Yes', 'No'],
  contentProvider: ['Client', 'AROM Studio', 'Both'],
}

function CheckboxGroup({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => {
    onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])
  }
  return (
    <div className="mb-5">
      <label className="text-xs text-white/50 font-body mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => toggle(o)} className={`text-xs px-3 py-1.5 rounded-full border font-body transition-all ${selected.includes(o) ? 'bg-accent/20 border-accent/50 text-accent' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
            {selected.includes(o) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}{o}
          </button>
        ))}
      </div>
    </div>
  )
}

function RadioGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-5">
      <label className="text-xs text-white/50 font-body mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`text-xs px-3 py-1.5 rounded-full border font-body transition-all ${value === o ? 'bg-accent/20 border-accent/50 text-accent' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
            {value === o && <CheckCircle2 className="h-3 w-3 inline mr-1" />}{o}
          </button>
        ))}
      </div>
    </div>
  )
}

function BrandingCheckbox({ data, setData }: { data: QData; setData: (d: QData) => void }) {
  const toggle = (key: string) => {
    setData({ ...data, branding: { ...data.branding, [key]: !data.branding[key] } })
  }
  return (
    <div className="mb-5">
      <label className="text-xs text-white/50 font-body mb-2 block">Do you already have?</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {checkboxOptions.branding.map((item) => (
          <button key={item} onClick={() => toggle(item)} className={`text-xs px-3 py-2 rounded-lg border font-body flex items-center justify-between transition-all ${data.branding[item] ? 'bg-accent/20 border-accent/50 text-accent' : 'border-white/10 text-white/50 hover:border-white/30'}`}>
            <span>{item}</span>
            <span className="text-[10px]">{data.branding[item] ? 'Yes' : 'No'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function generateQuestionnairePDF(data: QData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  let y = 20

  const addFooter = () => {
    doc.setFontSize(7)
    doc.setTextColor(130)
    doc.text('AROM STUDIO | aromstudio27@gmail.com | https://arom-studio.vercel.app', pw / 2, ph - 10, { align: 'center' })
    doc.text(`Page ${doc.getNumberOfPages()}`, pw / 2, ph - 5, { align: 'center' })
  }

  const checkPage = (n = 20) => {
    if (y + n > ph - 18) { addFooter(); doc.addPage(); y = 20 }
  }

  const writeLabel = (label: string, value: string) => {
    checkPage(8)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(78, 133, 191)
    doc.text(label, 15, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(50)
    const split = doc.splitTextToSize(value || '—', pw - 30)
    for (const s of split) { doc.text(s, 15, y); y += 4.5 }
    y += 3
  }

  const writeArray = (label: string, arr: string[]) => {
    writeLabel(label, arr.length > 0 ? arr.join(', ') : 'None selected')
  }

  // Cover page
  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, pw, ph, 'F')
  doc.setFillColor(78, 133, 191)
  doc.rect(0, 0, pw, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(78, 133, 191)
  doc.text('AROM Studio', pw / 2, 70, { align: 'center' })
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('Web Design & Development Agency', pw / 2, 78, { align: 'center' })
  doc.setDrawColor(78, 133, 191)
  doc.setLineWidth(0.5)
  doc.line(pw / 2 - 25, 84, pw / 2 + 25, 84)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(40)
  doc.text('Discovery Questionnaire', pw / 2, 105, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80)
  doc.text(`Prepared for: ${data.fullName || 'Client'}`, pw / 2, 118, { align: 'center' })
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pw / 2, 126, { align: 'center' })
  doc.setFillColor(30, 30, 35)
  doc.rect(0, ph - 25, pw, 25, 'F')
  doc.setFontSize(7)
  doc.setTextColor(180)
  doc.text('AROM STUDIO | aromstudio27@gmail.com | +91 8767990061 | https://arom-studio.vercel.app', pw / 2, ph - 12, { align: 'center' })
  doc.addPage()

  // Content pages
  doc.setFillColor(78, 133, 191)
  doc.rect(0, 0, pw, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255)
  doc.text('AROM STUDIO', 12, 7)
  doc.setFont('helvetica', 'normal')
  doc.text('Discovery Questionnaire', pw / 2, 7, { align: 'center' })
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), pw - 12, 7, { align: 'right' })

  y = 22

  writeLabel('Full Name', data.fullName)
  writeLabel('Company / Business Name', data.company)
  writeLabel('Designation', data.designation)
  writeLabel('Email Address', data.email)
  writeLabel('Phone Number', data.phone)
  writeLabel('Website (if any)', data.website)
  writeLabel('Business Description', data.businessDesc)
  writeLabel('Products / Services Offered', data.services)
  writeLabel('Years in Business', data.yearsBusiness)
  writeLabel('Differentiator', data.differentiator)
  writeArray('Why Website?', data.whyWebsite)
  writeLabel('Top 3 Goals', data.goals)
  writeArray('Age Groups', data.ageGroups)
  writeArray('Target Location', data.targetLocation)
  writeLabel('Competitors', data.competitors)
  writeLabel('What you like about competitors', data.likeCompetitors)
  writeLabel('What you dislike', data.dislikeCompetitors)
  writeLabel('Inspiration 1', data.inspiration1 ? `${data.inspiration1} — ${data.reason1}` : '')
  writeLabel('Inspiration 2', data.inspiration2 ? `${data.inspiration2} — ${data.reason2}` : '')
  writeLabel('Inspiration 3', data.inspiration3 ? `${data.inspiration3} — ${data.reason3}` : '')
  writeLabel('Branding', Object.entries(data.branding).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None')
  writeArray('Required Pages', data.pages)
  writeArray('Required Features', data.features)
  writeLabel('Content Provider', data.contentProvider)
  writeArray('Content Items', data.contentItems)
  writeLabel('Own Domain?', data.ownDomain)
  writeLabel('Domain Name', data.domainName)
  writeLabel('Own Hosting?', data.ownHosting)
  writeLabel('Hosting Provider', data.hostingProvider)
  writeLabel('Require SEO?', data.requireSEO)
  writeLabel('Target Keywords', data.targetKeywords)
  writeLabel('Target Cities', data.targetCities)
  writeLabel('Preferred Start Date', data.startDate)
  writeLabel('Preferred Launch Date', data.launchDate)
  writeLabel('Urgency', data.urgency)
  writeLabel('Budget', data.budget)
  writeArray('Preferred Communication', data.communication)
  writeLabel('Preferred Meeting Time', data.meetingTime)
  writeLabel('Additional Notes', data.additionalNotes)

  // Declaration
  checkPage(30)
  y += 6
  doc.setDrawColor(78, 133, 191)
  doc.setLineWidth(0.3)
  doc.line(15, y, pw - 15, y)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(78, 133, 191)
  doc.text('Declaration', 15, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(50)
  doc.text('I confirm that the information provided in this questionnaire is accurate and complete to the best of my knowledge.', 15, y)
  y += 8
  doc.text(`Client Name: ${data.fullName || '_________________________'}`, 15, y)
  y += 7
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, y)
  y += 12

  // Internal use
  doc.setDrawColor(200)
  doc.line(15, y, pw - 15, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('INTERNAL USE ONLY', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Lead ID: ______________________', 15, y); y += 5
  doc.text('Sales Representative: ______________________', 15, y); y += 5
  doc.text('Discovery Call Date: ______________________', 15, y); y += 5
  doc.text('Proposal Due Date: ______________________', 15, y); y += 5
  doc.text('Estimated Budget: ______________________', 15, y); y += 5
  doc.text('Lead Status: ____ New ____ Qualified ____ Proposal Sent ____ Negotiation ____ Won ____ Lost', 15, y)

  addFooter()
  const dqFile = `Discovery_Questionnaire_${(data.fullName || 'Client').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  uploadPDF(doc, 'Discovery Questionnaire', dqFile, data.fullName || 'Client')
  trackPDFDownload('discovery-questionnaire', dqFile)
  doc.save(dqFile)
}

export default function DiscoveryQuestionnaire() {
  const [data, setData] = useState<QData>(defaultData)
  const [declaration, setDeclaration] = useState(false)

  const update = (field: keyof QData, value: any) => setData((prev) => ({ ...prev, [field]: value }))

  const handleDownload = () => {
    if (!declaration) return
    generateQuestionnairePDF(data)
    recordAdminDiscoveryQuestionnaire({
      fullName: data.fullName,
      company: data.company,
      email: data.email,
      phone: data.phone,
      website: data.website,
      budget: data.budget,
      urgency: data.urgency,
      preferredLaunchDate: data.launchDate,
      contentProvider: data.contentProvider,
      fullData: data,
    })
  }

  const canDownload = data.fullName.trim() !== '' && declaration

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Discovery Questionnaire</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Help us understand your business, goals, and requirements. Estimated time: 10–15 minutes.</p>
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 1 — Client Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name *" value={data.fullName} onChange={(v) => update('fullName', v)} placeholder="Your full name" />
            <InputField label="Company / Business Name" value={data.company} onChange={(v) => update('company', v)} placeholder="Company name" />
            <InputField label="Designation" value={data.designation} onChange={(v) => update('designation', v)} placeholder="Your role" />
            <InputField label="Email Address *" value={data.email} onChange={(v) => update('email', v)} placeholder="your@email.com" />
            <InputField label="Phone Number" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+91 98765 43210" />
            <InputField label="Website (if any)" value={data.website} onChange={(v) => update('website', v)} placeholder="https://yoursite.com" />
          </div>
        </GlassCard>

        {/* Section 2 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 2 — Business Overview</h3>
          <div className="space-y-4">
            <TextAreaField label="Tell us about your business" value={data.businessDesc} onChange={(v) => update('businessDesc', v)} />
            <TextAreaField label="What products or services do you offer?" value={data.services} onChange={(v) => update('services', v)} />
            <RadioGroup label="How long have you been in business?" options={checkboxOptions.yearsBusiness} value={data.yearsBusiness} onChange={(v) => update('yearsBusiness', v)} />
            <TextAreaField label="What makes your business different from competitors?" value={data.differentiator} onChange={(v) => update('differentiator', v)} />
          </div>
        </GlassCard>

        {/* Section 3 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 3 — Project Goals</h3>
          <CheckboxGroup label="Why do you want a new website?" options={checkboxOptions.whyWebsite} selected={data.whyWebsite} onChange={(v) => update('whyWebsite', v)} />
          <TextAreaField label="What are your top three goals?" value={data.goals} onChange={(v) => update('goals', v)} />
        </GlassCard>

        {/* Section 4 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 4 — Target Audience</h3>
          <CheckboxGroup label="Age Group" options={checkboxOptions.ageGroups} selected={data.ageGroups} onChange={(v) => update('ageGroups', v)} />
          <CheckboxGroup label="Target Location" options={checkboxOptions.targetLocation} selected={data.targetLocation} onChange={(v) => update('targetLocation', v)} />
        </GlassCard>

        {/* Section 5 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 5 — Competitors</h3>
          <TextAreaField label="Please list your competitors" value={data.competitors} onChange={(v) => update('competitors', v)} />
          <TextAreaField label="What do you like about their websites?" value={data.likeCompetitors} onChange={(v) => update('likeCompetitors', v)} />
          <TextAreaField label="What do you dislike?" value={data.dislikeCompetitors} onChange={(v) => update('dislikeCompetitors', v)} />
        </GlassCard>

        {/* Section 6 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 6 — Website Inspiration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Website 1 URL" value={data.inspiration1} onChange={(v) => update('inspiration1', v)} placeholder="https://..." />
            <InputField label="Reason" value={data.reason1} onChange={(v) => update('reason1', v)} placeholder="Why you like it" />
            <InputField label="Website 2 URL" value={data.inspiration2} onChange={(v) => update('inspiration2', v)} placeholder="https://..." />
            <InputField label="Reason" value={data.reason2} onChange={(v) => update('reason2', v)} placeholder="Why you like it" />
            <InputField label="Website 3 URL" value={data.inspiration3} onChange={(v) => update('inspiration3', v)} placeholder="https://..." />
            <InputField label="Reason" value={data.reason3} onChange={(v) => update('reason3', v)} placeholder="Why you like it" />
          </div>
        </GlassCard>

        {/* Section 7 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 7 — Branding</h3>
          <BrandingCheckbox data={data} setData={setData} />
        </GlassCard>

        {/* Section 8 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 8 — Website Pages</h3>
          <CheckboxGroup label="Select required pages" options={checkboxOptions.pages} selected={data.pages} onChange={(v) => update('pages', v)} />
        </GlassCard>

        {/* Section 9 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 9 — Features Required</h3>
          <CheckboxGroup label="Select all that apply" options={checkboxOptions.features} selected={data.features} onChange={(v) => update('features', v)} />
        </GlassCard>

        {/* Section 10 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 10 — Content</h3>
          <RadioGroup label="Who will provide the content?" options={checkboxOptions.contentProvider} value={data.contentProvider} onChange={(v) => update('contentProvider', v)} />
          <CheckboxGroup label="What will you provide?" options={checkboxOptions.contentItems} selected={data.contentItems} onChange={(v) => update('contentItems', v)} />
        </GlassCard>

        {/* Section 11 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 11 — Domain & Hosting</h3>
          <RadioGroup label="Do you already own a domain?" options={checkboxOptions.ownDomain} value={data.ownDomain} onChange={(v) => update('ownDomain', v)} />
          {data.ownDomain === 'Yes' && <InputField label="Domain Name" value={data.domainName} onChange={(v) => update('domainName', v)} placeholder="example.com" />}
          <RadioGroup label="Do you already have hosting?" options={checkboxOptions.ownHosting} value={data.ownHosting} onChange={(v) => update('ownHosting', v)} />
          {data.ownHosting === 'Yes' && <InputField label="Hosting Provider" value={data.hostingProvider} onChange={(v) => update('hostingProvider', v)} placeholder="e.g. Hostinger, GoDaddy" />}
        </GlassCard>

        {/* Section 12 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 12 — SEO</h3>
          <RadioGroup label="Do you require SEO?" options={checkboxOptions.requireSEO} value={data.requireSEO} onChange={(v) => update('requireSEO', v)} />
          <InputField label="Target Keywords" value={data.targetKeywords} onChange={(v) => update('targetKeywords', v)} placeholder="e.g. web design, digital marketing" />
          <InputField label="Target Cities" value={data.targetCities} onChange={(v) => update('targetCities', v)} placeholder="e.g. Mumbai, Delhi" />
        </GlassCard>

        {/* Section 13 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 13 — Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Preferred Start Date" type="date" value={data.startDate} onChange={(v) => update('startDate', v)} />
            <InputField label="Preferred Launch Date" type="date" value={data.launchDate} onChange={(v) => update('launchDate', v)} />
          </div>
          <RadioGroup label="How urgent is this project?" options={checkboxOptions.urgency} value={data.urgency} onChange={(v) => update('urgency', v)} />
        </GlassCard>

        {/* Section 14 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 14 — Budget</h3>
          <RadioGroup label="Project Budget" options={checkboxOptions.budget} value={data.budget} onChange={(v) => update('budget', v)} />
        </GlassCard>

        {/* Section 15 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 15 — Communication</h3>
          <CheckboxGroup label="Preferred Communication Method" options={checkboxOptions.communication} selected={data.communication} onChange={(v) => update('communication', v)} />
          <InputField label="Preferred Meeting Time" value={data.meetingTime} onChange={(v) => update('meetingTime', v)} placeholder="e.g. Evenings after 6 PM" />
        </GlassCard>

        {/* Section 16 */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Section 16 — Additional Notes</h3>
          <TextAreaField label="Please mention anything else you'd like us to know" value={data.additionalNotes} onChange={(v) => update('additionalNotes', v)} />
        </GlassCard>

        {/* Declaration */}
        <GlassCard hover={false} className="p-6 md:p-8 border border-accent/30">
          <h3 className="font-heading text-xl text-white mb-4">Declaration</h3>
          <p className="text-sm text-white/70 font-body mb-4">
            I confirm that the information provided in this questionnaire is accurate and complete to the best of my knowledge.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputField label="Client Name *" value={data.fullName} onChange={(v) => update('fullName', v)} placeholder="Your full name" />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} className="mt-0.5 accent-accent" />
            <span className="text-sm text-white font-body">I hereby confirm that all information provided is accurate and complete. *</span>
          </label>
        </GlassCard>

        {/* Download */}
        <GlassCard hover={false} className="p-6 text-center">
          <Button variant="secondary" size="lg" onClick={handleDownload} disabled={!canDownload} className="w-full">
            <Download className="h-4 w-4" /> {canDownload ? 'Download Questionnaire as PDF' : 'Fill required fields & declaration to download'}
          </Button>
          {!canDownload && (
            <p className="text-xs text-red-400 font-body text-center mt-2">
              {!data.fullName.trim() && '• Enter your full name. '}
              {!declaration && '• Check the declaration.'}
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs text-white/50 font-body mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
    </div>
  )
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-white/50 font-body mb-1 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
    </div>
  )
}
