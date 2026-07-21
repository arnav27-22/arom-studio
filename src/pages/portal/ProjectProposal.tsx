import { useState } from 'react'
import { Download, Edit, Plus, X } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { generateProposalPDF } from '../../lib/professionalPDF'

interface Milestone {
  phase: string
  description: string
  timeline: string
}

interface PricingItem {
  service: string
  description: string
  amount: string
}

interface ProposalData {
  clientName: string
  projectName: string
  executiveSummary: string
  objectives: string[]
  scope: string[]
  deliverables: string[]
  milestones: Milestone[]
  pricingItems: PricingItem[]
  totalAmount: string
  paymentSchedule: string[]
  assumptions: string[]
  exclusions: string[]
  technologies: string[]
  supportDescription: string
}

const defaultData: ProposalData = {
  clientName: '',
  projectName: '',
  executiveSummary: 'This proposal outlines a comprehensive website design and development solution tailored to meet your business goals. Our approach combines modern design principles with robust technology to deliver a high-performance digital presence.',
  objectives: [
    'Establish a strong online presence with a modern, responsive website',
    'Improve user engagement through intuitive navigation and UI/UX',
    'Optimize for search engines to drive organic traffic',
    'Integrate CMS for easy content management',
    'Ensure fast loading speeds and mobile-first design',
  ],
  scope: [
    'Custom website design (up to 5 unique page layouts)',
    'Responsive development for all device sizes',
    'Content management system integration',
    'Contact form with email notification',
    'Social media integration',
    'Google Analytics setup',
    'Basic SEO optimization',
    'Performance optimization',
  ],
  deliverables: [
    'Fully functional website deployed to production',
    'Source code repository access',
    'Admin documentation & user guide',
    'Design source files (Figma)',
    'SSL certificate setup',
    '30-day post-launch support',
  ],
  milestones: [
    { phase: 'Discovery & Research', description: 'Requirements gathering, competitor analysis, user research', timeline: 'Week 1' },
    { phase: 'UX/UI Design', description: 'Wireframes, visual design, interactive prototypes', timeline: 'Weeks 2-3' },
    { phase: 'Development', description: 'Frontend & backend development, CMS integration', timeline: 'Weeks 4-6' },
    { phase: 'Content Integration', description: 'Content population, media optimization', timeline: 'Week 7' },
    { phase: 'Testing & QA', description: 'Cross-browser testing, performance testing, bug fixes', timeline: 'Week 8' },
    { phase: 'Launch & Handover', description: 'Deployment, final review, documentation handover', timeline: 'Week 9' },
  ],
  pricingItems: [
    { service: 'UI/UX Design', description: 'Wireframes, prototypes, visual design', amount: '$150' },
    { service: 'Development', description: 'Frontend & backend development', amount: '$200' },
    { service: 'CMS Integration', description: 'Content management system setup', amount: '$80' },
    { service: 'SEO & Analytics', description: 'Basic SEO, Google Analytics, sitemap', amount: '$50' },
    { service: 'Testing & Deployment', description: 'QA, performance testing, launch', amount: '$100' },
  ],
  totalAmount: '$580',
  paymentSchedule: [
    '50% advance payment to commence the project',
    '25% upon design approval',
    '25% upon project completion before final delivery',
  ],
  assumptions: [
    'Client will provide all required content (text, images, videos) within agreed timelines',
    'Client will provide brand assets (logo, colors, fonts) before design phase begins',
    'Any third-party integrations are assumed to have accessible APIs',
    'Client will provide timely feedback within 48 hours during review cycles',
    'Domain and hosting will be arranged by the client unless agreed otherwise',
  ],
  exclusions: [
    'Content creation (copywriting, photography, videography)',
    'Logo or brand identity design',
    'Third-party software licenses or subscriptions',
    'Ongoing maintenance after the support period',
    'Data migration from existing platforms',
    'Custom functionality beyond agreed scope',
  ],
  technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Figma'],
  supportDescription: '30 days of post-launch support included, covering bug fixes and minor technical assistance. Extended support and maintenance plans are available upon request.',
}

