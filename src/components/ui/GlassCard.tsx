import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'strong'
  hover?: boolean
  style?: React.CSSProperties
}

const easeOut: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export function GlassCard({ className, variant = 'default', hover = true, children, style }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={hover ? { duration: 0.3, ease: easeOut } : undefined}
      className={cn(
        variant === 'default' ? 'glass' : 'glass-strong',
        'rounded-[24px] p-6',
        hover && 'cursor-pointer',
        className,
      )}
      style={style}
    >
      {children}
    </motion.div>
  )
}
