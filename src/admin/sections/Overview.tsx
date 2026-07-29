import { useEffect, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { FileText, Mail, DollarSign, Users, CheckCircle2, Clock, Database, HardDrive, Activity, Bell, Download, Briefcase, CreditCard, TrendingUp, Lock, Image, Calendar, CheckSquare } from 'lucide-react'
import { getAdminStore, subscribe, syncFromCloud, formatIST } from '../adminStore'

export function Overview() {
  const [store, setStore] = useState(getAdminStore())

  useEffect(() => {
    const unsub = subscribe(() => setStore(getAdminStore()))
    syncFromCloud().then(setStore)
    const timer = setInterval(() => { syncFromCloud().then(setStore) }, 10000)
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
  const aiConversations = store.aiConversations || []
  const tasks = store.tasks || []
  const meetings = store.meetings || []
  const expenses = store.expenses || []
  const incomes = store.incomes || []
  const media = store.media || []
  const passwords = store.passwords || []

  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)
  const pendingPayments = invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.totalAmount, 0)
  const completedProjects = projects.filter(p => p.status === 'Launched' || p.launchStatus === 'Live').length
  const totalIncome = incomes.reduce((s: number, t: any) => s + (t.amount || 0), 0)
  const totalExpense = expenses.reduce((s: number, t: any) => s + (t.amount || 0), 0)
  const netProfit = totalIncome - totalExpense
  const pendingTasks = tasks.filter((t: any) => t.status !== 'Completed').length
  const upcomingMeetings = meetings.filter((m: any) => m.status === 'Scheduled').length

  const recentActivity = logs.slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 font-body">Executive overview — all business metrics at a glance</p>
        </div>
        <button onClick={() => {
          const headers = ['Metric', 'Value']
          const rows = [
            ['Total Clients', clients.length], ['Projects', `${projects.length} (${completedProjects} completed)`],
            ['Invoices', invoices.length], ['Revenue', `₹${totalRevenue.toLocaleString()}`],
            ['Pending Payments', `₹${pendingPayments.toLocaleString()}`],
            ['Net Income (Finance)', `₹${netProfit.toLocaleString()}`],
            ['PDFs Generated', pdfs.length], ['Tasks', `${tasks.length} (${pendingTasks} pending)`],
            ['Meetings', `${meetings.length} (${upcomingMeetings} upcoming)`],
            ['AI Conversations', aiConversations.length], ['Media Items', media.length],
            ['Stored Credentials', passwords.length],
          ]
          const { exportSectionReportPDF } = require('../../lib/professionalPDF')
          exportSectionReportPDF('Executive Overview Report', 'AROM Studio Business Summary', headers, rows, 'Executive_Report')
        }} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all cursor-pointer shadow-lg">
          <Download className="h-4 w-4" /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Clients" value={clients.length} icon={<Users className="h-4 w-4 text-accent" />} />
        <StatCard label="Projects" value={projects.length} sub={`${completedProjects} done`} icon={<Briefcase className="h-4 w-4 text-accent" />} />
        <StatCard label="Invoices" value={invoices.length} sub={`${invoices.filter(i => i.status === 'Paid').length} paid`} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Net Profit" value={`₹${netProfit.toLocaleString()}`} icon={<TrendingUp className={`h-4 w-4 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />} />
        <StatCard label="Pending Pay" value={`₹${pendingPayments.toLocaleString()}`} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="PDFs" value={pdfs.length} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Tasks" value={`${pendingTasks} pending`} sub={`${tasks.length} total`} icon={<CheckSquare className="h-4 w-4 text-accent" />} />
        <StatCard label="Meetings" value={`${upcomingMeetings} upcoming`} sub={`${meetings.length} total`} icon={<Calendar className="h-4 w-4 text-accent" />} />
        <StatCard label="AI Chats" value={aiConversations.length} icon={<Activity className="h-4 w-4 text-accent" />} />
        <StatCard label="Media" value={media.length} icon={<Image className="h-4 w-4 text-accent" />} />
        <StatCard label="Passwords" value={passwords.length} icon={<Lock className="h-4 w-4 text-accent" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-[24px] p-6 border border-white/10 lg:col-span-2">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Recent Activity Log</span>
            <span className="text-white/40 font-mono text-[10px]">IST</span>
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((ev: any, i: number) => (
                <div key={ev.id || i} className="flex items-center gap-3 text-xs text-white/80 py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/40 font-mono text-[10px] shrink-0 w-28">{formatIST(ev.createdAt)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase shrink-0 ${
                    ev.type === 'lead' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                    ev.type === 'pdf' ? 'bg-accent/10 text-accent border border-accent/20' :
                    ev.type === 'invoice' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                    ev.severity === 'error' ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                    'bg-white/10 text-white/70'
                  }`}>{ev.type || 'activity'}</span>
                  <span className="text-white font-medium truncate flex-1">{ev.event || ev.detail || ev.action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 py-4 text-center">No activity recorded yet.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[24px] p-6 border border-white/10">
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'New Client', icon: Users, action: "document.querySelector('[data-section=clients]')?.click()" },
                { label: 'New Invoice', icon: CreditCard, action: '' },
                { label: 'New Task', icon: CheckSquare, action: '' },
                { label: 'Schedule Meeting', icon: Calendar, action: '' },
              ].map(q => (
                <button key={q.label} className="p-3 rounded-xl bg-white/5 hover:bg-accent/10 border border-white/10 hover:border-accent/30 text-xs text-white/70 hover:text-accent transition-all text-left flex items-center gap-2">
                  <q.icon className="h-3.5 w-3.5 shrink-0" />
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-[24px] p-6 border border-white/10">
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                <span className="text-xs text-white/70">Database</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Connected</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                <span className="text-xs text-white/70">PDF Storage</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{pdfs.length} files</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                <span className="text-xs text-white/70">Sync</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Real-time</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                <span className="text-xs text-white/70">Notifications</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} unread</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