export default function ProjectProposal() {
  const [data, setData] = useState<ProposalData>(defaultData)
  const [showEdit, setShowEdit] = useState(false)
  const [newItem, setNewItem] = useState('')

  const update = (field: keyof ProposalData, value: any) => setData((p) => ({ ...p, [field]: value }))

  const addToList = (field: 'objectives' | 'scope' | 'deliverables' | 'assumptions' | 'exclusions') => {
    if (!newItem.trim()) return
    setData((p) => ({ ...p, [field]: [...p[field], newItem.trim()] }))
    setNewItem('')
  }

  const removeFromList = (field: 'objectives' | 'scope' | 'deliverables' | 'assumptions' | 'exclusions', index: number) => {
    setData((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }))
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    setData((p) => ({
      ...p,
      milestones: p.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }))
  }

  const addMilestone = () => {
    setData((p) => ({
      ...p,
      milestones: [...p.milestones, { phase: '', description: '', timeline: '' }],
    }))
  }

  const updatePricing = (index: number, field: keyof PricingItem, value: string) => {
    setData((p) => ({
      ...p,
      pricingItems: p.pricingItems.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }))
  }

  const addPricingItem = () => {
    setData((p) => ({
      ...p,
      pricingItems: [...p.pricingItems, { service: '', description: '', amount: '' }],
    }))
  }

  const handleDownload = () => {
    generateProposalPDF({
      clientName: data.clientName || 'Client',
      projectName: data.projectName || 'Website Project',
      preparedBy: 'AROM Studio',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      executiveSummary: data.executiveSummary,
      objectives: data.objectives,
      scope: data.scope,
      deliverables: data.deliverables,
      milestones: data.milestones,
      pricingItems: data.pricingItems,
      totalAmount: data.totalAmount,
      paymentSchedule: data.paymentSchedule,
      assumptions: data.assumptions,
      exclusions: data.exclusions,
      technologies: data.technologies,
      supportDescription: data.supportDescription,
    })
  }

  const EditableList = ({ field, label }: { field: 'objectives' | 'scope' | 'deliverables' | 'assumptions' | 'exclusions'; label: string }) => (
    <div className="mb-4">
      <label className="text-xs text-white/50 font-body mb-2 block">{label}</label>
      <div className="space-y-1.5">
        {data[field].map((item, i) => (
          <div key={i} className="flex items-center gap-2 glass rounded-[12px] px-3 py-2">
            <span className="text-xs text-white/70 font-body flex-1">{item}</span>
            <button onClick={() => removeFromList(field, i)} className="text-white/30 hover:text-red-400 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={`Add ${label.toLowerCase()}...`} className="flex-1 bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
        <button onClick={() => addToList(field)} className="text-accent hover:text-accent-light text-xs font-body px-3">Add</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Project Proposal</h1>
          <p className="text-sm text-white/50 font-body font-light mt-1">Comprehensive proposal with full breakdown for your client.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(!showEdit)}>
            <Edit className="h-4 w-4" /> {showEdit ? 'Done' : 'Edit All'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-lg text-white mb-4">Client & Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Client Name</label>
              <input value={data.clientName} onChange={(e) => update('clientName', e.target.value)} placeholder="e.g. ABC Corporation" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
            <div>
              <label className="text-xs text-white/50 font-body mb-1 block">Project Name</label>
              <input value={data.projectName} onChange={(e) => update('projectName', e.target.value)} placeholder="e.g. Business Website" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs text-white/50 font-body mb-1 block">Executive Summary</label>
            <textarea value={data.executiveSummary} onChange={(e) => update('executiveSummary', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
          </div>
        </GlassCard>

        {/* Lists */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-lg text-white mb-4">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableList field="objectives" label="Objectives" />
            <EditableList field="scope" label="Scope of Work" />
            <EditableList field="deliverables" label="Deliverables" />
            <EditableList field="assumptions" label="Assumptions" />
            <EditableList field="exclusions" label="Exclusions" />
          </div>
          <div className="mt-4">
            <label className="text-xs text-white/50 font-body mb-1 block">Technologies (comma separated)</label>
            <input value={data.technologies.join(', ')} onChange={(e) => update('technologies', e.target.value.split(',').map((t) => t.trim()))} placeholder="React, TypeScript, Tailwind CSS" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
          </div>
        </GlassCard>

        {/* Milestones */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-white">Timeline & Milestones</h3>
            <button onClick={addMilestone} className="text-accent hover:text-accent-light text-xs font-body flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
          </div>
          <div className="space-y-3">
            {data.milestones.map((m, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 glass rounded-[14px] p-3">
                <input value={m.phase} onChange={(e) => updateMilestone(i, 'phase', e.target.value)} placeholder="Phase name" className="bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                <input value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)} placeholder="Description" className="bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                <input value={m.timeline} onChange={(e) => updateMilestone(i, 'timeline', e.target.value)} placeholder="Timeline" className="bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Pricing */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-white">Pricing</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-body">Total:</label>
              <input value={data.totalAmount} onChange={(e) => update('totalAmount', e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded-[10px] px-3 py-1.5 text-sm text-white font-heading text-right focus:outline-none focus:border-accent/40" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-3 gap-3 text-[10px] text-white/40 font-body uppercase tracking-wider px-3">
              <span>Service</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
            </div>
            {data.pricingItems.map((item, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <input value={item.service} onChange={(e) => updatePricing(i, 'service', e.target.value)} placeholder="Service" className="bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                <input value={item.description} onChange={(e) => updatePricing(i, 'description', e.target.value)} placeholder="Description" className="bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
                <div className="flex gap-1">
                  <input value={item.amount} onChange={(e) => updatePricing(i, 'amount', e.target.value)} placeholder="$0" className="flex-1 bg-white/5 border border-white/10 rounded-[10px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body text-right" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={addPricingItem} className="text-accent hover:text-accent-light text-xs font-body flex items-center gap-1"><Plus className="h-3 w-3" /> Add Item</button>
        </GlassCard>

        {/* Payment Schedule */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-lg text-white mb-4">Payment Schedule</h3>
          <div className="space-y-2">
            {data.paymentSchedule.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={item} onChange={(e) => setData((p) => ({
                  ...p,
                  paymentSchedule: p.paymentSchedule.map((ps, j) => j === i ? e.target.value : ps),
                }))} className="flex-1 bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Support */}
        <GlassCard hover={false} className="p-6 md:p-8">
          <h3 className="font-heading text-lg text-white mb-4">Support</h3>
          <textarea value={data.supportDescription} onChange={(e) => update('supportDescription', e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none" />
        </GlassCard>

        {/* Download */}
        <GlassCard hover={false} className="p-6 text-center">
          <Button variant="secondary" size="lg" onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="h-4 w-4" /> Download Professional PDF
          </Button>
          <p className="text-[10px] text-white/30 font-body mt-2">Includes cover page, all sections, pricing table, and signature block.</p>
        </GlassCard>
      </div>
    </div>
  )
}
