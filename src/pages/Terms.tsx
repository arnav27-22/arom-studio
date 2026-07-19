import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'

export default function Terms() {
  return (
    <main className="pt-32">
      <SEO
        title="Terms & Conditions"
        description="AROM Studio terms and conditions governing the use of our website and services."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Legal</span>
            <h1 className="font-heading italic text-5xl md:text-6xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xs text-white/40 font-body mb-10">Last updated: January 2026</p>

            <div className="space-y-8 text-sm text-white/60 font-body font-light leading-relaxed">
              <section>
                <h2 className="font-heading italic text-2xl text-white mb-3">1. Acceptance of Terms</h2>
                <p>By accessing or using the AROM Studio website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
              </section>

              <section>
                <h2 className="font-heading italic text-2xl text-white mb-3">2. Services</h2>
                <p>AROM Studio provides web design, development, and related digital services. The scope, timeline, and pricing of each project will be outlined in a separate agreement.</p>
              </section>

              <section>
                <h2 className="font-heading italic text-2xl text-white mb-3">3. Intellectual Property</h2>
                <p>Upon full payment, clients retain ownership of the final delivered work. AROM Studio retains the right to display the work in its portfolio.</p>
              </section>

              <section>
                <h2 className="font-heading italic text-2xl text-white mb-3">4. Payment Terms</h2>
                <p>Payment terms are outlined in the project proposal. All prices are in Indian Rupees (₹). Late payments may result in project delays.</p>
              </section>

              <section>
                <h2 className="font-heading italic text-2xl text-white mb-3">5. Limitation of Liability</h2>
                <p>AROM Studio shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
