import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'

export default function Refund() {
  return (
    <main className="pt-32">
      <SEO
        title="Refund Policy"
        description="AROM Studio refund and cancellation policy. Learn about our refund terms for web design and development services."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Legal</span>
            <h1 className="font-heading text-5xl md:text-6xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Refund Policy
            </h1>
            <p className="text-xs text-white/40 font-body mb-10">Last updated: January 2026</p>

            <div className="space-y-8 text-sm text-white/60 font-body font-light leading-relaxed">
              <section>
                <h2 className="font-heading text-2xl text-white mb-3">1. Project Deposits</h2>
                <p>The initial deposit (typically 50% of the project cost) is non-refundable as it covers the discovery, research, and design phase work already performed.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">2. Project Cancellation</h2>
                <p>If a project is cancelled after the design phase has begun, the deposit is retained. Any work completed beyond the deposit will be billed at an hourly rate.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">3. Completed Projects</h2>
                <p>Once a project is completed and delivered, all payments are final. Refunds are not issued for completed work that meets the agreed-upon specifications.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">4. Maintenance & Support</h2>
                <p>Monthly maintenance fees are non-refundable but can be cancelled with 30 days&apos; notice.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">5. Dispute Resolution</h2>
                <p>In the event of a dispute, we will work in good faith to find a fair resolution. Please contact us at aromstudio27@gmail.com.</p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
