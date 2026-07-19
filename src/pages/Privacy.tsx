import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'

export default function Privacy() {
  return (
    <main className="pt-32">
      <SEO
        title="Privacy Policy"
        description="AROM STUDIO privacy policy. Learn how we collect, use, and protect your personal information."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Legal</span>
            <h1 className="font-heading text-5xl md:text-6xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xs text-white/40 font-body mb-10">Last updated: January 2026</p>

            <div className="space-y-8 text-sm text-white/60 font-body font-light leading-relaxed">
              <section>
                <h2 className="font-heading text-2xl text-white mb-3">1. Information We Collect</h2>
                <p>We collect information you provide directly, such as your name, email address, phone number, and project details when you fill out our contact form or book a consultation.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">2. How We Use Your Information</h2>
                <p>We use the information we collect to respond to your inquiries, provide our services, improve our website, and send relevant communications about your projects.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">3. Data Protection</h2>
                <p>We implement appropriate security measures to protect your personal information. We do not sell, trade, or transfer your information to third parties without your consent.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">4. Cookies</h2>
                <p>Our website may use cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">5. Contact</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at aromstudio27@gmail.com.</p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
