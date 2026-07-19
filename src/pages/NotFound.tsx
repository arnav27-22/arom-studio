import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Domain', href: '/' },
  { label: 'Servers', href: '/' },
  { label: 'Cloud', href: '/' },
  { label: 'Managed', href: '/' },
  { label: 'Email', href: '/' },
  { label: 'Privacy', href: '/' },
]

const footerColumns = [
  { title: 'SERVERS', links: ['Web Servers', 'VPS Servers', 'Cloud Servers', 'Managed Instances', 'Bare Metal'] },
  { title: 'DOMAINS', links: ['Find Domain', 'Move Domains', 'DNS Manager', 'Domain Costs'] },
  { title: 'HELP US', links: ['Open a Ticket', 'FAQs', 'Docs', 'Tutorials', 'Forum'] },
  { title: 'ABOUT', links: ['Our Story', 'Leadership Team', 'Press Room', 'We Hire', 'Alliance', 'Blog'] },
]

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
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ fontFamily: '"Helvetica Now Var", Helvetica, Arial, sans-serif' }}>
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 480 480" fill="white">
              <path d="M480 240a240 240 0 0 0-240 240 240 240 0 0 0 240-240Z" />
              <path d="M240 0A240 240 0 0 0 0 240 240 240 0 0 0 240 0Z" />
              <path d="M480 240A240 240 0 0 0 240 0a240 240 0 0 0 240 240Z" />
              <path d="M240 480A240 240 0 0 0 0 240a240 240 0 0 0 240 480Z" />
            </svg>
            <span className="text-white text-xl font-bold tracking-wider">NEXOVA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-white/80 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Login */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-semibold text-white bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-2.5 rounded-full inline-flex items-center gap-2"
            >
              LOG IN
              <ArrowRight className="h-4 w-4" />
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
                      key={link.label}
                      to={link.href}
                      onClick={closeMenu}
                      className="block text-center text-lg sm:text-xl font-light tracking-[0.08em] text-white/80 hover:text-white"
                      style={{
                        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                        transitionDelay: menuVisible ? `${350 + i * 50}ms` : '0ms',
                        opacity: menuVisible ? 1 : 0,
                        transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="block text-center text-base font-semibold text-white bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-3 rounded-full"
                    style={{
                      transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                      transitionDelay: menuVisible ? `${350 + navLinks.length * 50}ms` : '0ms',
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                    }}
                  >
                    LOG IN
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hero 404 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 md:py-0">
          <h1 className="text-white/80 text-lg sm:text-2xl md:text-3xl lg:text-5xl font-light leading-snug tracking-tight mb-1 sm:mb-2">
            This page seems to have
          </h1>
          <h1 className="text-white/80 text-lg sm:text-2xl md:text-3xl lg:text-5xl font-light leading-snug tracking-tight mb-8 sm:mb-12">
            slipped beyond our reach :/
          </h1>

          <div className="relative mb-8 sm:mb-12 w-full flex justify-center overflow-visible">
            <span
              className="text-[80px] sm:text-[140px] md:text-[200px] lg:text-[260px] font-black text-white leading-none tracking-tighter select-none four-oh-four"
            >
              404
            </span>
          </div>

          <Link
            to="/"
            className="liquid-glass text-white text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full uppercase inline-block"
          >
            Return to Main Page
          </Link>
        </div>

        {/* Footer */}
        <footer className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-10 pt-10 sm:pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-6">
            {footerColumns.map((col) => (
              <div key={col.title} className="col-span-1">
                <h4 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="/"
                        className="text-white/50 hover:text-white/80 text-[10px] sm:text-xs transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div className="col-span-2 lg:col-span-2">
              <h4 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4">
                JOIN FOR EXCLUSIVE DEALS
              </h4>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Type your email to sign up"
                  className="flex-1 bg-white text-black text-xs px-3 py-2.5 rounded-l-md placeholder:text-black/40 outline-none"
                />
                <button className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-xs font-bold tracking-wider px-4 py-2.5 rounded-r-md whitespace-nowrap">
                  SEND IT
                </button>
              </div>
              <h4 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mt-5 sm:mt-6 mb-3">
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
            <p className="text-[10px] text-white/30">
              &copy; {new Date().getFullYear()} NEXOVA. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .four-oh-four {
          text-shadow: 0 0 80px rgba(255,255,255,0.3), 0 0 160px rgba(255,255,255,0.1);
        }
        .liquid-glass {
          background: rgba(255, 255, 255, 0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .liquid-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
