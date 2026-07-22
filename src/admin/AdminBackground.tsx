export function AdminBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-[#050810] to-bg animate-gradient-shift bg-[length:200%_200%]" />
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-accent/3 rounded-full blur-[100px]" />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source
          src="/videos/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  )
}
