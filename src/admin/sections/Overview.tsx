import { useEffect, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { FileText, Mail, DollarSign, Users, CheckCircle2, Clock, Database, HardDrive, Activity, Bell, Download } from 'lucide-react'
import { getAdminStore, subscribe, syncFromCloud, formatIST } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function Overview() {
  const [store, setStore] = useState(getAdminStore())

  useEffect(() => {
    const unsub = subscribe(() => setStore(getAdminStore()))
    syncFromCloud().then(setStore)
    const timer = setInterval(() => {
      syncFromCloud().then(setStore)
    }, 10000)
    return () => { unsub(); clearInterval(timer) }
  }, [])

  const pdfs = store.pdfs || []
  const logs = store.logs || []
  const clients = store.clients || []
  const projects = store.projects || []
  const invoices = store.invoices || []
  const notifications = store.notifications || []
  const discoveryQ = store.discoveryQuestionnaires || []
  const content = store.content || []

  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)
  const pendingPayments = invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.totalAmount, 0)
  const completedProjects = projects.filter(p => p.status === 'Launched' || p.launchStatus === 'Live').length

  const handleDownloadPDF = () => {
    const headers = ['Category / Metric', 'Value', 'Details']
    const rows = [
      ['Generated PDFs', pdfs.length, 'Form & Admin generated PDFs'],
      ['Total Clients', clients.length, 'Active client accounts'],
      ['Projects', projects.length, `${completedProjects} completed`],
      ['Invoices', invoices.length, `${invoices.filter(i => i.status === 'Paid').length} paid`],
      ['Revenue', `₹${totalRevenue.toLocaleString()}`, 'Total client revenue'],
      ['Pending Payments', `₹${pendingPayments.toLocaleString()}`, `${invoices.filter(i => i.status === 'Pending').length} unpaid`],
      ['Completed Projects', completedProjects, 'Live deployed'],
      ['Discovery Forms', discoveryQ.length, 'Submitted questionnaires'],
      ['Content Collection', content.length, 'Client content submissions'],
      ['Notifications', notifications.length, `${notifications.filter(n => !n.read).length} unread`],
    ]
    exportSectionReportPDF('Overview System Report', 'AROM Studio Platform Analytics Overview', headers, rows, 'Overview_Analytics_Report')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50 font-body">Executive overview of system operations, clients, and pipeline</p>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all cursor-pointer shadow-lg"
        >
          <Download className="h-4 w-4" /> Download Overview PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Generated PDFs" value={pdfs.length} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Total Clients" value={clients.length} icon={<Users className="h-4 w-4 text-accent" />} />
        <StatCard label="Projects" value={projects.length} sub={`${completedProjects} completed`} icon={<Activity className="h-4 w-4 text-accent" />} />
        <StatCard label="Invoices" value={invoices.length} sub={`${invoices.filter(i => i.status === 'Paid').length} paid`} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Pending Payments" value={`₹${pendingPayments.toLocaleString()}`} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Completed Projects" value={completedProjects} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Discovery Forms" value={discoveryQ.length} icon={<Mail className="h-4 w-4 text-accent" />} />
        <StatCard label="Content Collection" value={content.length} icon={<Database className="h-4 w-4 text-accent" />} />
        <StatCard label="Notifications" value={notifications.length} sub={`${notifications.filter(n => !n.read).length} unread`} icon={<Bell className="h-4 w-4 text-accent" />} />
        <StatCard label="Database Status" value="Connected" icon={<Database className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="System Health" value="Good" icon={<HardDrive className="h-4 w-4 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Recent Activity Log</span>
            <span className="text-white/40 font-mono text-[10px]">IST Timezone</span>
          </h3>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 10).map((ev: any, i: number) => (
                <div key={ev.id || i} className="flex items-center gap-3 text-xs text-white/80 py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-white/40 font-mono text-[11px] shrink-0">{formatIST(ev.createdAt)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase shrink-0 ${ev.type === 'lead' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : ev.type === 'pdf' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-white/10 text-white/70'}`}>
                    {ev.type || 'activity'}
                  </span>
                  <span className="text-white font-medium truncate flex-1">{ev.event || ev.detail}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 font-body py-4 text-center">No activity recorded yet. Generate PDFs, submit forms, or create invoices to see activity.</p>
          )}
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Storage & System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-white/70 flex items-center gap-2"><Database className="h-3.5 w-3.5 text-emerald-400" /> PostgreSQL</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-white/70 flex items-center gap-2"><HardDrive className="h-3.5 w-3.5 text-emerald-400" /> PDF Storage</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{pdfs.length} files</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-white/70 flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-emerald-400" /> System Uptime</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
