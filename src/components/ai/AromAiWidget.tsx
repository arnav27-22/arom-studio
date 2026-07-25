import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'
import { AromAiModal } from './AromAiModal'

export function AromAiWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Floating Trigger Button — Native Glassmorphism Design Language */}
      <div className="fixed bottom-6 right-4 md:right-8 z-40 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 20px 2px rgba(255, 255, 255, 0.05)',
              '0 0 30px 4px rgba(255, 255, 255, 0.12)',
              '0 0 20px 2px rgba(255, 255, 255, 0.05)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex items-center gap-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 hover:border-white/40 p-3.5 hover:px-5 text-white shadow-2xl transition-all duration-300 cursor-pointer group"
          aria-label="Open AROM AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white shrink-0" />
            </div>
            <Sparkles className="h-3 w-3 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex flex-col items-start text-left">
            <span
              className={`text-xs font-heading font-bold text-white tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isHovered ? 'max-w-xs opacity-100' : 'max-w-0 sm:max-w-xs opacity-0 sm:opacity-100'
              }`}
            >
              AROM AI <span className="text-[10px] font-normal text-emerald-400 font-mono">🟢 Online</span>
            </span>
          </div>
        </motion.button>
      </div>

      {/* AROM AI Modal Window */}
      <AromAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
