import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('arom_cookie_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('arom_cookie_consent', 'accepted')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('arom_cookie_consent', 'rejected')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 bg-bg/95 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] shadow-2xl"
        >
          <div className="space-y-3">
            <h3 className="text-sm font-heading text-white">Privacy &amp; Cookies</h3>
            <p className="text-xs text-white/60 font-body leading-relaxed">
              We use essential cookies and analytics to enhance your experience and analyze website traffic.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleAccept}
                className="glass-strong text-xs font-body font-medium text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleReject}
                className="text-xs font-body text-white/50 hover:text-white px-3 py-2 transition-colors"
              >
                Reject Non-Essential
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
