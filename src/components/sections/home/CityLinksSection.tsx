import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../ui/Section'
import { FadeIn } from '../../motion/FadeIn'
import { indianCities, slugifyCity } from '../../../data/cities'

const topCities = indianCities.slice(0, 12)

export function CityLinksSection() {
  return (
    <Section>
      <Container>
        <SectionHeader
          badge="Locations"
          title="Serving"
          highlightWord="worldwide"
          description="Based in Nashik, working with businesses across India and globally."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {topCities.map((city, i) => (
            <FadeIn key={city} delay={i * 0.04}>
              <Link
                to={`/web-design-${slugifyCity(city)}`}
                className="glass rounded-[18px] px-4 py-3 flex items-center gap-2.5 group hover:border-accent/30 transition-all"
              >
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-sm text-white/70 font-body font-light group-hover:text-white transition-colors truncate">
                  {city}
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <p className="text-center text-sm text-white/40 font-body mt-6">
            And 250+ more cities across India —{' '}
            <Link to="/sitemap.xml" className="text-accent hover:underline">View all</Link>
          </p>
        </FadeIn>
      </Container>
    </Section>
  )
}
