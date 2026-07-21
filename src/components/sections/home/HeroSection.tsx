import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Shield, Zap, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

function TypeWriter({ texts, typingSpeed = 80, deletingSpeed = 50, pauseDuration = 2000 }: { texts: string[]; typingSpeed?: number; deletingSpeed?: number; pauseDuration?: number }) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTyping = useCallback(() => {
    const currentWord = texts[wordIndex]
    if (!isDeleting) {
      setDisplayText(currentWord.substring(0, displayText.length + 1))
      if (displayText.length === currentWord.length) {
        setTimeout(() => setIsDeleting(true), pauseDuration)
        return
      }
    } else {
      setDisplayText(currentWord.substring(0, displayText.length - 1))
      if (displayText.length === 0) {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % texts.length)
        return
      }
    }
  }, [texts, wordIndex, isDeleting, displayText, pauseDuration])

  useEffect(() => {
    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed)
    return () => clearTimeout(timer)
  }, [displayText, isDeleting, handleTyping, deletingSpeed, typingSpeed])

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

function BlurText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [triggered, setTriggered] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          setAnimKey((k) => k + 1)
        } else {
          setTriggered(false)
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
          key={`${animKey}-${i}`}
          className="inline-block"
          style={{ marginRight: '0.28em' }}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={triggered ? { filter: ['blur(20px)', 'blur(8px)', 'blur(0px)'], opacity: [0, 0.5, 1], y: [50, -5, 0] } : {}}
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
            <span className="bg-white text-black text-xs font-semibold px-3 py-0.5 rounded-full">Premium</span>
            <span className="text-xs text-white/80 font-body font-light">Web Design & Development Agency — India</span>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          {[
            { icon: <Check className="h-3 w-3" />, text: '3+ Years Experience' },
            { icon: <Shield className="h-3 w-3" />, text: 'Free Domain Included' },
            { icon: <Zap className="h-3 w-3" />, text: 'Lighthouse 95+' },
            { icon: <Globe className="h-3 w-3" />, text: 'Custom Domain Setup' },
          ].map((badge) => (
            <span key={badge.text} className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/60 font-body whitespace-nowrap">
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
          We Build{' '}
          <span className="text-accent">
            <TypeWriter texts={['Business Websites', 'E-commerce Websites', 'Custom Web Apps', 'SaaS Platforms', 'UI/UX Design', 'Website Redesign', 'SEO Optimization']} />
          </span>
          <div className="h-2" />
          <span className="text-[clamp(28px,6vw,70px)] text-white/80"><BlurText text="That Grow Businesses" delay={0.9} /></span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="mt-6 text-sm md:text-base text-white/80 max-w-2xl font-body font-light leading-relaxed"
        >
          We build high-performance websites and digital products for startups, growing businesses, and enterprises — combining exceptional design with engineering excellence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <Link
            to="/contact"
            className="glass-strong text-sm md:text-base font-body font-semibold text-white rounded-full px-7 py-3 md:px-9 md:py-3.5 inline-flex items-center gap-2 hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            Start Your Project
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/pricing"
            className="glass-strong text-sm md:text-base font-body font-medium text-white rounded-full px-6 py-3 md:px-8 md:py-3.5 inline-flex items-center gap-2 hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            View Plans
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <span className="hidden sm:inline text-white/20 font-body font-light text-sm">|</span>
          <a
            href="https://forms.gle/fGwvkaTRdtb5ZH3x6"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm md:text-base text-white/50 hover:text-white transition-colors duration-200 font-body font-light inline-flex items-center gap-2"
          >
            Book Consultation
          </a>
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
            <p className="font-heading text-5xl md:text-6xl text-white tracking-[-1px] leading-none">3+</p>
            <p className="text-sm text-white/60 font-body font-light mt-1.5">Years Experience</p>
          </div>
          <div className="glass rounded-[20px] p-4 md:p-5 w-[160px] md:w-[200px]">
            <svg className="h-5 w-5 md:h-6 md:w-6 text-white/80 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p className="font-heading text-5xl md:text-6xl text-white tracking-[-1px] leading-none">50+</p>
            <p className="text-sm text-white/60 font-body font-light mt-1.5">Projects Delivered</p>
          </div>
          <div className="glass rounded-[20px] p-4 md:p-5 w-[160px] md:w-[200px]">
            <svg className="h-5 w-5 md:h-6 md:w-6 text-white/80 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="font-heading text-5xl md:text-6xl text-white tracking-[-1px] leading-none">95+</p>
            <p className="text-sm text-white/60 font-body font-light mt-1.5">Lighthouse Score</p>
          </div>
        </motion.div>
      </div>


    </section>
  )
}
