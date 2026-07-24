import { useEffect, useRef } from 'react'

export function AdminBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play fallback handling
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-bg">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen transition-opacity duration-1000"
      >
        <source
          src="/videos/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-bg/80 via-[#050810]/70 to-bg/90 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
