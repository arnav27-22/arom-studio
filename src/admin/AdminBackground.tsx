export function AdminBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover opacity-40"
      >
        <source
          src="/videos/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/40 to-bg" />
    </div>
  )
}
