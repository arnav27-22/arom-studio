import { useState, useEffect } from 'react'
import {
  BarChart3, Users, FileText, Mail, LineChart, Settings, LogOut, Menu, X, Receipt, ShieldCheck,
  UserCheck, Briefcase, FileSpreadsheet, FileSignature, CreditCard, FolderKanban, FolderUp,
  CheckSquare, GitCommit, PackageCheck, MessageSquareHeart, Bell
} from 'lucide-react'

// Existing System Dashboard Sections
import { Overview } from './sections/Overview'
import { Visitors } from './sections/Visitors'
import { PDFActivity } from './sections/PDFActivity'
import { Leads } from './sections/Leads'
import { PageAnalytics } from './sections/PageAnalytics'
import { SettingsPage } from './sections/SettingsPage'
import { InvoicesPage } from './sections/InvoicesPage'
import { SystemLogs } from './sections/SystemLogs'

// 12 New Business & Agency Management Sections
import { ClientManagement } from './sections/ClientManagement'
import { ProjectManagement } from './sections/ProjectManagement'
import { ProposalManager } from './sections/ProposalManager'
import { AgreementManager } from './sections/AgreementManager'
import { PaymentsManager } from './sections/PaymentsManager'
import { ContentCollection } from './sections/ContentCollection'
import { AssetsManager } from './sections/AssetsManager'
import { DesignApproval } from './sections/DesignApproval'
import { ProjectTimeline } from './sections/ProjectTimeline'
import { HandoverManager } from './sections/HandoverManager'
import { FeedbackManager } from './sections/FeedbackManager'
import { NotificationsCenter } from './sections/NotificationsCenter'
import { DiscoveryQuestionnairesAdmin } from './sections/DiscoveryQuestionnairesAdmin'
import { FileQuestion } from 'lucide-react'

import { syncFromCloud } from './adminStore'

const systemSections = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'visitors', label: 'Visitors Log', icon: Users },
  { id: 'pdfs', label: 'PDF Documents Archive', icon: FileText },
  { id: 'invoices', label: 'Invoice Generator', icon: Receipt },
  { id: 'leads', label: 'Contact Form Leads', icon: Mail },
  { id: 'analytics', label: 'Page Analytics', icon: LineChart },
  { id: 'logs', label: 'System Audit Logs', icon: ShieldCheck },
  { id: 'settings', label: 'Security & Settings', icon: Settings },
]

const agencySections = [
  { id: 'clients', label: 'Clients', icon: UserCheck },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'proposals', label: 'Proposal Manager', icon: FileSpreadsheet },
  { id: 'agreements', label: 'Agreement Manager', icon: FileSignature },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'discovery', label: 'Discovery Questionnaires', icon: FileQuestion },
  { id: 'content', label: 'Content Collection', icon: FolderKanban },
  { id: 'assets', label: 'Assets Manager', icon: FolderUp },
  { id: 'approvals', label: 'Design Approval', icon: CheckSquare },
  { id: 'timeline', label: 'Project Timeline', icon: GitCommit },
  { id: 'handover', label: 'Handover', icon: PackageCheck },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareHeart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const allSections = [...systemSections, ...agencySections]

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initial cloud sync
    syncFromCloud()

    // Poll global cloud sync every 5 seconds so events update in real-time
    const interval = setInterval(() => {
      syncFromCloud()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentSection = allSections.find((s) => s.id === active)

  return (
    <div className="min-h-screen text-white font-body flex bg-transparent relative z-10">
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-bg/85 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block shrink-0`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-white tracking-wider">AROM STUDIO</h2>
            <p className="text-[10px] text-accent uppercase tracking-widest font-mono mt-0.5">Admin Agency Platform</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white cursor-pointer" aria-label="Close admin navigation menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto max-h-[calc(100vh-140px)] p-3 pr-1 space-y-4 font-body scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-accent/40">
          {/* System Dashboard Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase tracking-widest font-mono text-white/40 mb-1">
              System Operations
            </div>
            {systemSections.map((s) => {
              const Icon = s.icon
              const isSelected = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-2"></div>

          {/* Business & Agency Management Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase tracking-widest font-mono text-accent/80 mb-1 font-semibold">
              Agency Management
            </div>
            {agencySections.map((s) => {
              const Icon = s.icon
              const isSelected = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
          </div>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-all cursor-pointer">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-bg/90 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/60 hover:text-white" aria-label="Open admin navigation menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40 uppercase tracking-widest font-mono">Control Panel</span>
              <span className="text-white/20">/</span>
              <span className="text-accent font-heading text-sm font-semibold">{currentSection?.label}</span>
            </div>
          </div>

          <div className="text-[10px] text-white/40 font-mono hidden sm:block bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            Realtime Cloud Sync Active • IST Timezone
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {mounted && (
            <>
              {/* System Dashboard Sections */}
              {active === 'overview' && <Overview />}
              {active === 'visitors' && <Visitors />}
              {active === 'pdfs' && <PDFActivity />}
              {active === 'invoices' && <InvoicesPage />}
              {active === 'leads' && <Leads />}
              {active === 'analytics' && <PageAnalytics />}
              {active === 'logs' && <SystemLogs />}
              {active === 'settings' && <SettingsPage />}

              {/* 12 Agency Management Sections */}
              {active === 'clients' && <ClientManagement />}
              {active === 'projects' && <ProjectManagement />}
              {active === 'proposals' && <ProposalManager />}
              {active === 'agreements' && <AgreementManager />}
              {active === 'payments' && <PaymentsManager />}
              {active === 'discovery' && <DiscoveryQuestionnairesAdmin />}
              {active === 'content' && <ContentCollection />}
              {active === 'assets' && <AssetsManager />}
              {active === 'approvals' && <DesignApproval />}
              {active === 'timeline' && <ProjectTimeline />}
              {active === 'handover' && <HandoverManager />}
              {active === 'feedback' && <FeedbackManager />}
              {active === 'notifications' && <NotificationsCenter />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
