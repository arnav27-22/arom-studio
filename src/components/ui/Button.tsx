import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants = {
  primary: 'bg-accent text-white hover:shadow-[0_0_24px_4px_rgba(78,133,191,0.35)]',
  secondary: 'glass-strong text-white',
  outline: 'border border-white/15 text-white/90 hover:border-white/30 hover:text-white bg-transparent',
  ghost: 'text-white/70 hover:text-white bg-transparent',
}

const sizes = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-3',
  lg: 'text-base px-8 py-4',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, style, onClick, type = 'button' }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-body font-medium transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
        style={style}
        type={type}
      >
        {isLoading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
export default Button
