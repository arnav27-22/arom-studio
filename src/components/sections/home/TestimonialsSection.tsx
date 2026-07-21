import { Section, Container, SectionHeader } from '../../ui/Section'
import { GlassCard } from '../../ui/GlassCard'
import { testimonials } from '../../../data/testimonials'

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 !== 0

  return (
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: full }).map((_, j) => (
        <svg key={`f${j}`} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-accent">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      {half && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" stroke="currentColor" strokeWidth="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          <path fill="none" stroke="currentColor" strokeWidth="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <Section>
      <Container>
        <SectionHeader
          badge="Testimonials"
          title="What our"
          highlightWord="clients say"
          description="Feedback from the businesses we've had the privilege to work with."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <GlassCard key={t.id} className="flex flex-col" hover>
              <Stars rating={t.rating} />
              <blockquote className="text-sm md:text-base text-white/75 font-body font-light leading-relaxed flex-1 mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-body font-medium text-white">{t.client}</p>
                <p className="text-xs text-white/40 font-body">{t.company}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </Container>
    </Section>
  )
}
