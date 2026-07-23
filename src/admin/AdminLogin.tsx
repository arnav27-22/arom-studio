import { useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const MASTER_PASSWORD = 'ARNAVOM272213'

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      })
      
      if (res.ok) {
        onLogin()
        return
      }
    } catch {
      // Backend serverless endpoint fallback check
    }

    // Direct password match fallback
    if (password === MASTER_PASSWORD) {
      onLogin()
    } else {
      setError('Incorrect master password. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-sm glass rounded-[32px] p-8 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-2xl font-heading text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-white/50 font-body mt-1">Enter master password to access AROM STUDIO admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Master password"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-sm font-medium rounded-xl px-4 py-3 transition-all cursor-pointer shadow-lg shadow-accent/20"
          >
            {loading ? 'Unlocking...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
