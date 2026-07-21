import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Shield, Zap, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto pt-32">
        {/* Badge Row */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            <span className="bg-white text-black text-xs font-semibold px-3 py-0.5 rounded-full">Premium</span>
            <span className="text-xs text-white/80 font-body font-light">Web Design & Development Agency — India</span>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
        >
          {[
            { icon: <Check className="h-3 w-3" />, text: '3+ Years Experience' },
            { icon: <Shield className="h-3 w-3" />, text: 'Free Domain Included' },
            { icon: <Zap className="h-3 w-3" />, text: 'Lighthouse 95+' },
            { icon: <Globe className="h-3 w-3" />, text: 'Custom Domain Setup' },
          ].map((badge) => (
            <span key={badge.text} className="glass inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs text-white/60 font-body">
              <span className="text-accent">{badge.icon}</span>
              {badge.text}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="font-heading text-[clamp(32px,7vw,80px)] text-white leading-[0.85] tracking-[-1.5px] max-w-4xl"
        >
          High-Performance{' '}
          <span className="text-accent">Websites</span>
          <div className="h-2" />
          <span className="text-[clamp(28px,6vw,70px)] text-white/80">That Grow Your Business</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="mt-6 text-base md:text-lg text-white/80 max-w-2xl font-body font-light leading-relaxed"
        >
          High-performance websites and digital products for startups, growing businesses, and enterprises — combining exceptional design with engineering excellence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8"
        >
          <Link
            to="/contact"
            className="bg-accent text-white text-sm md:text-base font-body font-semibold rounded-full px-8 py-3.5 md:px-10 md:py-4 inline-flex items-center gap-2 shadow-[0_0_20px_4px_rgba(78,133,191,0.3)] hover:shadow-[0_0_30px_6px_rgba(78,133,191,0.5)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            Start Your Project
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/pricing"
            className="glass-strong text-sm md:text-base font-body font-medium text-white rounded-full px-7 py-3.5 md:px-9 md:py-4 inline-flex items-center gap-2 border border-white/15 hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            View Plans
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: 'easeOut' }}
          className="grid grid-cols-3 gap-3 md:gap-4 mt-12"
        >
          <div className="glass rounded-[20px] p-3 sm:p-4 md:p-5">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white/80 mb-2 sm:mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="font-heading text-3xl sm:text-5xl md:text-6xl text-white tracking-[-1px] leading-none">3+</p>
            <p className="text-[10px] sm:text-sm text-white/60 font-body font-light mt-1 sm:mt-1.5">Years Experience</p>
          </div>
          <div className="glass rounded-[20px] p-3 sm:p-4 md:p-5">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white/80 mb-2 sm:mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p className="font-heading text-3xl sm:text-5xl md:text-6xl text-white tracking-[-1px] leading-none">50+</p>
            <p className="text-[10px] sm:text-sm text-white/60 font-body font-light mt-1 sm:mt-1.5">Projects Delivered</p>
          </div>
          <div className="glass rounded-[20px] p-3 sm:p-4 md:p-5">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white/80 mb-2 sm:mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="font-heading text-3xl sm:text-5xl md:text-6xl text-white tracking-[-1px] leading-none">95+</p>
            <p className="text-[10px] sm:text-sm text-white/60 font-body font-light mt-1 sm:mt-1.5">Lighthouse Score</p>
          </div>
        </motion.div>
      </div>


    </section>
  )
}
