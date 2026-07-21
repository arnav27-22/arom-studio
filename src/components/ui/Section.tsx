import type { HTMLAttributes } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/cn'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string
  className?: string
  children: React.ReactNode
}

export function Section({ id, className, children, ...props }: SectionProps) {
  return (
    <section id={id} className={cn('relative py-24 md:py-32', className)} {...props}>
      {children}
    </section>
  )
}

export function Container({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16', className)} {...props}>
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  badge?: string
  title: string
  highlightWord?: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  headingLevel?: 'h1' | 'h2' | 'h3'
}

export function SectionHeader({ badge, title, highlightWord, description, align = 'center', className, headingLevel = 'h2' }: SectionHeaderProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const parts = highlightWord ? title.split(highlightWord) : [title]

  const HeadingTag = headingLevel

  return (
    <div
      ref={ref}
      className={cn(
        'mb-16 max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {badge && (
        <div
          className="glass inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-white/80 mb-6"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          {badge}
        </div>
      )}
      <HeadingTag
        className="font-heading text-5xl md:text-6xl lg:text-7xl text-white leading-[0.9] tracking-[-2px]"
        style={{
          opacity: isInView ? 1 : 0,
          transform: isInView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out 0.1s',
        }}
      >
        {parts[0]}
        {highlightWord && parts.length === 1 && <span> </span>}
        {highlightWord && (
          <span className="text-accent">{highlightWord}</span>
        )}
        {parts.length > 1 && parts[1]}
      </HeadingTag>
      {description && (
        <p
          className="mt-6 text-base md:text-lg text-white/85 font-body font-light leading-relaxed"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out 0.2s',
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
