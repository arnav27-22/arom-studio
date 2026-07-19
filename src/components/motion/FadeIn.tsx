import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'framer-motion'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  className?: string
  once?: boolean
}

const easeOut: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export function FadeIn({ children, delay = 0, direction = 'up', duration = 0.7, className, once = true }: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-50px' })

  const directionMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: { y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        filter: 'blur(4px)',
        ...directionMap[direction],
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              filter: 'blur(0px)',
              x: 0,
              y: 0,
            }
          : {}
      }
      transition={{
        duration,
        delay,
        ease: easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6, ease: easeOut },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
