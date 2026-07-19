import { Link } from 'react-router-dom'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { Container } from '../../ui/Section'
import { FadeIn } from '../../motion/FadeIn'
import { SOCIAL_LINKS } from '../../../constants/navigation'

export function CTABanner() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-accent/5 to-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />

      <Container className="relative z-10 text-center">
        <FadeIn>
          <h2 className="font-heading italic text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-[-3px] max-w-3xl mx-auto">
            Ready to Build
            <br />
            <span className="text-accent">Something Premium?</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/60 font-body font-light max-w-lg mx-auto">
            Let&apos;s discuss your project over a free consultation. No pressure, just possibilities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              to="/contact"
              className="glass-strong text-sm md:text-base font-body font-medium text-white rounded-full px-8 py-3.5 inline-flex items-center gap-2 hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              Book Free Consultation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="glass text-sm md:text-base font-body font-medium text-white rounded-full px-8 py-3.5 inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4 text-whatsapp" />
              WhatsApp Us
            </a>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
