import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Strictly show logo splash screen for 2.0 seconds (2000ms) as requested
    const timer = setTimeout(() => {
      setShow(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center pointer-events-none select-none"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1.05, 1], opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative flex flex-col items-center justify-center p-8"
          >
            {/* Glowing Accent Ring */}
            <div className="absolute w-32 h-32 rounded-full bg-accent/20 blur-3xl animate-pulse" />

            {/* Official Logo Badge */}
            <img
              src="/favicon.svg"
              alt="AROM STUDIO"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(78,133,191,0.4)]"
            />

            {/* Brand Title */}
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 font-heading text-xl sm:text-2xl font-bold text-white tracking-[0.2em] uppercase text-center relative z-10"
            >
              AROM STUDIO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-accent text-center relative z-10"
            >
              Premium Digital Agency
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
