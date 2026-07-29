import { useEffect, useState, useMemo } from 'react'
import {
  Users, Briefcase, FileText, DollarSign, TrendingUp, Clock,
  CheckSquare, Calendar, Activity, Search,
  Bell, UserPlus, FolderPlus, FileSpreadsheet, FileSignature, Receipt,
  CreditCard, Upload, GitCommit, Eye, Edit3, Download,
  X, CheckCircle, AlertTriangle, FileCheck,
  ChevronRight, LogOut, Shield
} from 'lucide-react'
import {
  getAdminStore, subscribe, syncFromCloud, formatIST, logAuditEvent,
  recordAdminClient, recordAdminProject, recordAdminProposal, recordAdminAgreement,
  recordAdminInvoice, recordAdminPayment, recordAdminMeeting, recordAdminTask,
  recordAdminDocument, recordAdminExpense, recordAdminTimeline
} from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

interface OverviewProps {
  onNavigate?: (section: string) => void
  onLogout?: () => void
}

export function Overview({ onNavigate, onLogout }: OverviewProps) {
  const [store, setStore] = useState(getAdminStore())
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDateStr, setCurrentDateStr] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('Welcome back')
  
  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  // Quick Action Modal state
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [modalForm, setModalForm] = useState<Record<string, any>>({})
  
  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null)

  // Real-time subscribe & IST clock ticker
  useEffect(() => {
    const unsub = subscribe(() => setStore({ ...getAdminStore() }))
    syncFromCloud().then(s => setStore({ ...s }))
    const timer = setInterval(() => syncFromCloud().then(s => setStore({ ...s })), 10000)

    const updateClock = () => {
      const now = new Date()
      try {
        const timeFormatted = now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
        const dateFormatted = now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        setCurrentTime(`${timeFormatted} IST`)
        setCurrentDateStr(dateFormatted)
        
        const hours = parseInt(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }))
        if (hours < 12) setGreeting('Good Morning')
        else if (hours < 17) setGreeting('Good Afternoon')
        else setGreeting('Good Evening')
      } catch {
        setCurrentTime(now.toLocaleTimeString() + ' IST')
      }
    }
    updateClock()
    const clockInterval = setInterval(updateClock, 1000)

    return () => {
      unsub()
      clearInterval(timer)
      clearInterval(clockInterval)
    }
  }, [])

  // Safely extract arrays from store with production fallbacks
  const clients = useMemo(() => store.clients || [], [store.clients])
  const projects = useMemo(() => store.projects || [], [store.projects])
  const invoices = useMemo(() => store.invoices || [], [store.invoices])
  const payments = useMemo(() => store.payments || [], [store.payments])
  const proposals = useMemo(() => store.proposals || [], [store.proposals])
  const agreements = useMemo(() => store.agreements || [], [store.agreements])
  const pdfs = useMemo(() => store.pdfs || [], [store.pdfs])
  const logs = useMemo(() => store.logs || [], [store.logs])
  const tasks = useMemo(() => store.tasks || [], [store.tasks])
  const meetings = useMemo(() => store.meetings || [], [store.meetings])
  const expenses = useMemo(() => store.expenses || [], [store.expenses])
  const incomes = useMemo(() => store.incomes || [], [store.incomes])
  const notifications = useMemo(() => store.notifications || [], [store.notifications])
  const documents = useMemo(() => store.documents || [], [store.documents])
  const timelines = useMemo(() => store.timelines || [], [store.timelines])

  // Calculations for 16 LIVE Statistic Cards
  const activeProjectsCount = projects.filter(p => (p.status || '').toLowerCase().includes('progress') || (p.status || '').toLowerCase().includes('planning')).length
  const completedProjectsCount = projects.filter(p => (p.status || '').toLowerCase().includes('launched') || (p.launchStatus || '').toLowerCase() === 'live' || (p.status || '').toLowerCase().includes('complete')).length
  const pendingProjectsCount = projects.filter(p => (p.status || '').toLowerCase().includes('planning') || (p.status || '').toLowerCase().includes('review')).length

  const totalRevenueCalc = useMemo(() => {
    const paidInvoices = invoices.filter(i => (i.status || '').toLowerCase() === 'paid').reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0)
    const paidPayments = payments.filter(p => (p.status || '').toLowerCase() === 'paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const clientRevenue = clients.reduce((acc, c) => acc + (Number(c.totalRevenue) || 0), 0)
    const incomeTotal = incomes.reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0)
    return Math.max(paidInvoices + paidPayments, clientRevenue, incomeTotal)
  }, [invoices, payments, clients, incomes])

  const monthlyRevenueCalc = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const invoiceMonthly = invoices
      .filter(i => (i.status || '').toLowerCase() === 'paid' && new Date(i.createdAt).getMonth() === currentMonth && new Date(i.createdAt).getFullYear() === currentYear)
      .reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0)
    
    const paymentMonthly = payments
      .filter(p => (p.status || '').toLowerCase() === 'paid' && new Date(p.paidDate || p.createdAt).getMonth() === currentMonth && new Date(p.paidDate || p.createdAt).getFullYear() === currentYear)
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

    return Math.max(invoiceMonthly, paymentMonthly)
  }, [invoices, payments])

  const outstandingPaymentsCalc = useMemo(() => {
    const pendingInvoices = invoices.filter(i => (i.status || '').toLowerCase() === 'pending' || (i.status || '').toLowerCase() === 'overdue').reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0)
    const pendingPayments = payments.filter(p => (p.status || '').toLowerCase() === 'pending' || (p.status || '').toLowerCase() === 'overdue').reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    return Math.max(pendingInvoices, pendingPayments)
  }, [invoices, payments])

  const totalExpensesCalc = useMemo(() => {
    return expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0)
  }, [expenses])

  const netProfitCalc = totalRevenueCalc - totalExpensesCalc

  const pendingTasksCount = tasks.filter(t => (t.status || '').toLowerCase() !== 'completed').length
  const completedTasksCount = tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length
  const upcomingMeetingsCount = meetings.filter(m => (m.status || 'scheduled').toLowerCase() === 'scheduled').length
  const unreadNotificationsCount = notifications.filter(n => !n.read).length
  
  const todayDateStr = new Date().toISOString().slice(0, 10)
  const todaysActivityCount = logs.filter(l => (l.createdAt || '').startsWith(todayDateStr)).length || logs.slice(0, 10).length

  // Recent lists
  const recentLogs = useMemo(() => logs.slice(0, 7), [logs])
  const recentClients = useMemo(() => clients.slice(0, 5), [clients])
  const recentProjects = useMemo(() => projects.slice(0, 5), [projects])

  // Payment Summary details
  const paidPaymentsTotal = payments.filter(p => (p.status || '').toLowerCase() === 'paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || invoices.filter(i => (i.status || '').toLowerCase() === 'paid').reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0)
  const pendingPaymentsTotal = payments.filter(p => (p.status || '').toLowerCase() === 'pending').reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || invoices.filter(i => (i.status || '').toLowerCase() === 'pending').reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0)
  const overduePaymentsTotal = payments.filter(p => (p.status || '').toLowerCase() === 'overdue').reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || invoices.filter(i => (i.status || '').toLowerCase() === 'overdue').reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0)

  // Global search results across 10 entity collections
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return []
    const q = searchQuery.toLowerCase().trim()
    const results: { type: string; title: string; subtitle: string; link: string; icon: any }[] = []

    clients.forEach(c => {
      if ((c.companyName || '').toLowerCase().includes(q) || (c.contactPerson || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)) {
        results.push({ type: 'Client', title: c.companyName || c.contactPerson, subtitle: `${c.contactPerson} • ${c.email}`, link: 'clients', icon: Users })
      }
    })

    projects.forEach(p => {
      if ((p.title || '').toLowerCase().includes(q) || (p.clientName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Project', title: p.title, subtitle: `Client: ${p.clientName} • Stage: ${p.status}`, link: 'projects', icon: Briefcase })
      }
    })

    invoices.forEach(i => {
      if ((i.invoiceNumber || '').toLowerCase().includes(q) || (i.clientName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Invoice', title: i.invoiceNumber, subtitle: `${i.clientName} • ₹${(i.totalAmount || 0).toLocaleString('en-IN')}`, link: 'invoices', icon: Receipt })
      }
    })

    payments.forEach(p => {
      if ((p.clientName || '').toLowerCase().includes(q) || (p.invoiceNumber || '').toLowerCase().includes(q)) {
        results.push({ type: 'Payment', title: `Payment: ${p.clientName}`, subtitle: `₹${(p.amount || 0).toLocaleString('en-IN')} • ${p.status}`, link: 'payments', icon: CreditCard })
      }
    })

    proposals.forEach(pr => {
      if ((pr.title || '').toLowerCase().includes(q) || (pr.clientName || '').toLowerCase().includes(q) || (pr.proposalNumber || '').toLowerCase().includes(q)) {
        results.push({ type: 'Proposal', title: pr.title || pr.proposalNumber, subtitle: `Client: ${pr.clientName} • ₹${(pr.amount || 0).toLocaleString('en-IN')}`, link: 'proposals', icon: FileSpreadsheet })
      }
    })

    agreements.forEach(ag => {
      if ((ag.agreementNumber || '').toLowerCase().includes(q) || (ag.clientName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Agreement', title: ag.agreementNumber, subtitle: `Client: ${ag.clientName} • ${ag.status}`, link: 'agreements', icon: FileSignature })
      }
    })

    tasks.forEach(t => {
      if ((t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || (t.assignee || '').toLowerCase().includes(q)) {
        results.push({ type: 'Task', title: t.title, subtitle: `Priority: ${t.priority || 'Medium'} • ${t.status || 'Pending'}`, link: 'tasks', icon: CheckSquare })
      }
    })

    meetings.forEach(m => {
      if ((m.title || '').toLowerCase().includes(q) || (m.clientName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Meeting', title: m.title, subtitle: `With: ${m.clientName} on ${m.date || 'TBD'}`, link: 'meetings', icon: Calendar })
      }
    })

    documents.forEach(d => {
      if ((d.name || d.title || '').toLowerCase().includes(q) || (d.clientName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Document', title: d.name || d.title, subtitle: `${d.type || 'Document'} • ${d.clientName || 'General'}`, link: 'documents', icon: FileText })
      }
    })

    timelines.forEach(tl => {
      if ((tl.projectName || '').toLowerCase().includes(q) || (tl.clientName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Timeline', title: tl.projectName, subtitle: `Phase: ${tl.currentPhase || 'Setup'}`, link: 'timeline', icon: GitCommit })
      }
    })

    return results.slice(0, 20)
  }, [searchQuery, clients, projects, invoices, payments, proposals, agreements, tasks, meetings, documents, timelines])

  const handleOpenModule = (moduleSection: string) => {
    if (onNavigate) {
      onNavigate(moduleSection)
    }
  }

  // Quick Action form submission
  const handleQuickActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (quickActionModal === 'client') {
        await recordAdminClient({
          companyName: modalForm.companyName || 'New Enterprise Client',
          contactPerson: modalForm.contactPerson || 'Contact Person',
          email: modalForm.email || `client_${Date.now()}@example.com`,
          phone: modalForm.phone || '+91 9876543210',
          website: modalForm.website || 'https://example.com',
          activeProjectsCount: 1,
          status: 'Active',
          totalRevenue: Number(modalForm.totalRevenue) || 0,
          notes: modalForm.notes || 'Created via Quick Action',
          timeline: [{ date: new Date().toISOString().slice(0, 10), event: 'Client Onboarded' }]
        })
        logAuditEvent('admin', 'Client Created', modalForm.companyName || 'New Client')
      } else if (quickActionModal === 'project') {
        await recordAdminProject({
          title: modalForm.title || 'New Project',
          clientId: modalForm.clientId || '',
          clientName: modalForm.clientName || 'Select Client',
          status: 'In Progress',
          progress: 10,
          startDate: modalForm.startDate || new Date().toISOString().slice(0, 10),
          dueDate: modalForm.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          priority: modalForm.priority || 'High',
          assignedTeam: ['Admin Team'],
          projectFiles: [],
          milestones: [{ title: 'Initial Kickoff', completed: true, dueDate: new Date().toISOString().slice(0, 10) }],
          launchStatus: 'Pending'
        })
        logAuditEvent('project', 'Project Created', modalForm.title || 'New Project')
      } else if (quickActionModal === 'proposal') {
        const pNum = `PROP-${Date.now().toString().slice(-4)}`
        await recordAdminProposal({
          proposalNumber: pNum,
          clientName: modalForm.clientName || 'Client Name',
          clientEmail: modalForm.clientEmail || 'client@example.com',
          title: modalForm.title || 'Enterprise Website & Portal Proposal',
          amount: Number(modalForm.amount) || 150000,
          status: 'Sent',
          validUntil: modalForm.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
          scopeSummary: modalForm.scopeSummary || 'Full-stack enterprise solution.'
        })
        logAuditEvent('pdf', 'Proposal Generated', pNum)
      } else if (quickActionModal === 'agreement') {
        const agNum = `AGR-${Date.now().toString().slice(-4)}`
        await recordAdminAgreement({
          agreementNumber: agNum,
          clientName: modalForm.clientName || 'Client Name',
          clientEmail: modalForm.clientEmail || 'client@example.com',
          status: 'Pending',
          agreementVersion: '1.0'
        })
        logAuditEvent('pdf', 'Agreement Generated', agNum)
      } else if (quickActionModal === 'invoice') {
        const invNum = `INV-${Date.now().toString().slice(-4)}`
        const totalAmt = Number(modalForm.totalAmount) || 50000
        await recordAdminInvoice({
          invoiceNumber: invNum,
          clientName: modalForm.clientName || 'Client Name',
          clientEmail: modalForm.clientEmail || 'client@example.com',
          currency: 'INR',
          items: [{ id: '1', description: modalForm.description || 'Development Services', quantity: 1, unitPrice: totalAmt }],
          taxRate: 18,
          discountRate: 0,
          subtotal: totalAmt,
          taxAmount: Math.round(totalAmt * 0.18),
          discountAmount: 0,
          totalAmount: Math.round(totalAmt * 1.18),
          status: 'Pending',
          dueDate: modalForm.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
        })
        logAuditEvent('invoice', 'Invoice Created', invNum)
      } else if (quickActionModal === 'payment') {
        await recordAdminPayment({
          invoiceNumber: modalForm.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
          clientName: modalForm.clientName || 'Client Name',
          amount: Number(modalForm.amount) || 25000,
          dueDate: new Date().toISOString().slice(0, 10),
          paidDate: new Date().toISOString().slice(0, 10),
          status: 'Paid',
          paymentMethod: modalForm.paymentMethod || 'Bank Transfer',
          reminderSentCount: 0
        })
        logAuditEvent('invoice', 'Payment Recorded', `₹${modalForm.amount || 25000} from ${modalForm.clientName || 'Client'}`)
      } else if (quickActionModal === 'meeting') {
        await recordAdminMeeting({
          title: modalForm.title || 'Client Project Discussion',
          date: modalForm.date || new Date().toISOString().slice(0, 10),
          time: modalForm.time || '11:00 AM',
          clientName: modalForm.clientName || 'Client Name',
          participants: modalForm.participants || 'Admin, Client Team',
          notes: modalForm.notes || 'Meeting scheduled from Quick Actions',
          summary: '',
          actionItems: '',
          followUpDate: '',
          status: 'Scheduled',
          createdAt: new Date().toISOString()
        })
        logAuditEvent('system', 'Meeting Scheduled', modalForm.title || 'Client Meeting')
      } else if (quickActionModal === 'task') {
        await recordAdminTask({
          title: modalForm.title || 'New Task',
          description: modalForm.description || '',
          priority: modalForm.priority || 'Medium',
          status: 'Pending',
          dueDate: modalForm.dueDate || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          progress: 0,
          assignee: modalForm.assignee || 'Admin',
          notes: '',
          createdAt: new Date().toISOString()
        })
        logAuditEvent('system', 'Task Created', modalForm.title || 'New Task')
      } else if (quickActionModal === 'document') {
        await recordAdminDocument({
          name: modalForm.name || 'Project Deliverable PDF',
          type: modalForm.type || 'Report',
          clientName: modalForm.clientName || 'General Client',
          date: new Date().toISOString().slice(0, 10),
          notes: modalForm.notes || 'Uploaded via Quick Actions',
          fileUrl: modalForm.fileUrl || '',
          fileType: 'pdf',
          amount: Number(modalForm.amount) || 0,
          createdAt: new Date().toISOString()
        })
        logAuditEvent('pdf', 'Document Uploaded', modalForm.name || 'Document')
      } else if (quickActionModal === 'expense') {
        await recordAdminExpense({
          type: 'expense',
          category: modalForm.category || 'Software',
          amount: Number(modalForm.amount) || 5000,
          description: modalForm.description || 'Monthly Service Fee',
          date: new Date().toISOString().slice(0, 10),
          paymentMethod: modalForm.paymentMethod || 'UPI / Card',
          clientName: modalForm.clientName || 'Internal',
          reference: modalForm.reference || '',
          notes: '',
          recurring: false,
          recurringInterval: 'Monthly',
          createdAt: new Date().toISOString()
        })
        logAuditEvent('system', 'Expense Recorded', `₹${modalForm.amount || 5000} - ${modalForm.category || 'Expense'}`)
      } else if (quickActionModal === 'timeline') {
        await recordAdminTimeline({
          projectName: modalForm.projectName || 'Website Redesign',
          clientName: modalForm.clientName || 'Client Name',
          currentPhase: modalForm.currentPhase || 'Development & UI',
          estimatedDelivery: modalForm.estimatedDelivery || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          timelineProgress: 25,
          upcomingTasks: ['Design Review', 'Database Integration'],
          completedTasks: ['Project Kickoff'],
          delayedTasks: []
        })
        logAuditEvent('project', 'Timeline Created', modalForm.projectName || 'Project Timeline')
      }

      await syncFromCloud()
      setQuickActionModal(null)
      setModalForm({})
    } catch (err) {
      console.error('Quick Action error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Export Executive PDF Report
  const handleExportPDF = () => {
    const headers = ['Metric Section', 'Details & Live Database Count']
    const rows = [
      ['Total Clients', `${clients.length} active enterprise clients`],
      ['Projects Overview', `${projects.length} Total (${activeProjectsCount} Active, ${completedProjectsCount} Completed)`],
      ['Total Revenue', `₹${totalRevenueCalc.toLocaleString('en-IN')}`],
      ['Monthly Revenue', `₹${monthlyRevenueCalc.toLocaleString('en-IN')}`],
      ['Outstanding Payments', `₹${outstandingPaymentsCalc.toLocaleString('en-IN')}`],
      ['Total Expenses', `₹${totalExpensesCalc.toLocaleString('en-IN')}`],
      ['Net Profit', `₹${netProfitCalc.toLocaleString('en-IN')}`],
      ['PDF Documents Archive', `${pdfs.length} PDFs generated`],
      ['Tasks Breakdown', `${tasks.length} Total (${pendingTasksCount} Pending, ${completedTasksCount} Completed)`],
      ['Upcoming Meetings', `${upcomingMeetingsCount} scheduled meetings`],
      ['Notifications Status', `${unreadNotificationsCount} unread alerts`],
      ['System Audit Log', `${logs.length} system audit entries recorded`],
    ]
    exportSectionReportPDF('AROM STUDIO Overview Control Center Report', 'Production Database Executive Summary', headers, rows, 'AROM_Overview_Report')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ---------------------------------------------------- */}
      {/* 1. HEADER SECTION                                     */}
      {/* ---------------------------------------------------- */}
      <div className="glass rounded-[28px] p-6 border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-r from-bg/90 via-bg-card/70 to-bg/90 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent font-mono text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>
                AROM STUDIO Control Center
              </span>
              <span className="text-xs font-mono text-white/40 hidden sm:inline-block">|</span>
              <span className="text-xs font-mono text-white/60 hidden sm:inline-block">{currentDateStr}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-amber-200">Administrator</span>
            </h1>
            <p className="text-xs text-white/50 font-body mt-1">
              Real-time enterprise intelligence & production database synchronization
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {/* IST Clock */}
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-accent font-medium flex items-center gap-2 shadow-inner">
              <Clock className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>{currentTime || 'IST Live Time'}</span>
            </div>

            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-xs text-white/70 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
            >
              <Search className="h-3.5 w-3.5 text-white/40 group-hover:text-accent transition-colors" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden md:inline-block text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white/40 border border-white/10">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/70 hover:text-accent transition-all cursor-pointer relative shadow-sm"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-black font-bold text-[9px] flex items-center justify-center border-2 border-bg animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-bg-card/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-accent" /> Live Notifications ({notifications.length})
                    </h4>
                    <button onClick={() => setNotificationsOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 6).map((n: any, idx: number) => (
                        <div
                          key={n.id || idx}
                          onClick={() => { setNotificationsOpen(false); handleOpenModule('notifications') }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            !n.read ? 'bg-accent/10 border-accent/30 text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-accent text-[11px] truncate">{n.title || 'Notification'}</span>
                            <span className="text-[9px] text-white/40 font-mono">{formatIST(n.createdAt)}</span>
                          </div>
                          <p className="text-[11px] line-clamp-2">{n.message || 'No notification text'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40 py-6 text-center">No records available</p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-center">
                    <button
                      onClick={() => { setNotificationsOpen(false); handleOpenModule('notifications') }}
                      className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                      View All Notifications Center →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-xs text-white transition-all cursor-pointer shadow-sm"
              >
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-accent to-amber-300 text-black font-bold flex items-center justify-center text-[10px]">
                  AS
                </div>
                <div className="text-left hidden md:block">
                  <p className="font-medium text-xs text-white leading-tight">Admin User</p>
                  <p className="text-[9px] font-mono text-accent">Super Admin</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-bg-card/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-white/10 pb-3 mb-3">
                    <p className="text-xs font-bold text-white">AROM STUDIO Administrator</p>
                    <p className="text-[10px] text-white/50 font-mono mt-0.5">admin@arom.studio</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ Production Database Connected
                    </span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setProfileOpen(false); handleOpenModule('settings') }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Shield className="h-3.5 w-3.5 text-accent" /> Security & System Settings
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); handleExportPDF() }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-accent" /> Export Executive Summary PDF
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => { setProfileOpen(false); onLogout() }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors cursor-pointer border-t border-white/10 mt-2 pt-2"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-black font-semibold text-xs transition-all cursor-pointer shadow-lg shadow-accent/15"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. QUICK ACTIONS SECTION                             */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-2">
            <span>⚡ Quick Actions</span>
            <span className="text-[10px] text-white/40 font-normal">(11 Operational Workflows)</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'client', label: 'Create New Client', icon: UserPlus, color: 'text-blue-400', border: 'hover:border-blue-400/40' },
            { id: 'project', label: 'Create Project', icon: FolderPlus, color: 'text-indigo-400', border: 'hover:border-indigo-400/40' },
            { id: 'proposal', label: 'Generate Proposal', icon: FileSpreadsheet, color: 'text-amber-400', border: 'hover:border-amber-400/40' },
            { id: 'agreement', label: 'Generate Agreement', icon: FileSignature, color: 'text-emerald-400', border: 'hover:border-emerald-400/40' },
            { id: 'invoice', label: 'Create Invoice', icon: Receipt, color: 'text-purple-400', border: 'hover:border-purple-400/40' },
            { id: 'payment', label: 'Record Payment', icon: CreditCard, color: 'text-emerald-300', border: 'hover:border-emerald-300/40' },
            { id: 'meeting', label: 'Schedule Meeting', icon: Calendar, color: 'text-pink-400', border: 'hover:border-pink-400/40' },
            { id: 'task', label: 'Create Task', icon: CheckSquare, color: 'text-accent', border: 'hover:border-accent/40' },
            { id: 'document', label: 'Upload Document', icon: Upload, color: 'text-cyan-400', border: 'hover:border-cyan-400/40' },
            { id: 'expense', label: 'Add Expense', icon: DollarSign, color: 'text-rose-400', border: 'hover:border-rose-400/40' },
            { id: 'timeline', label: 'Create Timeline', icon: GitCommit, color: 'text-teal-400', border: 'hover:border-teal-400/40' },
          ].map((act) => {
            const Icon = act.icon
            return (
              <button
                key={act.id}
                onClick={() => {
                  setModalForm({})
                  setQuickActionModal(act.id)
                }}
                className={`p-3 rounded-2xl bg-bg-card/60 hover:bg-bg-card border border-white/10 ${act.border} transition-all duration-200 text-left flex flex-col justify-between gap-2.5 cursor-pointer shadow-sm group hover:-translate-y-0.5`}
              >
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 w-fit transition-colors">
                  <Icon className={`h-4 w-4 ${act.color}`} />
                </div>
                <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors leading-tight">
                  {act.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. STATISTICS CARDS SECTION (16 Clickable Cards)      */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-2">
            <span>📊 Live Business Statistics</span>
            <span className="text-[10px] text-white/40 font-normal">(Click any card to open related module)</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total Clients', value: clients.length, sub: 'Active Accounts', icon: Users, module: 'clients', color: 'text-accent' },
            { label: 'Active Projects', value: activeProjectsCount, sub: `${projects.length} Total`, icon: Briefcase, module: 'projects', color: 'text-blue-400' },
            { label: 'Completed Projects', value: completedProjectsCount, sub: 'Launched', icon: CheckCircle, module: 'projects', color: 'text-emerald-400' },
            { label: 'Pending Projects', value: pendingProjectsCount, sub: 'In Planning', icon: Clock, module: 'projects', color: 'text-amber-400' },
            { label: 'Total Revenue', value: `₹${totalRevenueCalc.toLocaleString('en-IN')}`, sub: 'Lifetime Paid', icon: DollarSign, module: 'payments', color: 'text-emerald-400' },
            { label: 'Monthly Revenue', value: `₹${monthlyRevenueCalc.toLocaleString('en-IN')}`, sub: 'This Month', icon: TrendingUp, module: 'payments', color: 'text-teal-400' },
            { label: 'Outstanding Payments', value: `₹${outstandingPaymentsCalc.toLocaleString('en-IN')}`, sub: 'Pending Invoices', icon: AlertTriangle, module: 'invoices', color: 'text-amber-400' },
            { label: 'Total Expenses', value: `₹${totalExpensesCalc.toLocaleString('en-IN')}`, sub: 'Operational Cost', icon: DollarSign, module: 'finance', color: 'text-rose-400' },
            { label: 'Net Profit', value: `₹${netProfitCalc.toLocaleString('en-IN')}`, sub: 'Revenue - Expenses', icon: TrendingUp, module: 'finance', color: netProfitCalc >= 0 ? 'text-emerald-400' : 'text-rose-400' },
            { label: 'Total Documents', value: documents.length, sub: 'Files Vault', icon: FileText, module: 'documents', color: 'text-indigo-400' },
            { label: 'Generated PDFs', value: pdfs.length, sub: 'Official PDFs', icon: FileCheck, module: 'pdfs', color: 'text-purple-400' },
            { label: 'Pending Tasks', value: pendingTasksCount, sub: `${tasks.length} Total`, icon: CheckSquare, module: 'tasks', color: 'text-amber-400' },
            { label: 'Completed Tasks', value: completedTasksCount, sub: 'Done Tasks', icon: CheckCircle, module: 'tasks', color: 'text-emerald-400' },
            { label: 'Upcoming Meetings', value: upcomingMeetingsCount, sub: 'Scheduled', icon: Calendar, module: 'meetings', color: 'text-pink-400' },
            { label: 'Unread Notifications', value: unreadNotificationsCount, sub: `${notifications.length} Total`, icon: Bell, module: 'notifications', color: 'text-accent' },
            { label: "Today's Activity", value: todaysActivityCount, sub: 'Audit Events', icon: Activity, module: 'logs', color: 'text-cyan-400' },
          ].map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                onClick={() => handleOpenModule(card.module)}
                className="glass rounded-2xl p-3.5 border border-white/10 hover:border-accent/40 bg-bg-card/50 hover:bg-bg-card/90 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-accent/5 group hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider line-clamp-1">
                    {card.label}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-accent/10 transition-colors shrink-0">
                    <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-heading font-extrabold text-white group-hover:text-accent transition-colors truncate">
                    {card.value}
                  </p>
                  <p className="text-[9px] font-mono text-white/40 mt-0.5 line-clamp-1">{card.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN TWO-COLUMN WORKFLOW GRID                        */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLUMNS: Activity, Clients, Projects, Payments Summary */}
        <div className="lg:col-span-2 space-y-6">

          {/* 4. RECENT ACTIVITY WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Recent Activity Log</h3>
              </div>
              <button
                onClick={() => handleOpenModule('logs')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Audit Logs <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {recentLogs.length > 0 ? (
              <div className="space-y-2.5">
                {recentLogs.map((log: any, i: number) => {
                  const evType = (log.type || log.module || 'activity').toLowerCase()
                  return (
                    <div
                      key={log.id || i}
                      onClick={() => handleOpenModule(log.module || 'logs')}
                      className="flex items-center gap-3 text-xs text-white/80 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                    >
                      <span className="text-white/40 font-mono text-[10px] shrink-0 w-28">{formatIST(log.createdAt)}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold uppercase shrink-0 ${
                        evType.includes('lead') ? 'bg-amber-400/15 text-amber-300 border border-amber-400/20' :
                        evType.includes('pdf') || evType.includes('doc') ? 'bg-accent/15 text-accent border border-accent/20' :
                        evType.includes('invoice') || evType.includes('payment') ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/20' :
                        evType.includes('project') ? 'bg-blue-400/15 text-blue-300 border border-blue-400/20' :
                        'bg-white/10 text-white/70 border border-white/10'
                      }`}>
                        {log.type || log.module || 'activity'}
                      </span>
                      <span className="text-white font-medium truncate flex-1">{log.event || log.detail || log.action}</span>
                      <span className="text-[10px] text-white/40 font-mono shrink-0 hidden sm:inline-block">Admin</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

          {/* 5. RECENT CLIENTS WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Recent Clients</h3>
              </div>
              <button
                onClick={() => handleOpenModule('clients')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                All Clients ({clients.length}) <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {recentClients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-white/40 border-b border-white/10 pb-2">
                      <th className="pb-2 font-normal">Client & Business</th>
                      <th className="pb-2 font-normal">Contact</th>
                      <th className="pb-2 font-normal">Status</th>
                      <th className="pb-2 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentClients.map((c: any) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5">
                          <p className="font-semibold text-white">{c.companyName || c.contactPerson}</p>
                          <p className="text-[10px] text-white/50">{c.contactPerson}</p>
                        </td>
                        <td className="py-2.5">
                          <p className="text-white/80">{c.email}</p>
                          <p className="text-[10px] text-white/40">{c.phone || 'N/A'}</p>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-medium ${
                            (c.status || '').toLowerCase() === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/60'
                          }`}>
                            {c.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenModule('clients')}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
                            title="View Client"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenModule('clients')}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
                            title="Edit Client"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

          {/* 6. PROJECT PROGRESS WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Project Progress</h3>
              </div>
              <button
                onClick={() => handleOpenModule('projects')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                Project Manager <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {recentProjects.length > 0 ? (
              <div className="space-y-3.5">
                {recentProjects.map((p: any) => {
                  const progressPct = Math.min(100, Math.max(0, Number(p.progress) || 0))
                  return (
                    <div key={p.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-semibold text-white">{p.title}</h4>
                          <p className="text-[10px] text-white/50">Client: {p.clientName || 'General Client'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-accent/15 text-accent border border-accent/20">
                            {p.status || 'In Progress'}
                          </span>
                          <button
                            onClick={() => handleOpenModule('projects')}
                            className="px-2.5 py-1 rounded-lg bg-accent/20 text-accent font-semibold text-[10px] hover:bg-accent hover:text-black transition-all cursor-pointer"
                          >
                            Open
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                          <span>Stage: {p.currentStage || p.launchStatus || 'Development'}</span>
                          <span className="text-accent font-bold">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-accent via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

          {/* 7. PAYMENTS SUMMARY WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Payments Summary (₹ INR)</h3>
              </div>
              <button
                onClick={() => handleOpenModule('payments')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                Payments Center <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Financial Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] font-mono text-emerald-400 uppercase">Paid Total</p>
                <p className="text-base font-bold text-white mt-0.5">₹{paidPaymentsTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] font-mono text-amber-400 uppercase">Pending</p>
                <p className="text-base font-bold text-white mt-0.5">₹{pendingPaymentsTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-[10px] font-mono text-rose-400 uppercase">Overdue</p>
                <p className="text-base font-bold text-white mt-0.5">₹{overduePaymentsTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <p className="text-[10px] font-mono text-teal-400 uppercase">Expected Month</p>
                <p className="text-base font-bold text-white mt-0.5">₹{monthlyRevenueCalc.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Recent Payments & Due dates list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-[11px] font-mono text-white/50 uppercase mb-2">Recent Payments</h4>
                {payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.slice(0, 3).map((pm: any, idx: number) => (
                      <div key={pm.id || idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-white">{pm.clientName || 'Client'}</p>
                          <p className="text-[10px] text-white/40">{pm.paymentMethod || 'Bank Transfer'}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">₹{(Number(pm.amount) || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 py-3 font-mono">No records available</p>
                )}
              </div>

              <div>
                <h4 className="text-[11px] font-mono text-white/50 uppercase mb-2">Upcoming Due Dates</h4>
                {invoices.filter(i => (i.status || '').toLowerCase() === 'pending').length > 0 ? (
                  <div className="space-y-2">
                    {invoices.filter(i => (i.status || '').toLowerCase() === 'pending').slice(0, 3).map((inv: any, idx: number) => (
                      <div key={inv.id || idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-white">{inv.invoiceNumber || inv.clientName}</p>
                          <p className="text-[10px] text-amber-400 font-mono">Due: {inv.dueDate || 'Soon'}</p>
                        </div>
                        <span className="font-mono font-bold text-amber-300">₹{(Number(inv.totalAmount) || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 py-3 font-mono">No records available</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT 1 COLUMN: Tasks, Meetings, Documents, Notifications */}
        <div className="space-y-6">

          {/* 8. TASKS WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Tasks</h3>
              </div>
              <button
                onClick={() => handleOpenModule('tasks')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                Task Manager <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-mono text-[10px] font-semibold border border-amber-500/20">
                {pendingTasksCount} Pending
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/20">
                {completedTasksCount} Done
              </span>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(0, 4).map((t: any, idx: number) => (
                  <div
                    key={t.id || idx}
                    onClick={() => handleOpenModule('tasks')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-xs font-medium truncate ${t.status === 'Completed' ? 'line-through text-white/40' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">Assignee: {t.assignee || 'Admin'}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono shrink-0 ${
                      (t.priority || '').toLowerCase() === 'urgent' ? 'bg-red-500/20 text-red-300' :
                      (t.priority || '').toLowerCase() === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/60'
                    }`}>
                      {t.priority || 'Medium'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

          {/* 9. MEETINGS WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-400" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Meetings</h3>
              </div>
              <button
                onClick={() => handleOpenModule('meetings')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                Schedule <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {meetings.length > 0 ? (
              <div className="space-y-2.5">
                {meetings.slice(0, 4).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                      <p className="text-[10px] text-white/50 truncate">Client: {m.clientName || 'General'}</p>
                      <p className="text-[9px] font-mono text-accent">{m.date || 'Today'} • {m.time || '11:00 AM'}</p>
                    </div>
                    <button
                      onClick={() => handleOpenModule('meetings')}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-accent/20 hover:text-accent text-white/70 font-mono text-[10px] cursor-pointer shrink-0"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

          {/* 10. DOCUMENTS WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Recent Documents</h3>
              </div>
              <button
                onClick={() => handleOpenModule('documents')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                Vault <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {documents.length > 0 || pdfs.length > 0 ? (
              <div className="space-y-2">
                {[...documents, ...pdfs].slice(0, 4).map((doc: any, idx: number) => (
                  <div key={doc.id || idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{doc.name || doc.title || 'PDF Document'}</p>
                      <p className="text-[10px] text-white/40 truncate">{doc.clientName || 'General Client'}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-accent/20 text-white/70 hover:text-accent text-[10px] cursor-pointer"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

          {/* 11. NOTIFICATIONS WIDGET */}
          <div className="glass rounded-[24px] p-6 border border-white/10 shadow-xl bg-bg-card/40">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Notifications</h3>
              </div>
              <button
                onClick={() => handleOpenModule('notifications')}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                All <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n: any, idx: number) => (
                  <div
                    key={n.id || idx}
                    onClick={() => handleOpenModule('notifications')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-accent">{n.title || 'Notification'}</span>
                      <span className="text-white/40 font-mono">{formatIST(n.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-white/70 line-clamp-1">{n.message || 'Notification detail'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 py-6 text-center font-mono">No records available</p>
            )}
          </div>

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 12. GLOBAL SEARCH MODAL                              */}
      {/* ---------------------------------------------------- */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center pt-16 p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-bg-card border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3 flex-1">
                <Search className="h-5 w-5 text-accent" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Clients, Projects, Invoices, Payments, Tasks, Meetings, Documents..."
                  className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none font-body"
                />
              </div>
              <button onClick={() => setSearchModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {searchResults.length > 0 ? (
                searchResults.map((res, i) => {
                  const Icon = res.icon
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSearchModalOpen(false)
                        setSearchQuery('')
                        handleOpenModule(res.link)
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-accent/10 border border-white/5 hover:border-accent/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-accent/20 text-accent transition-colors shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white group-hover:text-accent transition-colors truncate">{res.title}</p>
                          <p className="text-[10px] text-white/50 truncate">{res.subtitle}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-white/10 text-white/60 group-hover:bg-accent group-hover:text-black font-semibold shrink-0">
                        {res.type}
                      </span>
                    </div>
                  )
                })
              ) : searchQuery.trim() ? (
                <p className="text-xs text-white/40 py-8 text-center font-mono">No matching records found across production database</p>
              ) : (
                <p className="text-xs text-white/40 py-8 text-center font-mono">Type 2 or more characters to search across 10 database collections...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* QUICK ACTION INTERACTIVE MODAL                       */}
      {/* ---------------------------------------------------- */}
      {quickActionModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-bg-card border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-accent">⚡ Quick Action:</span> {quickActionModal.toUpperCase()}
              </h3>
              <button onClick={() => setQuickActionModal(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleQuickActionSubmit} className="space-y-4">
              {quickActionModal === 'client' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Company / Business Name</label>
                    <input required value={modalForm.companyName || ''} onChange={e => setModalForm({ ...modalForm, companyName: e.target.value })} placeholder="Acme Technologies Ltd" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Contact Person</label>
                    <input required value={modalForm.contactPerson || ''} onChange={e => setModalForm({ ...modalForm, contactPerson: e.target.value })} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Client Email</label>
                    <input required type="email" value={modalForm.email || ''} onChange={e => setModalForm({ ...modalForm, email: e.target.value })} placeholder="john@acme.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              {quickActionModal === 'project' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Project Name</label>
                    <input required value={modalForm.title || ''} onChange={e => setModalForm({ ...modalForm, title: e.target.value })} placeholder="Enterprise E-Commerce Rebuild" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Client Name</label>
                    <input required value={modalForm.clientName || ''} onChange={e => setModalForm({ ...modalForm, clientName: e.target.value })} placeholder="Client Company" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              {quickActionModal === 'invoice' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Client Name</label>
                    <input required value={modalForm.clientName || ''} onChange={e => setModalForm({ ...modalForm, clientName: e.target.value })} placeholder="Client Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Invoice Amount (₹ INR)</label>
                    <input required type="number" value={modalForm.totalAmount || ''} onChange={e => setModalForm({ ...modalForm, totalAmount: e.target.value })} placeholder="50000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              {quickActionModal === 'payment' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Client Name</label>
                    <input required value={modalForm.clientName || ''} onChange={e => setModalForm({ ...modalForm, clientName: e.target.value })} placeholder="Client Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Paid Amount (₹ INR)</label>
                    <input required type="number" value={modalForm.amount || ''} onChange={e => setModalForm({ ...modalForm, amount: e.target.value })} placeholder="25000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              {quickActionModal === 'meeting' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Meeting Title</label>
                    <input required value={modalForm.title || ''} onChange={e => setModalForm({ ...modalForm, title: e.target.value })} placeholder="Website Kickoff Sync" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Client Name</label>
                    <input required value={modalForm.clientName || ''} onChange={e => setModalForm({ ...modalForm, clientName: e.target.value })} placeholder="Client Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              {quickActionModal === 'task' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Task Title</label>
                    <input required value={modalForm.title || ''} onChange={e => setModalForm({ ...modalForm, title: e.target.value })} placeholder="Review Figma Prototypes" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Assignee</label>
                    <input value={modalForm.assignee || ''} onChange={e => setModalForm({ ...modalForm, assignee: e.target.value })} placeholder="Admin" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              {/* Default generic fields for remaining quick actions */}
              {!['client', 'project', 'invoice', 'payment', 'meeting', 'task'].includes(quickActionModal) && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Title / Name</label>
                    <input required value={modalForm.title || modalForm.name || modalForm.projectName || ''} onChange={e => setModalForm({ ...modalForm, title: e.target.value, name: e.target.value, projectName: e.target.value })} placeholder="Enter record title" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Client Name</label>
                    <input value={modalForm.clientName || ''} onChange={e => setModalForm({ ...modalForm, clientName: e.target.value })} placeholder="Client Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-white/60 block mb-1">Amount (₹ INR if applicable)</label>
                    <input type="number" value={modalForm.amount || ''} onChange={e => setModalForm({ ...modalForm, amount: e.target.value })} placeholder="10000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent" />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 cursor-pointer transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-bg-card border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-heading font-bold text-white">Document Preview: {previewDoc.name || previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs text-white/80 font-mono">
              <p><span className="text-white/40">Title:</span> {previewDoc.name || previewDoc.title}</p>
              <p><span className="text-white/40">Type:</span> {previewDoc.type || previewDoc.pdfType || 'PDF Document'}</p>
              <p><span className="text-white/40">Client:</span> {previewDoc.clientName || 'General Client'}</p>
              <p><span className="text-white/40">Date:</span> {formatIST(previewDoc.createdAt || previewDoc.date)}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 rounded-xl bg-accent text-black font-semibold text-xs cursor-pointer">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}