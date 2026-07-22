import { useRef, useState, useEffect } from 'react'

export function AdminBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onErr = () => setHasError(true)
    const onLoad = () => setHasError(false)
    el.addEventListener('error', onErr)
    el.addEventListener('loadeddata', onLoad)
    return () => {
      el.removeEventListener('error', onErr)
      el.removeEventListener('loadeddata', onLoad)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-bg via-[#050810] to-bg">
      {!hasError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
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
