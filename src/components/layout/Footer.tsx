import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-whatsapp transition-colors"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1 md:col-span-2">
              <Link
                to={title === 'Services' ? '/services' : title === 'Company' ? '/about' : '/privacy'}
                className="text-xs font-body font-semibold text-white/40 hover:text-accent uppercase tracking-wider mb-4 flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200 group w-full"
              >
                {title}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
              </Link>
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
            <Link
              to="/contact"
              className="text-xs font-body font-semibold text-white/40 hover:text-accent uppercase tracking-wider mb-4 flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200 group w-full"
            >
              Contact
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
            </Link>
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
