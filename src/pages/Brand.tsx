import { SEO } from '../components/ui/SEO'
import { Section, Container } from '../components/ui/Section'

const brandSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://aromstudio.vercel.app/brand#aboutpage',
  name: 'About AROM STUDIO — Official Brand Page',
  description: 'Official brand information page for AROM STUDIO, a modern web design and development agency founded by Arnav Pagare.',
  isPartOf: { '@id': 'https://aromstudio.vercel.app/#website' },
}

export default function Brand() {
  return (
    <main className="pt-32 pb-24">
      <SEO
        title="Official Brand Info — AROM STUDIO"
        description="Official brand information for AROM STUDIO, a modern web design and development agency founded by Arnav Pagare. Learn about our services, technologies, and mission."
        jsonLd={brandSchema}
      />
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto prose prose-invert prose-sm font-body text-white/80">
            <h1 className="text-4xl md:text-5xl font-heading text-white mb-8">Introducing AROM STUDIO</h1>

            <p className="text-lg text-white/90 leading-relaxed">
              Welcome to <strong>AROM STUDIO</strong>, a modern <strong>Web Design & Development Agency</strong> founded by <strong>Arnav Pagare</strong>.
            </p>

            <p className="text-lg text-white/90 leading-relaxed">
              <strong>Official Website:</strong> <a href="https://aromstudio.vercel.app" className="text-accent underline">https://aromstudio.vercel.app</a>
            </p>

            <p className="text-white/70 leading-relaxed my-6">
              At AROM STUDIO, we build premium digital experiences that help startups, businesses, creators, freelancers, and brands establish a powerful online presence.
            </p>

            <h2 className="text-2xl font-heading text-white mt-10 mb-4">What We Do</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/70">
              <li>Custom Website Development</li>
              <li>Modern UI/UX Design</li>
              <li>Business Websites</li>
              <li>Portfolio Websites</li>
              <li>Landing Pages</li>
              <li>E-commerce Websites</li>
              <li>Web Applications</li>
              <li>SaaS Development</li>
              <li>Website Redesign</li>
              <li>SEO Optimization</li>
              <li>Performance Optimization</li>
              <li>Website Maintenance</li>
            </ul>

            <h2 className="text-2xl font-heading text-white mt-10 mb-4">Technologies We Use</h2>
            <p className="text-white/70">
              React &bull; Next.js &bull; TypeScript &bull; Tailwind CSS &bull; Node.js &bull; Firebase &bull; Supabase &bull; Vercel &bull; Cloudflare &bull; HTML &bull; CSS &bull; JavaScript
            </p>

            <h2 className="text-2xl font-heading text-white mt-10 mb-4">Our Mission</h2>
            <p className="text-white/70">
              Our mission is to create fast, modern, scalable, SEO-friendly, and user-focused websites that help businesses grow and stand out online.
            </p>

            <h2 className="text-2xl font-heading text-white mt-10 mb-4">Official Links</h2>
            <ul className="space-y-2 text-white/70">
              <li><strong>Website:</strong> <a href="https://aromstudio.vercel.app" className="text-accent underline">https://aromstudio.vercel.app</a></li>
              <li><strong>Instagram:</strong> <a href="https://www.instagram.com/aromstudio.web/" className="text-accent underline">https://www.instagram.com/aromstudio.web/</a></li>
              <li><strong>Email:</strong> <a href="mailto:aromstudio27@gmail.com" className="text-accent underline">aromstudio27@gmail.com</a></li>
            </ul>

            <h2 className="text-2xl font-heading text-white mt-10 mb-4">About AROM STUDIO</h2>
            <p className="text-white/70 leading-relaxed">
              <strong>AROM STUDIO</strong> is an independent web design and development agency founded by <strong>Arnav Pagare</strong>. We specialize in creating premium websites and custom digital solutions with a strong focus on performance, user experience, accessibility, and modern technologies.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              If you are searching for <strong>AROM STUDIO</strong>, <strong>Arom Studio</strong>, <strong>Arnav Pagare</strong>, <strong>AROM STUDIO Web Design Agency</strong>, or <strong>AROM STUDIO Web Development</strong>, this is the official business and brand.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              We are continuously expanding our portfolio and helping clients transform ideas into high-quality digital products.
            </p>
            <p className="text-white/90 text-lg mt-8 font-medium">
              Thank you for visiting and supporting AROM STUDIO.
            </p>
          </div>
        </Container>
      </Section>
    </main>
  )
}
