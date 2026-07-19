export function SiteBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-40"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/40 to-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/8 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/4 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  )
}
