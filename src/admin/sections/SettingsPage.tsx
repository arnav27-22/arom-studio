import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, RefreshCw, Download, Trash2 } from 'lucide-react'

export function SettingsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return <div className="text-sm text-text-secondary">Loading...</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Environment Variables</h3>
        <div className="space-y-2">
          {Object.entries(data.envChecks || {}).map(([key, set]) => (
            <div key={key} className="flex items-center gap-3 text-xs">
              {set ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              )}
              <span className="text-text-secondary font-mono">{key}</span>
              <span className="text-muted">{set ? '✓ Set' : '✗ Not set'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">
          Overall: {data.allSet ? (
            <span className="text-green-400">All environment variables are configured</span>
          ) : (
            <span className="text-amber-400">Some variables are missing — add them in Vercel dashboard</span>
          )}
        </p>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Session Configuration</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Admin session timeout</span>
            <span className="text-text-primary font-mono">{data.adminSessionTimeout}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">JWT token expiry</span>
            <span className="text-text-primary font-mono">{data.adminJwtExpiry}</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Actions</h3>
        <div className="space-y-3">
          <button className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-light hover:bg-white/10 px-3 py-2 rounded-lg transition-all w-full">
            <RefreshCw className="h-3.5 w-3.5" />
            Force Logout All Sessions (requires ADMIN_JWT_SECRET rotation + redeploy)
          </button>
          <button className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-light hover:bg-white/10 px-3 py-2 rounded-lg transition-all w-full">
            <Download className="h-3.5 w-3.5" />
            Export All Data as JSON
          </button>
          <button className="flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-400/5 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-all w-full">
            <Trash2 className="h-3.5 w-3.5" />
            Clear All Visitor Logs Older Than N Days
          </button>
        </div>
      </div>
    </div>
  )
}
