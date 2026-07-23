import { useState, useEffect } from 'react'
import { BarChart3, Users, FileText, Mail, LineChart, Settings, LogOut, Menu, X, Receipt, ShieldCheck } from 'lucide-react'
import { Overview } from './sections/Overview'
import { Visitors } from './sections/Visitors'
import { PDFActivity } from './sections/PDFActivity'
import { Leads } from './sections/Leads'
import { PageAnalytics } from './sections/PageAnalytics'
import { SettingsPage } from './sections/SettingsPage'
import { InvoicesPage } from './sections/InvoicesPage'
import { SystemLogs } from './sections/SystemLogs'
import { syncFromCloud } from './adminStore'

const sections = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'visitors', label: 'Visitors Log', icon: Users },
  { id: 'pdfs', label: 'PDF Documents Archive', icon: FileText },
  { id: 'invoices', label: 'Invoice Generator', icon: Receipt },
  { id: 'leads', label: 'Contact Form Leads', icon: Mail },
  { id: 'analytics', label: 'Page Analytics', icon: LineChart },
  { id: 'logs', label: 'System Audit Logs', icon: ShieldCheck },
  { id: 'settings', label: 'Security & Settings', icon: Settings },
]

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initial cloud sync
    syncFromCloud()

    // Poll global cloud sync every 5 seconds so events from mobile/other devices update in real-time
    const interval = setInterval(() => {
      syncFromCloud()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const section = sections.find((s) => s.id === active)

  return (
    <div className="min-h-screen text-white font-body flex bg-bg">
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-bg/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-white tracking-wider">AROM STUDIO</h2>
            <p className="text-[10px] text-accent uppercase tracking-widest font-mono mt-0.5">Admin Control Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {sections.map((s) => {
            const Icon = s.icon
            const isSelected = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => { setActive(s.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent/20 border border-accent/30 text-accent font-semibold shadow-lg shadow-accent/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-accent' : 'text-white/40'}`} />
                {s.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-bg/90 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/60 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40 uppercase tracking-widest font-mono">Control Panel</span>
              <span className="text-white/20">/</span>
              <span className="text-accent font-heading text-sm font-semibold">{section?.label}</span>
            </div>
          </div>

          <div className="text-[10px] text-white/40 font-mono hidden sm:block bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            Realtime Cloud Sync Active • IST Timezone
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {mounted && (
            <>
              {active === 'overview' && <Overview />}
              {active === 'visitors' && <Visitors />}
              {active === 'pdfs' && <PDFActivity />}
              {active === 'invoices' && <InvoicesPage />}
              {active === 'leads' && <Leads />}
              {active === 'analytics' && <PageAnalytics />}
              {active === 'logs' && <SystemLogs />}
              {active === 'settings' && <SettingsPage />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
