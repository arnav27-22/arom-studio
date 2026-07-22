import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'

export default function Privacy() {
  return (
    <main className="pt-32">
      <SEO
        title="Privacy Policy"
        description="AROM STUDIO privacy policy — DPDP Act compliant. Learn how we collect, use, and protect your personal information."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Legal</span>
            <h1 className="font-heading text-5xl md:text-6xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xs text-white/40 font-body mb-10">Last updated: July 2026</p>

            <div className="space-y-8 text-sm text-white/60 font-body font-light leading-relaxed">
              <section>
                <h2 className="font-heading text-2xl text-white mb-3">1. Introduction</h2>
                <p>
                  Arom Studio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website arom-studio.vercel.app. This Privacy Policy explains how we collect, use, and protect your personal data when you interact with our website. It is designed to comply with the Digital Personal Data Protection (DPDP) Act, 2023 of India. By using our website, you consent to the practices described in this policy.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">2. Data We Collect</h2>
                <p>We collect only the personal data you voluntarily provide to us:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Your full name</li>
                  <li>Your email address</li>
                  <li>Your phone number (optional)</li>
                  <li>Any message or project details you submit via our contact form</li>
                </ul>
                <p className="mt-2">We do <strong>not</strong> collect payment data, financial information, or sensitive personal data through this website.</p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">3. Purpose of Collection (Lawful Basis)</h2>
                <p>We collect your data for the following purposes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Contact form submissions:</strong> To respond to your inquiries, provide quotes, and communicate about potential projects.</li>
                  <li><strong>Service communication:</strong> To correspond with you regarding any services you request from us.</li>
                </ul>
                <p className="mt-2">
                  Under the DPDP Act, our lawful basis for processing your data is <strong>your consent</strong>, which you provide by submitting our contact form after accepting this Privacy Policy and our Terms &amp; Conditions.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">4. How We Use Your Data</h2>
                <p>Your data is used exclusively for internal purposes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Responding to your inquiries and project requests</li>
                  <li>Sending relevant communications regarding your project</li>
                  <li>Improving our website and services</li>
                </ul>
                <p className="mt-2">
                  We do <strong>not</strong> sell, trade, or share your personal data with third parties for their marketing purposes. We may share your data with trusted service providers (e.g., EmailJS for email delivery) solely for the purpose of operating our website and responding to you. These providers are bound by data processing agreements.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">5. Data Retention</h2>
                <p>
                  We retain your personal data only as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law. If you have not engaged our services, we will delete your data within 12 months of your last interaction. You may request earlier deletion at any time (see Section 6).
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">6. Your Rights Under the DPDP Act</h2>
                <p>As a data principal under the DPDP Act, 2023, you have the following rights:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong>Right to Correction:</strong> Request that we correct any inaccurate or incomplete data.</li>
                  <li><strong>Right to Erasure:</strong> Request that we delete your personal data.</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time without affecting the lawfulness of processing before withdrawal.</li>
                  <li><strong>Right to Grieve:</strong> If you are not satisfied with our response, you have the right to file a grievance with the Data Protection Board of India.</li>
                </ul>
                <p className="mt-2">
                  To exercise any of these rights, please contact us at <strong>aromstudio27@gmail.com</strong>. We will respond within 30 days as required by the DPDP Act.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">7. Consent Withdrawal</h2>
                <p>
                  You may withdraw your consent to our processing of your data at any time by emailing <strong>aromstudio27@gmail.com</strong>. Once we receive your withdrawal request, we will stop processing your data and delete it within a reasonable timeframe, unless we are required by law to retain it.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">8. Language Accessibility</h2>
                <p>
                  Upon request, this policy can be made available in any of the 22 scheduled Indian languages listed in the Eighth Schedule of the Indian Constitution. Please contact us at <strong>aromstudio27@gmail.com</strong> to request a translated version.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">9. Cookies</h2>
                <p>
                  Our website uses minimal cookies — only those necessary for essential functionality (e.g., form submissions). We do not use tracking or advertising cookies. You can configure your browser to reject cookies, but this may affect certain features of the website.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">10. Contact / Grievance Officer</h2>
                <p>If you have any questions, concerns, or grievances regarding this Privacy Policy or your data, you may contact our Grievance Officer:</p>
                <div className="mt-2 p-4 glass rounded-[18px]">
                  <p className="text-white"><strong>Arnav Pagare</strong></p>
                  <p>Email: <strong>aromstudio27@gmail.com</strong></p>
                  <p>We will acknowledge your grievance within 24 hours and resolve it within 30 days as per the DPDP Act.</p>
                </div>
              </section>

              <section>
                <h2 className="font-heading text-2xl text-white mb-3">11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this page periodically. If we make material changes, we will notify you via email or a prominent notice on our website.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
