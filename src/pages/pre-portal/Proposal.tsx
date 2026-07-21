import { Link } from 'react-router-dom'
import { Check, ArrowRight, Calendar, DollarSign, Shield, Clock, FileText, Star } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../components/ui/Section'
import { SEO } from '../../components/ui/SEO'
import { GlassCard } from '../../components/ui/GlassCard'
import { FadeIn } from '../../components/motion/FadeIn'
import { plans } from '../../data/pricing'
import Button from '../../components/ui/Button'

const proposalDetails = {
  client: 'Your Company',
  project: 'Professional Website',
  plan: plans[1],
  timeline: '6-8 Weeks',
  amount: '$380',
  startDate: 'Within 1 week of agreement',
  includes: [
    'Discovery & Planning', 'UI/UX Design (3 concepts)', 'Development & Integration',
    'Content Population', 'Testing & QA', 'Launch & Deployment',
    'Post-Launch Support (30 days)', 'Performance Report',
  ],
  paymentTerms: ['50% upfront to start', '25% at design approval', '25% at launch'],
}

export default function Proposal() {
  return (
    <main>
      <SEO title="Project Proposal" description="View your custom proposal from AROM STUDIO." />
      <Section>
        <Container>
          <SectionHeader badge="Proposal" title="Your Custom" highlightWord="Proposal" description="A tailored plan designed to bring your vision to life." headingLevel="h1" />

          {/* Proposal header */}
          <FadeIn>
            <div className="glass rounded-[32px] p-8 md:p-10 mb-6 max-w-3xl mx-auto">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Prepared for</p>
                  <h2 className="font-heading text-3xl text-white">{proposalDetails.client}</h2>
                  <p className="text-sm text-white/50 font-body font-light mt-1">{proposalDetails.project}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 font-body mb-1">Proposal Date</p>
                  <p className="text-sm text-white/80 font-body">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: FileText, label: 'Plan', value: proposalDetails.plan.name },
                  { icon: Calendar, label: 'Timeline', value: proposalDetails.timeline },
                  { icon: DollarSign, label: 'Investment', value: proposalDetails.amount },
                  { icon: Shield, label: 'Support', value: '1 Year Included' },
                ].map((item) => (
                  <div key={item.label} className="flex-1 min-w-[120px] glass rounded-[16px] p-3 text-center">
                    <item.icon className="h-4 w-4 text-accent mx-auto mb-1" />
                    <p className="text-[10px] text-white/40 font-body uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-white/90 font-heading mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Plan details */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Included features */}
            <FadeIn delay={0.1}>
              <GlassCard>
                <h3 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" /> What's Included
                </h3>
                <ul className="space-y-2.5">
                  {proposalDetails.plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </FadeIn>

            {/* Project phases & payment */}
            <FadeIn delay={0.2}>
              <div className="space-y-6">
                <GlassCard>
                  <h3 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" /> Project Phases
                  </h3>
                  <ol className="space-y-3">
                    {proposalDetails.includes.map((phase, i) => (
                      <li key={phase} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                        <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {phase}
                      </li>
                    ))}
                  </ol>
                </GlassCard>

                <GlassCard>
                  <h3 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" /> Payment Schedule
                  </h3>
                  <ul className="space-y-2">
                    {proposalDetails.paymentTerms.map((term) => (
                      <li key={term} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                        <Star className="h-3 w-3 text-accent mt-0.5 shrink-0" /> {term}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-white/30 font-body mt-3">Payments accepted via bank transfer, UPI, or payment links.</p>
                </GlassCard>
              </div>
            </FadeIn>
          </div>

          {/* CTA */}
          <FadeIn delay={0.3}>
            <div className="max-w-xl mx-auto glass rounded-[28px] p-8 text-center">
              <h3 className="font-heading text-2xl text-white mb-2">Ready to Get Started?</h3>
              <p className="text-sm text-white/50 font-body font-light mb-6">Accept this proposal and let's bring your vision to life.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" size="lg" onClick={() => window.open('https://wa.me/918767990061', '_blank')}>
                  Accept & Start <ArrowRight className="h-4 w-4" />
                </Button>
                <Link to="/contact">
                  <Button variant="outline" size="lg">Have Questions?</Button>
                </Link>
              </div>
              <p className="text-[10px] text-white/30 font-body mt-4">This proposal is valid for 14 days. Reach out anytime at aromstudio27@gmail.com.</p>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </main>
  )
}
