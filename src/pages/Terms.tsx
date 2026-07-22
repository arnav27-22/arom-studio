import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'

export default function Terms() {
  return (
    <main className="pt-32">
      <SEO
        title="Terms & Conditions"
        description="AROM STUDIO terms and conditions governing the use of our website and services."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Legal</span>
            <h1 className="font-heading text-5xl md:text-6xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-white/40 font-body mb-10">Last updated: July 2026</p>

            <div className="space-y-8 text-sm text-white/60 font-body font-light leading-relaxed">
              <section>
                <h2 className="font-heading text-2xl text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Arom Studio website (arom-studio.vercel.app), you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you must not use our website or services.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">2. Services Described</h2>
                <p>
                  Arom Studio is a creative web design and development agency. This website is informational in nature and serves as a platform for client inquiries. Any services requested through this site will be governed by a separate project agreement signed by both parties.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">3. Intellectual Property</h2>
                <p>
                  All content on this website — including but not limited to text, graphics, logos, portfolio work, design mockups, code samples, and software — is the intellectual property of Arom Studio and is protected under Indian copyright law. Unauthorized reproduction, distribution, or modification of any content is strictly prohibited without prior written consent.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">4. User Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Scrape, crawl, or copy any content from this website without permission</li>
                  <li>Misrepresent yourself or provide false information through our contact forms</li>
                  <li>Use this website for any unlawful purpose or in violation of applicable Indian laws</li>
                  <li>Attempt to disrupt, damage, or gain unauthorised access to our systems</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">5. Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party websites or services (e.g., Google Forms, WhatsApp). We are not responsible for the content, privacy practices, or availability of these external sites. Accessing them is at your own risk.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">6. Disclaimer of Warranties</h2>
                <p>
                  This website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Arom Studio makes no warranties, express or implied, regarding the uninterrupted availability, accuracy, or completeness of the website. We reserve the right to modify or discontinue the website at any time without notice.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">7. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, Arom Studio and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use this website, even if we have been advised of the possibility of such damages.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">8. Governing Law &amp; Jurisdiction</h2>
                <p>
                  These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts in <strong>Nashik, Maharashtra</strong>.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">9. Changes to Terms</h2>
                <p>
                  We reserve the right to update or modify these Terms &amp; Conditions at any time without prior notice. Changes will be effective immediately upon posting to this page. Your continued use of the website after any changes constitutes acceptance of the revised terms.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">10. Contact</h2>
                <p>
                  For legal queries or concerns regarding these Terms &amp; Conditions, please contact us at <strong>aromstudio27@gmail.com</strong>.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
