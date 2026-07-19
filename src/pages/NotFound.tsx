import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { SEO } from '../components/ui/SEO'

const navLinks = ['Home', 'Services', 'Portfolio', 'Pricing', 'Contact']

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)

  const openMenu = () => {
    setMobileMenuOpen(true)
    setTimeout(() => setMenuVisible(true), 50)
  }

  const closeMenu = () => {
    setMenuVisible(false)
    setTimeout(() => setMobileMenuOpen(false), 500)
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ fontFamily: '"Manrope", "Inter", sans-serif' }}>
      <SEO title="404 — Page Not Found" description="The page you are looking for does not exist. Return to AROM Studio homepage." />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white text-xl font-heading italic tracking-wider">AROM STUDIO</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link}
                to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                className="text-white/70 hover:text-white text-sm tracking-wide transition-colors duration-200 font-body font-light"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Login / CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/contact"
              className="text-sm font-body font-medium text-white bg-gradient-to-r from-accent to-accent-light px-6 py-2.5 rounded-full inline-flex items-center gap-2 hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)] transition-all duration-300"
            >
              Book Consultation
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={mobileMenuOpen ? closeMenu : openMenu}
            className="lg:hidden relative z-[60] w-8 h-8 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <Menu
              className={`h-5 w-5 text-white absolute transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
              }`}
            />
            <X
              className={`h-5 w-5 text-white absolute transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              }`}
            />
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-400 ${
                menuVisible ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={closeMenu}
            />
            <div className="fixed left-0 right-0 top-[68px] z-50">
              <div className="backdrop-blur-xl rounded-b-2xl">
                <div className="relative z-10 px-6 py-8 space-y-5">
                  {navLinks.map((link, i) => (
                    <Link
                      key={link}
                      to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                      onClick={closeMenu}
                      className="block text-center text-lg font-body font-light tracking-[0.08em] text-white/80 hover:text-white"
                      style={{
                        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                        transitionDelay: menuVisible ? `${350 + i * 50}ms` : '0ms',
                        opacity: menuVisible ? 1 : 0,
                        transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="block text-center text-base font-body font-medium text-white bg-gradient-to-r from-accent to-accent-light px-6 py-3 rounded-full"
                    style={{
                      transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                      transitionDelay: menuVisible ? `${350 + navLinks.length * 50}ms` : '0ms',
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                    }}
                  >
                    Book Consultation
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hero 404 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 md:py-0">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-white/80 text-lg sm:text-2xl md:text-3xl lg:text-5xl font-body font-light leading-snug tracking-tight mb-1 sm:mb-2"
          >
            This page seems to have
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-white/80 text-lg sm:text-2xl md:text-3xl lg:text-5xl font-body font-light leading-snug tracking-tight mb-8 sm:mb-12"
          >
            slipped beyond our reach :/
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mb-8 sm:mb-12 w-full flex justify-center overflow-visible"
          >
            <span
              className="text-[80px] xs:text-[100px] sm:text-[140px] md:text-[200px] lg:text-[260px] font-black text-white leading-none tracking-tighter select-none"
              style={{
                textShadow: '0 0 80px rgba(255,255,255,0.3), 0 0 160px rgba(255,255,255,0.1)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              404
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              to="/"
              className="inline-block text-white text-[10px] xs:text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full uppercase font-body"
              style={{
                background: 'rgba(255,255,255,0.01)',
                backgroundBlendMode: 'luminosity',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                border: 'none',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px 4px rgba(78,133,191,0.35), inset 0 1px 1px rgba(255,255,255,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.1)'
              }}
            >
              Return to Main Page
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-10 pt-10 sm:pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-6">
            {[
              { title: 'SERVICES', links: ['Web Design', 'Development', 'E-commerce', 'SEO', 'Maintenance'] },
              { title: 'PORTFOLIO', links: ['All Projects', 'Websites', 'Apps', 'SaaS', 'Redesigns'] },
              { title: 'COMPANY', links: ['About', 'Pricing', 'FAQ', 'Contact', 'Privacy'] },
              { title: 'SUPPORT', links: ['Documentation', 'FAQs', 'Contact', 'WhatsApp', 'Email'] },
            ].map((col) => (
              <div key={col.title} className="col-span-1">
                <h4 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4 font-body">
                  {col.title}
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        to="/"
                        className="text-white/50 hover:text-white/80 text-[10px] sm:text-xs transition-colors duration-200 font-body font-light"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div className="col-span-2 lg:col-span-2">
              <h4 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4 font-body">
                JOIN FOR EXCLUSIVE DEALS
              </h4>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Type your email to sign up"
                  className="flex-1 bg-white text-black text-xs px-3 py-2.5 rounded-l-md placeholder:text-black/40 font-body outline-none"
                />
                <button className="bg-gradient-to-r from-accent to-accent-light text-white text-xs font-bold tracking-wider px-4 py-2.5 rounded-r-md font-body whitespace-nowrap">
                  SEND IT
                </button>
              </div>
              <h4 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mt-5 sm:mt-6 mb-3 font-body">
                CONNECT
              </h4>
              <div className="flex items-center gap-3">
                {['facebook', 'twitter', 'dribbble', 'youtube', 'linkedin', 'instagram'].map((social) => (
                  <a key={social} href="/" className="text-white/50 hover:text-white transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] text-white/30 font-body">
              &copy; {new Date().getFullYear()} AROM Studio. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scroll-reveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .four-oh-four {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
