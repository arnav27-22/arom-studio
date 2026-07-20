import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react'
import { SOCIAL_LINKS } from '../../constants/navigation'
import { Container } from '../ui/Section'

const footerLinks = {
  Services: [
    { label: 'Business Websites', href: '/services/business-websites' },
    { label: 'E-commerce', href: '/services/ecommerce' },
    { label: 'Web Applications', href: '/services/web-applications' },
    { label: 'UI/UX Design', href: '/services/ui-ux-design' },
    { label: 'SEO Optimization', href: '/services/seo-optimization' },
    { label: 'All Services', href: '/services' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Plans', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/5 pt-20 pb-8">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-heading text-white text-xl">AROM STUDIO</span>
            </Link>
            <p className="text-sm text-white/50 font-body font-light leading-relaxed max-w-xs">
              Crafting premium digital experiences for ambitious businesses. Based in India, serving globally.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href={SOCIAL_LINKS.email}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-accent transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-whatsapp transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1 md:col-span-2">
              <h4 className="text-xs font-body font-semibold text-white/40 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 font-body font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="text-xs font-body font-semibold text-white/40 uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={SOCIAL_LINKS.email}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200 font-body font-light"
                >
                  aromstudio27@gmail.com
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-whatsapp transition-colors duration-200 font-body font-light inline-flex items-center gap-1"
                >
                  WhatsApp
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-accent hover:text-accent-light transition-colors duration-200 font-body font-medium"
                >
                  Book a Consultation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-body">
            &copy; {currentYear} AROM STUDIO. All rights reserved. Crafted with precision in India.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors font-body">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors font-body">
              Terms
            </Link>
            <Link to="/refund" className="text-xs text-white/30 hover:text-white/60 transition-colors font-body">
              Refund Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
