import { useState, useEffect } from 'react'
import { SiteBackground } from '../components/ui/SiteBackground'
import { Particles } from '../components/ui/ParticleBackground'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/admin/auth', {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-bg font-body relative">
      <SiteBackground />
      <Particles quantity={55} color="#4e85bf" size={1.2} vx={0.03} vy={0.03} />
      <div className="relative z-10">
        {!authed ? (
          <AdminLogin onLogin={() => setAuthed(true)} />
        ) : (
          <AdminDashboard onLogout={() => setAuthed(false)} />
        )}
      </div>
    </div>
  )
}
