import { Section, Container, SectionHeader } from '../../ui/Section'
import { GlassCard } from '../../ui/GlassCard'
import { testimonials } from '../../../data/testimonials'
import { Star } from 'lucide-react'

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
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-sm text-white/75 font-body font-light leading-relaxed flex-1 mb-6 italic">
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
