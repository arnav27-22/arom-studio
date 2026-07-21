import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { NAV_LINKS } from '../../constants/navigation'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }, [location.pathname, navigate])

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        )}
      >
        <div className="flex justify-center pt-4 px-4">
          <div
            className={cn(
              'inline-flex items-center rounded-full px-2 py-2 transition-all duration-500 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/20 border border-white/10',
            )}
          >
            {/* Logo */}
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 px-2 cursor-pointer">
              <span className="font-heading text-white text-lg md:text-xl tracking-tight">
                AROM STUDIO
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'text-sm font-body font-light rounded-full px-4 py-2 transition-all duration-200',
                    location.pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-white/65 hover:text-white hover:bg-white/5',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <a
                href="https://forms.gle/fGwvkaTRdtb5ZH3x6"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-strong text-sm font-body font-medium text-white rounded-full px-5 py-2 hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.1)] transition-all duration-200 inline-flex items-center gap-1.5"
              >
                Book Consultation
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white ml-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'text-3xl font-heading transition-colors duration-200',
                    location.pathname === link.href
                      ? 'text-white'
                      : 'text-white/40 hover:text-white',
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="https://forms.gle/fGwvkaTRdtb5ZH3x6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="glass-strong text-base font-body font-medium text-white rounded-full px-8 py-4 inline-flex items-center gap-2"
              >
                Book Consultation
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
