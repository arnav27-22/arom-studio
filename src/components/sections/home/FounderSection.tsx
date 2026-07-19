import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Section, Container } from '../../ui/Section'
import { FadeIn } from '../../motion/FadeIn'

export function FounderSection() {
  return (
    <Section>
      <Container>
        <FadeIn>
          <div className="glass rounded-[32px] p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full glass flex items-center justify-center">
                  <span className="font-heading text-3xl md:text-4xl text-accent">AP</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <span className="text-xs text-white/40 font-body uppercase tracking-[0.2em]">Founder</span>
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white tracking-[-1px] leading-none mt-2 mb-1">
                  Arnav Pagare
                </h2>
                <p className="text-sm text-accent font-body font-medium mb-5">Founder & Solo Developer</p>
                <p className="text-base text-white/60 font-body font-light leading-relaxed max-w-2xl">
                  AROM STUDIO was founded with a mission to build premium digital experiences that help businesses grow.
                  Every project is approached with craftsmanship, attention to detail, and a commitment to solving real
                  business problems — not just building beautiful interfaces.
                </p>
                <div className="flex items-center gap-6 mt-6">
                  <Link
                    to="/about"
                    className="text-sm text-white/70 hover:text-white transition-colors font-body font-light inline-flex items-center gap-1.5"
                  >
                    More about me
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  )
}
