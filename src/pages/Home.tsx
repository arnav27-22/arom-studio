import { SEO } from '../components/ui/SEO'
import { HeroSection } from '../components/sections/home/HeroSection'
import { ServicesSection } from '../components/sections/home/ServicesSection'
import { PortfolioSection } from '../components/sections/home/PortfolioSection'
import { ProcessSection } from '../components/sections/home/ProcessSection'
import { TechStackSection } from '../components/sections/home/TechStackSection'
import { FounderSection } from '../components/sections/home/FounderSection'
import { TestimonialsSection } from '../components/sections/home/TestimonialsSection'
import { PricingPreview } from '../components/sections/home/PricingPreview'
import { CTABanner } from '../components/sections/shared/CTABanner'

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AROM Studio',
  url: 'https://aromstudio.vercel.app',
  description: 'Premium web design and development agency crafting high-performance websites and digital experiences for Indian businesses.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://aromstudio.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function Home() {
  return (
    <main>
      <SEO
        title="Home"
        description="AROM Studio is a premium web design and development agency crafting high-performance websites and digital experiences for Indian businesses. 1 Year Support included."
        jsonLd={homeSchema}
      />
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <ProcessSection />
      <TechStackSection />
      <FounderSection />
      <TestimonialsSection />
      <PricingPreview />
      <CTABanner />
    </main>
  )
}
