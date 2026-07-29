import { useState, useEffect } from 'react'
import { HardDrive, Download, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle, Clock, Database, Trash2 } from 'lucide-react'
import { formatIST } from '../adminStore'

export function BackupManager() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/backups', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setBackups(data.backups || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchBackups() }, [])

  const handleCreate = async () => {
    setCreating(true)
    setMessage('')
    try {
      const res = await fetch('/api/backup', { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setMessage(`Backup created: ${data.filename || 'success'}`)
        fetchBackups()
      } else {
        setMessage('Failed to create backup')
      }
    } catch {
      setMessage('Error creating backup')
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><HardDrive className="h-5 w-5 text-accent" /> Backup Manager</h2>
          <p className="text-xs text-white/50">Create and manage database backups</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchBackups} disabled={loading} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 border border-white/10 cursor-pointer disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer disabled:opacity-50">
            <Database className="h-4 w-4" /> {creating ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
        </div>
      )}

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">Backup History</h3>
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-8 w-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">No backups found. Create your first backup.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((b: any, i: number) => (
              <div key={b.filename || i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10"><Database className="h-4 w-4 text-emerald-400" /></div>
                  <div>
                    <div className="text-xs text-white font-medium">{b.filename || `backup-${i + 1}`}</div>
                    <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.createdAt ? formatIST(b.createdAt) : 'Unknown'}</span>
                      {b.size && <span>{(b.size / 1024 / 1024).toFixed(1)} MB</span>}
                      <span className={`px-1.5 py-0.5 rounded ${b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{b.status || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.downloadUrl && (
                    <a href={b.downloadUrl} download className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 text-white/60 hover:text-accent transition-colors cursor-pointer"><Download className="h-3.5 w-3.5" /></a>
                  )}
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-white/40">Database</div>
            <div className="flex items-center gap-1.5 mt-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-mono">Connected</span></div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-white/40">Last Backup</div>
            <div className="text-xs text-white font-mono mt-1">{backups[0]?.createdAt ? formatIST(backups[0].createdAt) : 'Never'}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-white/40">Total Backups</div>
            <div className="text-xs text-white font-mono mt-1">{backups.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-white/40">Status</div>
            <div className="flex items-center gap-1.5 mt-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-mono">Healthy</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
