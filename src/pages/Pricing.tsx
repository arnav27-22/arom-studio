import { Link } from 'react-router-dom'
import { Check, ArrowUpRight, Minus } from 'lucide-react'
import { Section, Container, SectionHeader } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { FadeIn, StaggerContainer, StaggerItem } from '../components/motion/FadeIn'
import { CTABanner } from '../components/sections/shared/CTABanner'
import { pricingPlans, comparisonFeatures } from '../data/pricing'

export default function Pricing() {
  return (
    <main className="pt-32">
      <SEO
        title="Pricing"
        description="AROM Studio pricing starts from ₹12,000. Transparent pricing for business websites, e-commerce, web applications, and more. All prices in INR."
      />
      <Section>
        <Container>
          <SectionHeader
            badge="Investment"
            title="Simple, transparent"
            highlightWord="pricing"
            description="No hidden fees. No surprises. Choose the package that fits your needs. Every plan includes 1 Year Support on higher tiers, Free Domain, and Custom Domain options."
          />

          <div className="mb-6 glass rounded-full px-5 py-2.5 text-sm text-white/70 font-body inline-flex items-center gap-2 mx-auto w-fit">
            <Check className="h-4 w-4 text-accent" />
            All plans include 1 Year Support on Premium & Enterprise | Free Domain (1 Year) on Professional+ | Custom Domain Setup on Business+
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 mt-8">
            {pricingPlans.slice(0, 3).map((plan) => (
              <StaggerItem key={plan.name}>
                <GlassCard className={`flex flex-col h-full relative ${plan.highlighted ? 'border border-accent/30 shadow-[0_0_30px_0_rgba(78,133,191,0.15)]' : ''}`}>
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="font-heading text-2xl text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-heading text-4xl md:text-5xl text-accent tracking-[-1px]">{plan.price}</span>
                  </div>
                  <p className="text-xs text-white/50 font-body mb-5">{plan.description}</p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`text-sm font-body font-medium rounded-full px-5 py-2.5 inline-flex items-center justify-center gap-1.5 transition-all duration-300 mt-auto ${
                      plan.highlighted
                        ? 'glass-strong text-white hover:shadow-[0_0_20px_2px_rgba(78,133,191,0.3)]'
                        : 'glass text-white/80 hover:text-white'
                    }`}
                  >
                    Get Started <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Premium + Enterprise */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
              {pricingPlans.slice(3).map((plan) => (
                <GlassCard key={plan.name} className="flex flex-col border border-accent/20">
                  <h3 className="font-heading text-2xl text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-heading text-4xl md:text-5xl text-accent tracking-[-1px]">{plan.price}</span>
                  </div>
                  <p className="text-xs text-white/50 font-body mb-5">{plan.description}</p>
                  <ul className="grid grid-cols-2 gap-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/65 font-body font-light">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className="glass-strong text-sm font-body font-medium text-white rounded-full px-5 py-2.5 inline-flex items-center justify-center gap-1.5 transition-all duration-300 mt-auto"
                  >
                    Contact Us <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </GlassCard>
              ))}
            </div>
          </FadeIn>

          {/* Comparison Table */}
          <FadeIn>
            <SectionHeader title="Feature" highlightWord="comparison" description="See exactly what each plan includes. Higher plans include everything from lower plans plus more." className="mb-10" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 pr-8 text-white/60 font-medium whitespace-nowrap">Feature</th>
                    {pricingPlans.map((p) => (
                      <th key={p.name} className="text-center py-4 px-3 text-white/80 font-heading text-sm min-w-[110px]">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-8 text-white/60 font-light text-sm">{feature.name}</td>
                      {feature.tiers.map((has, i) => (
                        <td key={i} className="text-center py-3.5 px-3">
                          {has ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <Minus className="h-4 w-4 text-white/20 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Add-ons Section */}
      <Section>
        <Container>
          <SectionHeader
            badge="Add-ons"
            title="Additional"
            highlightWord="services"
            description="Enhance your project with these optional add-ons available for any plan."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Custom Domain Setup', price: '₹1,500', desc: 'Professional email & domain configuration with SSL.' },
              { title: 'Free Domain (1 Year)', price: '₹0*', desc: 'Free domain registration for the first year (*T&C apply).' },
              { title: 'Extended Support', price: '₹5,000/mo', desc: 'Ongoing maintenance, updates, and priority support beyond included period.' },
              { title: 'Content Writing', price: '₹3,000', desc: 'Professional copywriting for up to 5 pages.' },
              { title: 'Logo & Brand Kit', price: '₹4,500', desc: 'Custom logo design with brand guidelines.' },
              { title: 'SEO Boost Package', price: '₹8,000', desc: 'Advanced keyword research, backlinks, and monthly reporting.' },
            ].map((addon) => (
              <GlassCard key={addon.title} className="flex flex-col">
                <h3 className="font-heading text-xl text-white mb-1">{addon.title}</h3>
                <p className="font-heading text-2xl text-accent mb-2">{addon.price}</p>
                <p className="text-xs text-white/55 font-body font-light flex-1">{addon.desc}</p>
                <Link
                  to="/contact"
                  className="mt-4 text-xs text-accent font-body font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Add to Project <ArrowUpRight className="h-3 w-3" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </Container>
      </Section>

      <CTABanner />
    </main>
  )
}
