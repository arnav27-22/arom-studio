import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { SOCIAL_LINKS } from '../../constants/navigation'
import { useState } from 'react'

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.a
      href={SOCIAL_LINKS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-whatsapp text-white shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(37, 211, 102, 0.4)',
          '0 0 0 12px rgba(37, 211, 102, 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop',
      }}
      style={{ padding: isHovered ? '12px 20px 12px 16px' : '12px' }}
    >
      <MessageCircle className="h-6 w-6 shrink-0" />
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isHovered ? 'auto' : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="text-sm font-body font-medium whitespace-nowrap overflow-hidden"
      >
        Chat with us
      </motion.span>
    </motion.a>
  )
}
