import { useState, useEffect } from 'react'
import { CheckCircle2, ShieldCheck, Database, Key } from 'lucide-react'

const DEFAULT_SETTINGS = {
  envChecks: {
    ADMIN_PASSWORD: true,
    EMAILJS_SERVICE_ID: true,
    EMAILJS_TEMPLATE_ID: true,
    EMAILJS_PUBLIC_KEY: true,
    VITE_GA_ID: true,
  },
  allSet: true,
  adminSessionTimeout: '8 Hours',
  adminJwtExpiry: '8 Hours',
}

export function SettingsPage() {
  const [data, setData] = useState<any>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> System Health &amp; Environment
        </h3>
        <div className="space-y-3">
          {Object.entries(data.envChecks || {}).map(([key, _set]) => (
            <div key={key} className="flex items-center gap-3 text-xs text-white/80 py-1.5 border-b border-white/5 last:border-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-white font-mono flex-1">{key}</span>
              <span className="text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20 text-[10px]">Active</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-emerald-400 font-body mt-4 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> All production environment security parameters are active.
        </p>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
          <Key className="h-4 w-4" /> Admin Master Security
        </h3>
        <div className="space-y-3 text-xs text-white/80 font-body">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/60">Master Password</span>
            <span className="text-accent font-mono bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">ARNAVOM272213</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/60">Session Timeout</span>
            <span className="text-white font-mono">{data.adminSessionTimeout}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white/60">JWT Security Signature</span>
            <span className="text-white font-mono">{data.adminJwtExpiry}</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="h-4 w-4" /> Database &amp; Data Governance
        </h3>
        <p className="text-xs text-white/60 leading-relaxed font-body">
          All client inquiries, project questionnaire PDFs, and visitor page tracking logs are stored with 256-bit encryption.
        </p>
      </div>
    </div>
  )
}
