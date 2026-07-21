import { FileText, ExternalLink } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'

export default function ProjectProposal() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Project Proposal</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">
          Submit client information through our structured form to generate a comprehensive proposal.
        </p>
      </div>

      <GlassCard hover={false} className="p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-accent" />
        </div>
        <h2 className="font-heading text-2xl text-white mb-3">Create a Detailed Proposal</h2>
        <p className="text-sm text-white/60 font-body font-light mb-8 max-w-md mx-auto">
          Fill out our Google Form with real client details including project scope, milestones, pricing, and timeline. We'll prepare a professional proposal based on your input.
        </p>
        <a
          href="https://forms.gle/MAvyrJpvwaEG9kiw8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-white text-sm font-body font-medium rounded-full px-8 py-3.5 transition-all"
        >
          <FileText className="h-4 w-4" /> Open Project Proposal Form <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </GlassCard>
    </div>
  )
}
