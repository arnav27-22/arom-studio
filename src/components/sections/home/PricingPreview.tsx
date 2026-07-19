import { Link } from 'react-router-dom'
import { Check, ArrowUpRight } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../ui/Section'
import { FadeIn } from '../../motion/FadeIn'
import { pricingPlans } from '../../../data/pricing'

export function PricingPreview() {
  const previewPlans = pricingPlans.slice(0, 3)

  return (
    <Section>
      <Container>
        <SectionHeader
          badge="Pricing"
          title="Transparent"
          highlightWord="pricing"
          description="No hidden fees, no surprises. Choose the plan that fits your needs."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {previewPlans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div
                className={`glass rounded-[24px] p-6 md:p-8 flex flex-col h-full relative ${
                  plan.highlighted ? 'border border-accent/30 shadow-[0_0_30px_0_rgba(78,133,191,0.15)]' : ''
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-5">
                  <h3 className="font-heading text-2xl text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl text-accent tracking-[-1px]">{plan.price}</span>
                  </div>
                  <p className="text-xs text-white/50 font-body mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                      <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-white/40 font-body pl-6">+{plan.features.length - 5} more features</li>
                  )}
                </ul>

                <Link
                  to="/pricing"
                  className="glass-strong text-sm font-body font-medium text-white rounded-full px-5 py-2.5 inline-flex items-center justify-center gap-1.5 hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.07)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-auto"
                >
                  View Details
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="text-center mt-10">
          <p className="text-sm text-white/40 font-body mb-4">Need a custom solution? Let&apos;s discuss your project.</p>
          <Link
            to="/contact"
            className="glass inline-flex items-center gap-2 text-sm font-body font-medium text-white rounded-full px-6 py-3 transition-all duration-300 hover:scale-[1.02]"
          >
            Get Custom Quote
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </Container>
    </Section>
  )
}
