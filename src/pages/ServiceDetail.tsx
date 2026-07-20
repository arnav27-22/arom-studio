import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ArrowUpRight, ArrowLeft, ChevronDown } from 'lucide-react'
import { Section, Container, SectionHeader } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { CTABanner } from '../components/sections/shared/CTABanner'
import { services } from '../data/services'

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const service = services.find((s) => s.slug === slug)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!service) {
    return (
      <main className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">Service not found</h1>
          <Link to="/services" className="text-accent hover:underline font-body">Back to Services</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-32">
      <SEO
        title={service ? service.title : 'Service'}
        description={service ? service.description : 'Service details'}
        jsonLd={service ? {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.description,
          provider: { '@type': 'Organization', name: 'AROM STUDIO' },
          offers: { '@type': 'Offer', availability: 'https://schema.org/InStock' },
        } : undefined}
      />
      <Section>
        <Container>
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-body mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Service</span>
              <h1 className="font-heading text-5xl md:text-7xl text-white leading-[0.9] tracking-[-2px] mt-2 mb-4">
                {service.title}
              </h1>

              {service.idealFor && (
                <span className="inline-block text-[11px] text-accent font-body font-medium border border-accent/20 px-3 py-1 rounded-full mb-4">
                  {service.idealFor}
                </span>
              )}

              <p className="text-base text-white/60 font-body font-light leading-relaxed mb-6">{service.description}</p>

              {service.longDescription && (
                <p className="text-sm text-white/50 font-body font-light leading-relaxed mb-6">{service.longDescription}</p>
              )}

              {service.techTags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.techTags.map((tag) => (
                    <span key={tag} className="text-[11px] text-accent/70 font-body border border-accent/10 bg-accent/5 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <Link
                  to="/contact"
                  className="glass-strong text-sm font-body font-medium text-white rounded-full px-6 py-3 inline-flex items-center gap-2 hover:shadow-[0_0_20px_2px_rgba(78,133,191,0.3)] transition-all duration-300"
                >
                  Get Started <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <GlassCard className="!rounded-[24px]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-2xl text-white">What&apos;s Included</h3>
                <span className="text-xs text-white/40 font-body">{service.features.length} items</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                    <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </Container>
      </Section>

      {/* Process */}
      <Section>
        <Container>
          <SectionHeader title="Our approach" highlightWord="" align="left" className="mb-10" />
          <div className="space-y-4">
            {service.process.map((step) => (
              <GlassCard key={step.step} className="flex items-start gap-5 !rounded-[20px]" hover={false}>
                <span className="font-heading text-3xl text-accent shrink-0 w-10">{String(step.step).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-heading text-xl text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-white/55 font-body font-light">{step.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      {service.faqs.length > 0 && (
        <Section>
          <Container>
            <SectionHeader title="Frequently Asked" highlightWord="Questions" align="left" className="mb-10" />
            <div className="space-y-3 max-w-2xl">
              {service.faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full glass !rounded-[20px] p-5 md:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="font-heading text-lg text-white">{faq.question}</span>
                    <ChevronDown
                      className="h-4 w-4 text-white/30 shrink-0 transition-transform duration-300"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: openFaq === i ? '300px' : '0px',
                      opacity: openFaq === i ? 1 : 0,
                    }}
                  >
                    <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3">
                      <div className="w-8 h-[1.5px] bg-accent/30 mb-3" />
                      <p className="text-sm text-white/55 font-body font-light leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTABanner />
    </main>
  )
}
