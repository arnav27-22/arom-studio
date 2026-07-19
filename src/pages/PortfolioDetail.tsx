import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { CTABanner } from '../components/sections/shared/CTABanner'
import { portfolioItems } from '../data/portfolio'

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>()
  const item = portfolioItems.find((p) => p.slug === slug)

  if (!item) {
    return (
      <main className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">Project not found</h1>
          <Link to="/portfolio" className="text-accent hover:underline font-body">Back to Portfolio</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-32">
      <SEO
        title={item ? item.title : 'Project'}
        description={item ? item.description : 'Project details'}
      />
      <Section>
        <Container>
          <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-body mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </Link>

          {/* Hero */}
          <div className="glass rounded-[32px] p-8 md:p-12 mb-12">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">{item.category}</span>
            <h1 className="font-heading text-5xl md:text-7xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              {item.title}
            </h1>
            <p className="text-base text-white/60 font-body font-light max-w-2xl">{item.description}</p>
          </div>

          {/* Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-4 space-y-4">
              <GlassCard hover={false}>
                <p className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Client</p>
                <p className="text-sm text-white font-body">{item.client}</p>
              </GlassCard>
              <GlassCard hover={false}>
                <p className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Industry</p>
                <p className="text-sm text-white font-body">{item.industry}</p>
              </GlassCard>
              <GlassCard hover={false}>
                <p className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Category</p>
                <p className="text-sm text-white font-body">{item.category}</p>
              </GlassCard>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="font-heading text-2xl text-white mb-3">The Challenge</h2>
                <p className="text-sm text-white/60 font-body font-light leading-relaxed">{item.challenge}</p>
              </div>
              <div>
                <h2 className="font-heading text-2xl text-white mb-3">The Solution</h2>
                <p className="text-sm text-white/60 font-body font-light leading-relaxed">{item.solution}</p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-12">
            <h2 className="font-heading text-3xl text-white mb-6 text-center">Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {item.results.map((r) => (
                <GlassCard key={r.metric} className="text-center !rounded-[20px]">
                  <p className="font-heading text-3xl md:text-4xl text-accent tracking-[-1px]">{r.value}</p>
                  <p className="text-xs text-white/50 font-body mt-1">{r.metric}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-12">
            <h2 className="font-heading text-2xl text-white mb-5">Technologies Used</h2>
            <div className="flex flex-wrap gap-2">
              {item.technologies.map((tech) => (
                <span key={tech} className="glass text-sm text-white/70 font-body px-4 py-2 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          {item.testimonial && (
            <GlassCard hover={false} className="!rounded-[24px] mb-12">
              <blockquote className="text-lg md:text-xl text-white/80 font-heading leading-relaxed mb-4">
                &ldquo;{item.testimonial.quote}&rdquo;
              </blockquote>
              <p className="text-sm font-body font-medium text-white">{item.testimonial.client}</p>
              <p className="text-xs text-white/40 font-body">{item.testimonial.company}</p>
            </GlassCard>
          )}
          {/* Client Privacy Notice */}
          <div className="max-w-4xl mx-auto mt-16 mb-16 p-8 md:p-10 rounded-[24px] relative overflow-hidden" style={{
            background: 'rgba(255,255,255,0.01)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
          }}>
            <div className="absolute inset-0" style={{
              borderRadius: 'inherit',
              padding: '1.4px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            }} />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-accent font-body font-medium bg-accent/10 rounded-full px-3 py-1 mb-5">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Privacy First
              </span>
              <h2 className="font-heading text-2xl md:text-3xl text-white mb-4">Client Privacy &amp; Confidentiality</h2>
              <div className="space-y-4 text-sm text-white/55 font-body font-light leading-relaxed max-w-3xl">
                <p>
                  At AROM STUDIO, we respect the privacy and confidentiality of every client. Many projects are
                  delivered under private agreements or contain sensitive business information. For this reason, we
                  do not publicly share live client website links without explicit written permission.
                </p>
                <p>
                  The case study presented here highlights our design approach, development process, technologies
                  used, and business outcomes while protecting our clients' privacy and intellectual property.
                </p>
                <p>
                  If you'd like to see additional work relevant to your industry, we're happy to share selected
                  examples privately during a consultation where permitted.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5">
                <svg className="h-4 w-4 text-accent/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <p className="text-sm text-accent/80 font-body font-medium">
                  Protecting our clients' privacy is a core part of our professional commitment.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <CTABanner />
    </main>
  )
}
