import { useRef, useState, useEffect } from 'react'

export function AdminBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoOk, setVideoOk] = useState<boolean | null>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    let cancelled = false

    const onCanPlay = () => { if (!cancelled) setVideoOk(true) }
    const onError = () => { if (!cancelled) setVideoOk(false) }

    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('error', onError)

    setTimeout(() => {
      if (!cancelled && videoRef.current?.readyState === 0) {
        setVideoOk(false)
      }
    }, 5000)

    return () => {
      cancelled = true
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('error', onError)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Animated gradient always visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-[#050810] to-bg animate-gradient-shift bg-[length:200%_200%]" />

      {/* Subtle ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/3 rounded-full blur-[100px]" />

      {/* Video on top if supported */}
      {videoOk !== false && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoOk ? 'opacity-50' : 'opacity-0'}`}
        >
          <source
            src="/videos/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4"
            type="video/mp4"
          />
        </video>
      )}
    </div>
  )
}
