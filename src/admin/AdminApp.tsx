import { useState, useEffect } from 'react'
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-[#4E85BF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  return <AdminDashboard onLogout={() => setAuthed(false)} />
}
