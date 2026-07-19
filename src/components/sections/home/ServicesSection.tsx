import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Building2, ShoppingCart, AppWindow, Cloud, Palette, RefreshCw, Check } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../ui/Section'
import { StaggerContainer, StaggerItem } from '../../motion/FadeIn'

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-6 w-6" />,
  ShoppingCart: <ShoppingCart className="h-6 w-6" />,
  AppWindow: <AppWindow className="h-6 w-6" />,
  Cloud: <Cloud className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  RefreshCw: <RefreshCw className="h-6 w-6" />,
}

const featuredServices = [
  { slug: 'business-websites', title: 'Business Websites', description: 'High-performance websites that establish credibility and drive leads. Includes 1 Year Support & Free Domain.', icon: 'Building2', price: '₹45,000+' },
  { slug: 'ecommerce', title: 'E-commerce', description: 'Scalable online stores with seamless checkout and inventory management. Includes payment gateway integration.', icon: 'ShoppingCart', price: '₹55,000+' },
  { slug: 'web-applications', title: 'Web Applications', description: 'Custom web applications built to solve complex business problems with modern full-stack technology.', icon: 'AppWindow', price: '₹75,000+' },
  { slug: 'saas-platforms', title: 'SaaS Platforms', description: 'Multi-tenant platforms with subscription billing, user management, and scalable cloud infrastructure.', icon: 'Cloud', price: '₹1,00,000+' },
  { slug: 'ui-ux-design', title: 'UI/UX Design', description: 'User-centered design that blends aesthetics with usability for intuitive digital experiences.', icon: 'Palette', price: '₹25,000+' },
  { slug: 'website-redesign', title: 'Website Redesign', description: 'Transform your existing site into a modern, high-performance digital experience with full SEO preservation.', icon: 'RefreshCw', price: '₹30,000+' },
]

export function ServicesSection() {
  const navigate = useNavigate()

  return (
    <Section>
      <Container>
        <SectionHeader
          badge="What We Build"
          title="Expertise that drives"
          highlightWord="results"
          description="From business websites to custom SaaS platforms, we build digital products that combine premium design with engineering excellence. Every project includes 1 Year Support and Free Domain."
        />

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50 font-body">
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-accent" /> 1 Year Support</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-accent" /> Free Domain (1 Year)</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-accent" /> Custom Domain Setup</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-accent" /> WhatsApp Integration</span>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredServices.map((service) => (
            <StaggerItem key={service.slug}>
              <div
                className="glass rounded-[24px] p-6 cursor-pointer h-full flex flex-col group transition-all duration-300 hover:shadow-[0_0_30px_0_rgba(78,133,191,0.1)]"
                onClick={() => navigate(`/services/${service.slug}`)}
              >
                <div className="w-11 h-11 rounded-[12px] glass flex items-center justify-center text-accent mb-5 group-hover:border-accent/30 transition-all">
                  {iconMap[service.icon]}
                </div>
                <h3 className="font-heading text-2xl md:text-3xl text-white tracking-[-1px] leading-none mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-white/60 font-body font-light leading-relaxed flex-1">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                  <span className="font-heading text-base text-accent">{service.price}</span>
                  <div className="flex items-center gap-1.5 text-xs text-accent font-medium group-hover:gap-2.5 transition-all duration-300">
                    Learn More <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="text-center mt-10">
          <Link
            to="/services"
            className="glass inline-flex items-center gap-2 text-sm font-body font-medium text-white rounded-full px-6 py-3 hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.07)] transition-all duration-300 hover:scale-[1.02]"
          >
            View All Services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
