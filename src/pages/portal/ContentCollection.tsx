import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, CheckCircle2, Mail } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { generateContentCollectionPDF } from '../../lib/professionalPDF'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

interface ContentData {
  clientName: string
  projectName: string
  homePage: string
  aboutUs: string
  services: string
  faqs: string
  contactDetails: string
  socialMedia: string
  seoTitleDesc: string
}

const defaultContent: ContentData = {
  clientName: '',
  projectName: '',
  homePage: '',
  aboutUs: '',
  services: '',
  faqs: '',
  contactDetails: '',
  socialMedia: '',
  seoTitleDesc: '',
}

const sections = [
  { key: 'homePage' as const, label: 'Home Page', placeholder: 'Headline, subtext, hero content, CTA, etc.' },
  { key: 'aboutUs' as const, label: 'About Us', placeholder: 'Company story, mission, team, values, etc.' },
  { key: 'services' as const, label: 'Services', placeholder: 'List of services, descriptions, pricing, etc.' },
  { key: 'faqs' as const, label: 'FAQs', placeholder: 'Common questions and answers.' },
  { key: 'contactDetails' as const, label: 'Contact Details', placeholder: 'Email, phone, address, business hours, etc.' },
  { key: 'socialMedia' as const, label: 'Social Media Links', placeholder: 'Instagram, Facebook, LinkedIn, Twitter, YouTube links.' },
  { key: 'seoTitleDesc' as const, label: 'SEO Title & Description', placeholder: 'Page titles and meta descriptions for search engines.' },
]

export default function ContentCollection() {
  const [data, setData] = useState<ContentData>(defaultContent)
  const [submitted, setSubmitted] = useState(false)

  const update = (field: keyof ContentData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGeneratePDF = () => {
    generateContentCollectionPDF(data)
    setSubmitted(true)
  }

  const shareText = encodeURIComponent(
    `Hi Arnav,\n\nI have submitted the content for my website.\n\nClient: ${data.clientName || 'Client'}\nProject: ${data.projectName || 'Website Project'}\n\nContent: Home Page, About Us, Services, FAQs, Contact Details, Social Media Links, SEO Title & Description`
  )

  const canGenerate = data.clientName.trim() && data.projectName.trim()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Content Collection</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">
          Provide your website content here instead of emailing. This saves time and reduces back-and-forth.
        </p>
      </div>

      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard hover={false} className="p-8 md:p-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </motion.div>
            <h2 className="font-heading text-3xl text-white mb-3">Content Submitted!</h2>
            <p className="text-sm text-white/60 font-body font-light mb-6">Your content has been saved. Please send the PDF to Arnav via WhatsApp or Email for confirmation.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/918767990061?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-6 py-3 transition-all"
              >
                <WhatsAppIcon className="h-5 w-5" /> Send PDF on WhatsApp
              </a>
              <a
                href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Content Collection - ${data.clientName}`)}&body=${shareText}`}
                className="inline-flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-6 py-3 transition-all"
              >
                <Mail className="h-4 w-4" /> Send via Email
              </a>
            </div>
            <p className="text-xs text-red-400/70 font-body mt-4">* Please send the PDF and links to the WhatsApp number +91 8767990061 for confirmation.</p>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <GlassCard hover={false} className="p-6 md:p-8">
            <h3 className="font-heading text-xl text-white mb-6 border-b border-white/10 pb-3">Client & Project</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Client / Company Name *</label>
                <input value={data.clientName} onChange={(e) => update('clientName', e.target.value)} placeholder="e.g. ABC Corporation" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
              <div>
                <label className="text-xs text-white/50 font-body mb-1 block">Project Name *</label>
                <input value={data.projectName} onChange={(e) => update('projectName', e.target.value)} placeholder="e.g. Business Website" className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body" />
              </div>
            </div>
          </GlassCard>

          {sections.map((sec) => (
            <GlassCard key={sec.key} hover={false} className="p-6 md:p-8">
              <h3 className="font-heading text-xl text-white mb-4 border-b border-white/10 pb-3">{sec.label}</h3>
              <textarea
                value={data[sec.key]}
                onChange={(e) => update(sec.key, e.target.value)}
                placeholder={sec.placeholder}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none"
              />
            </GlassCard>
          ))}

          <GlassCard hover={false} className="p-6 md:p-8 text-center">
            <Button variant="secondary" size="lg" onClick={handleGeneratePDF} disabled={!canGenerate} className="w-full sm:w-auto">
              <Download className="h-4 w-4" /> Save as PDF
            </Button>
            {!canGenerate && (
              <p className="text-xs text-red-400/70 font-body mt-2">Enter client name and project name to generate PDF.</p>
            )}
            <p className="text-xs text-red-400/70 font-body mt-4">
              * After downloading, please send the PDF and links to the WhatsApp number +91 8767990061 for confirmation.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
