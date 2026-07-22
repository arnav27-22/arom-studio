import { useState, useEffect } from 'react'
import { BarChart3, Users, FileText, Mail, LineChart, MousePointer2, Terminal, Settings, LogOut, Menu, X } from 'lucide-react'
import { Overview } from './sections/Overview'
import { Visitors } from './sections/Visitors'
import { PDFActivity } from './sections/PDFActivity'
import { Leads } from './sections/Leads'
import { PageAnalytics } from './sections/PageAnalytics'
import { LinkClicks } from './sections/LinkClicks'
import { SystemLogs } from './sections/SystemLogs'
import { SettingsPage } from './sections/SettingsPage'

const sections = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'visitors', label: 'Visitors', icon: Users },
  { id: 'pdfs', label: 'PDF Activity', icon: FileText },
  { id: 'leads', label: 'Contact Form Leads', icon: Mail },
  { id: 'analytics', label: 'Page Analytics', icon: LineChart },
  { id: 'clicks', label: 'Link Clicks', icon: MousePointer2 },
  { id: 'logs', label: 'System Logs', icon: Terminal },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const section = sections.find((s) => s.id === active)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111118] border-r border-white/5 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">AROM STUDIO</h2>
            <p className="text-[10px] text-zinc-500">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => { setActive(s.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active === s.id ? 'bg-[#4E85BF]/10 text-[#4E85BF]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {s.label}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/5 px-4 md:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-zinc-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Admin</span>
            <span className="text-zinc-600">/</span>
            <span className="text-white font-medium">{section?.label}</span>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {mounted && (
            <>
              {active === 'overview' && <Overview />}
              {active === 'visitors' && <Visitors />}
              {active === 'pdfs' && <PDFActivity />}
              {active === 'leads' && <Leads />}
              {active === 'analytics' && <PageAnalytics />}
              {active === 'clicks' && <LinkClicks />}
              {active === 'logs' && <SystemLogs />}
              {active === 'settings' && <SettingsPage />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
