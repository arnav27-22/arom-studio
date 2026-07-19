import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Play, Check, Shield, Zap, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

function BlurText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [triggered, setTriggered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <p ref={ref} className="flex flex-wrap justify-center" style={{ rowGap: '0.1em' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ marginRight: '0.28em' }}
          initial={triggered ? false : { filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={triggered ? { filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'], opacity: [0, 0.5, 1], y: [50, -5, 0] } : {}}
          transition={{
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: 'easeOut',
            delay: delay + i * 0.1,
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}

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
            <span className="bg-white text-black text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Premium</span>
            <span className="text-xs text-white/80 font-body font-light">Web Design & Development Agency — India</span>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          {[
            { icon: <Check className="h-3 w-3" />, text: '1 Year Support' },
            { icon: <Shield className="h-3 w-3" />, text: 'Free Domain Included' },
            { icon: <Zap className="h-3 w-3" />, text: 'Lighthouse 95+' },
            { icon: <Globe className="h-3 w-3" />, text: 'Custom Domain Setup' },
          ].map((badge) => (
            <span key={badge.text} className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] text-white/60 font-body">
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
          className="font-heading italic text-[clamp(60px,12vw,140px)] text-white leading-[0.85] tracking-[-4px] max-w-4xl"
        >
          <BlurText text="We Build Websites" delay={0.6} />
          <span className="text-accent"><BlurText text="That Grow Businesses" delay={0.9} /></span>
          <div className="h-4" />
          <p className="text-sm md:text-base text-white/50 font-body font-light tracking-[0.15em] uppercase mt-4">
            <motion.span
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
            >
              We Design. We Develop. We Deliver.
            </motion.span>
          </p>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="mt-6 text-sm md:text-base text-white/70 max-w-xl font-body font-light leading-relaxed"
        >
          We build high-performance websites and digital products for startups, growing businesses, and enterprises — combining exceptional design with engineering excellence. Every project includes <span className="text-accent font-medium">1 Year Support</span> and <span className="text-accent font-medium">Free Domain</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <Link
            to="/pricing"
            className="glass-strong text-sm md:text-base font-body font-medium text-white rounded-full px-6 py-3 md:px-8 md:py-3.5 inline-flex items-center gap-2 hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            View Pricing & Plans
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/portfolio"
            className="text-sm md:text-base text-white/70 hover:text-white transition-colors duration-200 font-body font-light inline-flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            View Portfolio
          </Link>
          <Link
            to="/contact"
            className="text-sm md:text-base text-white/50 hover:text-white transition-colors duration-200 font-body font-light inline-flex items-center gap-2"
          >
            Book Consultation
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: 'easeOut' }}
          className="flex flex-wrap items-stretch justify-center gap-3 md:gap-4 mt-12"
        >
          <div className="glass rounded-[20px] p-4 md:p-5 w-[160px] md:w-[200px]">
            <svg className="h-5 w-5 md:h-6 md:w-6 text-white/80 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="font-heading italic text-3xl md:text-4xl text-white tracking-[-1px] leading-none">3+</p>
            <p className="text-[11px] text-white/60 font-body font-light mt-1.5">Years Experience</p>
          </div>
          <div className="glass rounded-[20px] p-4 md:p-5 w-[160px] md:w-[200px]">
            <svg className="h-5 w-5 md:h-6 md:w-6 text-white/80 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p className="font-heading italic text-3xl md:text-4xl text-white tracking-[-1px] leading-none">50+</p>
            <p className="text-[11px] text-white/60 font-body font-light mt-1.5">Projects Delivered</p>
          </div>
          <div className="glass rounded-[20px] p-4 md:p-5 w-[160px] md:w-[200px]">
            <svg className="h-5 w-5 md:h-6 md:w-6 text-white/80 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="font-heading italic text-3xl md:text-4xl text-white tracking-[-1px] leading-none">95+</p>
            <p className="text-[11px] text-white/60 font-body font-light mt-1.5">Lighthouse Score</p>
          </div>
        </motion.div>
      </div>


    </section>
  )
}
