import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { trackEvent } from '../../lib/analytics'

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  useEffect(() => {
    if (isOpen) {
      trackEvent('calendly_open', 'Conversion', 'Consultation Booking')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            role="dialog"
            aria-modal="true"
            aria-label="Book a Consultation"
            className="relative w-full max-w-4xl h-[650px] bg-bg/90 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-white bg-white/5 rounded-full transition-colors"
              aria-label="Close scheduling modal"
            >
              <X className="h-5 w-5" />
            </button>
            <iframe
              src="https://calendly.com/aromstudio27/30min?embed_domain=aromstudio.vercel.app&embed_type=Inline"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Schedule a consultation with AROM STUDIO"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
