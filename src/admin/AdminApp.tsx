import { useState, useEffect } from 'react'
import { Particles } from '../components/ui/ParticleBackground'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'
import { AdminBackground } from './AdminBackground'

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/admin/auth', {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authenticated ? true : false)
      })
      .catch(() => setAuthed(false))
  }, [])

  const handleLogout = () => {
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {})
    setAuthed(false)
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-bg font-body relative min-h-screen">
      <AdminBackground />
      <Particles quantity={55} color="#4e85bf" size={1.2} vx={0.03} vy={0.03} />
      <div className="relative z-10">
        {!authed ? (
          <AdminLogin onLogin={() => {
            setAuthed(true)
          }} />
        ) : (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}
