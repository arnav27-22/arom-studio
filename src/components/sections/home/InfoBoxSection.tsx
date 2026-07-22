import { Section, Container } from '../../ui/Section'
import { FadeIn } from '../../motion/FadeIn'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

export function InfoBoxSection() {
  return (
    <Section>
      <Container>
        <FadeIn>
          <div className="glass-strong rounded-[32px] p-8 md:p-12 lg:p-16 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="glass inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-white/80 mb-4">
                Get in Touch
              </div>
              <h2 className="font-heading text-4xl md:text-5xl text-white leading-[1.1] tracking-[-1.5px]">
                Let&apos;s Work Together
              </h2>
              <p className="mt-4 text-base text-white/60 font-body font-light max-w-xl mx-auto">
                Reach out to us — we&apos;re here to help with your next project.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="tel:+918767990061"
                className="glass rounded-[24px] p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left hover:border-accent/30 transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <span className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Phone</span>
                <span className="text-xl md:text-2xl text-white font-heading tracking-tight break-all">+91 8767990061</span>
              </a>

              <a
                href="mailto:aromstudio27@gmail.com"
                className="glass rounded-[24px] p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left hover:border-accent/30 transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <span className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Email</span>
                <span className="text-lg md:text-xl text-white font-heading tracking-tight break-all">aromstudio27@gmail.com</span>
              </a>

              <a
                href="https://wa.me/918767990061"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-[24px] p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left hover:border-accent/30 transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/20 transition-colors">
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                </div>
                <span className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">WhatsApp</span>
                <span className="text-lg md:text-xl text-white font-heading tracking-tight">Chat with us</span>
              </a>

              <div className="glass rounded-[24px] p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <span className="text-xs text-white/40 font-body uppercase tracking-wider mb-1">Location</span>
                <span className="text-lg md:text-xl text-white font-heading tracking-tight">Nashik, India</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  )
}
