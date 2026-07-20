import { useEffect, useRef } from 'react'

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fadingOutRef = useRef(false)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const cancelFade = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = 0
      }
    }

    const fadeIn = () => {
      cancelFade()
      let opacity = parseFloat(container.style.opacity) || 0
      const step = () => {
        opacity = Math.min(1, opacity + 0.05)
        container.style.opacity = String(opacity)
        if (opacity < 1) {
          animFrameRef.current = requestAnimationFrame(step)
        }
      }
      animFrameRef.current = requestAnimationFrame(step)
    }

    const fadeOut = () => {
      if (fadingOutRef.current) return
      fadingOutRef.current = true
      cancelFade()
      let opacity = parseFloat(container.style.opacity) || 1
      const step = () => {
        opacity = Math.max(0, opacity - 0.05)
        container.style.opacity = String(opacity)
        if (opacity > 0) {
          animFrameRef.current = requestAnimationFrame(step)
        }
      }
      animFrameRef.current = requestAnimationFrame(step)
    }

    const onTimeUpdate = () => {
      if (!fadingOutRef.current && video.duration - video.currentTime <= 0.55) {
        fadeOut()
      }
    }

    const onEnded = () => {
      container.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play()
        fadingOutRef.current = false
        fadeIn()
      }, 100)
    }

    container.style.opacity = '0'
    video.addEventListener('loadeddata', fadeIn, { once: true })
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    return () => {
      cancelFade()
      video.removeEventListener('loadeddata', fadeIn)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 min-h-screen bg-black overflow-hidden"
      style={{ opacity: 0 }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop={false}
        playsInline
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        src={VIDEO_URL}
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  )
}
