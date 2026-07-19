import { Section, Container, SectionHeader } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { StaggerContainer, StaggerItem } from '../components/motion/FadeIn'
import { CTABanner } from '../components/sections/shared/CTABanner'
import { services } from '../data/services'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Building2, ShoppingCart, AppWindow, Cloud, Palette, RefreshCw, Search, Zap, Brain, Users, Check } from 'lucide-react'
import { useState } from 'react'

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-6 w-6" />,
  ShoppingCart: <ShoppingCart className="h-6 w-6" />,
  AppWindow: <AppWindow className="h-6 w-6" />,
  Cloud: <Cloud className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  RefreshCw: <RefreshCw className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Brain: <Brain className="h-6 w-6" />,
}

export default function Services() {
  const navigate = useNavigate()
  const [expandedService, setExpandedService] = useState<string | null>(null)

  return (
    <main className="pt-32">
      <SEO
        title="Services"
        description="AROM Studio offers business websites, e-commerce, web applications, SaaS platforms, UI/UX design, SEO, and more. Premium web development services for Indian businesses."
      />
      <Section>
        <Container>
          <SectionHeader
            badge="What We Offer"
            title="Full-service digital"
            highlightWord="agency"
            description="From strategy to launch and beyond — every service designed to help your business succeed online. All plans include 1 Year Support."
          />

          <div className="mb-10 glass rounded-full px-5 py-3 text-sm text-white/70 font-body inline-flex items-center gap-3 mx-auto w-fit flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> 1 Year Support</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> Free Domain (1 Year)</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> Custom Domain Setup</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> WhatsApp Integration</span>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <StaggerItem key={service.slug}>
                <div
                  className="glass rounded-[24px] p-6 cursor-pointer h-full flex flex-col group transition-all duration-300 hover:shadow-[0_0_30px_0_rgba(78,133,191,0.1)]"
                  onClick={() => navigate(`/services/${service.slug}`)}
                  onMouseEnter={() => setExpandedService(service.slug)}
                  onMouseLeave={() => setExpandedService(null)}
                >
                  <div className="w-11 h-11 rounded-[12px] glass flex items-center justify-center text-accent mb-5 group-hover:border-accent/30 transition-all">
                    {iconMap[service.icon] || <Building2 className="h-6 w-6" />}
                  </div>
                  <h3 className="font-heading text-2xl text-white tracking-[-0.5px] mb-3 leading-tight">{service.title}</h3>
                  <p className="text-sm text-white/55 font-body font-light leading-relaxed flex-1 line-clamp-3">
                    {expandedService === service.slug && service.longDescription ? service.longDescription : service.description}
                  </p>

                  {service.techTags && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {service.techTags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] text-white/40 font-body border border-white/10 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <span className="font-heading text-lg text-accent">{service.price}</span>
                    <div className="flex items-center gap-1.5 text-xs text-accent font-medium group-hover:gap-2.5 transition-all duration-300">
                      Learn More <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      {/* Why Choose Us */}
      <Section>
        <Container>
          <SectionHeader
            badge="Why AROM Studio"
            title="What makes us"
            highlightWord="different"
            description="We don't just build websites — we build digital experiences that drive real business results."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Zap className="h-5 w-5" />, title: 'Performance First', desc: 'Every website targets Lighthouse 95+ scores. Speed is not an afterthought — it\'s a requirement.' },
              { icon: <Building2 className="h-5 w-5" />, title: 'Premium Design', desc: 'Custom designs tailored to your brand. No templates, no shortcuts. Every pixel is intentional.' },
              { icon: <Users className="h-5 w-5" />, title: 'Dedicated Support', desc: '1 Year support included with every project. We don\'t disappear after launch.' },
              { icon: <Check className="h-5 w-5" />, title: 'Transparent Process', desc: 'Clear communication, honest timelines, and no hidden costs. What you see is what you get.' },
            ].map((item) => (
              <GlassCard key={item.title} className="text-center">
                <div className="w-10 h-10 rounded-[10px] glass flex items-center justify-center text-accent mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/55 font-body font-light leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </Container>
      </Section>

      <CTABanner />
    </main>
  )
}
