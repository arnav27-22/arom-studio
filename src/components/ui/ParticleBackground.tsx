import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  hue: number
  pulse: number
  pulseSpeed: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const isMobile = window.innerWidth < 768
    const count = isMobile ? 25 : 55
    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const isAccent = Math.random() > 0.7
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: isAccent ? Math.random() * 3 + 1.5 : Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.25 + 0.08),
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: isAccent ? Math.random() * 0.25 + 0.1 : Math.random() * 0.15 + 0.04,
        hue: isAccent ? 78 : 0,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.008 + 0.004,
      })
    }
    particlesRef.current = particles

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mx = (mouseRef.current.x / canvas.width - 0.5) * 2
      const my = (mouseRef.current.y / canvas.height - 0.5) * 2

      for (const p of particles) {
        p.pulse += p.pulseSpeed
        const pulseFactor = Math.sin(p.pulse) * 0.4 + 0.6

        p.x += p.speedX + mx * 0.04
        p.y += p.speedY + my * 0.02

        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10

        const alpha = p.opacity * pulseFactor
        const adjustedSize = p.size * (0.8 + pulseFactor * 0.4)

        ctx.beginPath()
        ctx.arc(p.x, p.y, adjustedSize, 0, Math.PI * 2)

        if (p.hue === 78) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, adjustedSize * 4)
          grad.addColorStop(0, `rgba(78, 133, 191, ${alpha * 0.6})`)
          grad.addColorStop(1, `rgba(78, 133, 191, 0)`)
          ctx.fillStyle = grad
          ctx.fill()

          ctx.beginPath()
          ctx.arc(p.x, p.y, adjustedSize * 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(78, 133, 191, ${alpha * 1.2})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        }
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
