import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'
import { AromAiModal } from './AromAiModal'

export function AromAiWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-4 md:right-8 z-40 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={{
            boxShadow: [
              '0 0 20px 2px rgba(78, 133, 191, 0.4)',
              '0 0 35px 6px rgba(78, 133, 191, 0.7)',
              '0 0 20px 2px rgba(78, 133, 191, 0.4)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex items-center gap-3.5 rounded-full bg-gradient-to-r from-accent via-blue-500 to-accent p-3.5 hover:px-5 text-black shadow-2xl transition-all duration-300 border border-white/30 backdrop-blur-xl cursor-pointer group"
          aria-label="Open AROM AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="h-6 w-6 text-black shrink-0 animate-bounce" />
            <Sparkles className="h-3 w-3 text-white absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex flex-col items-start text-left">
            <span
              className={`text-xs font-heading font-extrabold text-black tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isHovered ? 'max-w-xs opacity-100' : 'max-w-0 sm:max-w-xs opacity-0 sm:opacity-100'
              }`}
            >
              AROM AI <span className="text-[10px] font-normal opacity-80 font-mono">🟢 Online</span>
            </span>
          </div>
        </motion.button>
      </div>

      {/* AROM AI Full Modal */}
      <AromAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
