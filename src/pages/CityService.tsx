import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SEO } from '../components/ui/SEO'
import { Section, Container } from '../components/ui/Section'
import { services } from '../data/services'
import { indianCities, getCityFromSlug, slugifyCity } from '../data/cities'
import { CTABanner } from '../components/sections/shared/CTABanner'

export default function CityService() {
  const { slug, cityName } = useParams<{ slug: string; cityName: string }>()
  const service = slug ? services.find(s => s.slug === slug) : undefined
  const city = cityName ? getCityFromSlug(cityName) : undefined

  if (!service || !city) {
    return (
      <main className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">Page not found</h1>
          <Link to="/" className="text-accent hover:underline font-body">Back to Home</Link>
        </div>
      </main>
    )
  }

  const title = `${service.title} in ${city}`
  const description = `Premium ${service.title.toLowerCase()} services in ${city} by AROM STUDIO. ${service.description} Get a free consultation for your ${city}-based business.`

  return (
    <main className="pt-32">
      <SEO
        title={title}
        description={description}
        canonicalPath={`/services/${slug}/in/${cityName}`}
      />
      <Section>
        <Container>
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-body mb-8 transition-colors">
            <ArrowUpRight className="h-4 w-4 rotate-[225deg]" /> All Services
          </Link>

          <div className="max-w-4xl">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">{service.title}</span>
            <h1 className="font-heading text-5xl md:text-7xl text-white leading-[0.9] tracking-[-2px] mt-2 mb-4">
              {service.title} in <span className="text-accent">{city}</span>
            </h1>
            <p className="text-base text-white/60 font-body font-light leading-relaxed mb-6 max-w-3xl">
              {service.title} services for businesses and startups in {city}. {service.longDescription}
            </p>
          </div>

          <div className="mt-12">
            <h2 className="font-heading text-2xl text-white mb-6">Other cities we serve</h2>
            <div className="flex flex-wrap gap-2">
              {indianCities.slice(0, 12).filter(c => c !== city).map(c => (
                <Link
                  key={c}
                  to={`/services/${slug}/in/${slugifyCity(c)}`}
                  className="text-xs text-white/50 hover:text-accent font-body border border-white/10 px-3 py-1.5 rounded-full hover:border-accent/30 transition-all"
                >
                  {service.title} in {c}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <CTABanner />
    </main>
  )
}
