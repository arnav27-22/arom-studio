import { useEffect, useState } from 'react'

export function SiteBackground() {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    // Defer loading non-critical background video to improve initial paint & network performance
    const timer = setTimeout(() => {
      setShouldLoadVideo(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {shouldLoadVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-40"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
            type="video/mp4"
          />
          <track kind="captions" src="data:text/vtt,WEBVTT" srcLang="en" label="English" default />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/40 to-bg" />
    </div>
  )
}
