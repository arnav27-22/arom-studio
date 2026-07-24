import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { CreditCard, Search, DollarSign, Clock, AlertCircle, Download, Bell, Plus, X, Trash2 } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, type AdminPayment } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function PaymentsManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDownloadPaymentsPDF = () => {
    const payments = store.payments || []
    const headers = ['Invoice #', 'Client Name', 'Amount', 'Due Date', 'Payment Method', 'Status']
    const rows = payments.map((p) => [
      p.invoiceNumber,
      p.clientName,
      `₹${(p.amount || 0).toLocaleString()}`,
      p.dueDate,
      (p as any).paymentMethod || 'Bank Wire Transfer',
      p.status,
    ])
    exportSectionReportPDF('Payments & Retainers Audit Report', 'AROM Studio Revenue & Invoice Log', headers, rows, 'Payments_Audit_Report')
  }

  const handleDeletePayment = (id: string) => {
    const p = payments.find((x) => x.id === id)
    moveToRecycleBin('payments', id, p?.invoiceNumber || p?.clientName, p?.clientName)
    setStore(getAdminStore())
  }

  const [form, setForm] = useState({
    invoiceNumber: 'INV-2026-004',
    clientName: 'Apex Innovations Global',
    amount: 5000,
    dueDate: '2026-08-15',
    status: 'Pending' as const,
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const payments = store.payments || []

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCollected = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0)
  const pendingAmount = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.amount || 0), 0)
  const overdueAmount = payments.filter(p => p.status === 'Overdue').reduce((s, p) => s + (p.amount || 0), 0)

  const handleSendReminder = (id: string) => {
    const updatedPayments = payments.map((p) => {
      if (p.id === id) {
        alert(`Payment reminder notification sent to ${p.clientName} for invoice ${p.invoiceNumber}!`)
        return { ...p, reminderSentCount: (p.reminderSentCount || 0) + 1 }
      }
      return p
    })
    const updated = { ...store, payments: updatedPayments }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName) return

    const newPay: AdminPayment = {
      id: 'pay_' + Math.random().toString(36).slice(2, 9),
      invoiceNumber: form.invoiceNumber,
      clientName: form.clientName,
      amount: Number(form.amount) || 0,
      dueDate: form.dueDate,
      status: form.status,
      reminderSentCount: 0,
      createdAt: new Date().toISOString(),
    }

    const updated = { ...store, payments: [newPay, ...store.payments] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (v: string) => <span className="font-mono text-xs font-bold text-accent">{v}</span>,
    },
    {
      key: 'clientName',
      label: 'Client Name',
      render: (v: string) => <span className="text-white text-xs font-medium">{v}</span>,
    },
    {
      key: 'amount',
      label: 'Amount (₹)',
      render: (v: number) => (
        <span className="text-emerald-400 font-bold text-xs font-mono">
          ₹{(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (v: string) => <span className="text-white/70 text-xs font-mono">{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Paid' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          v === 'Pending' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
          'bg-red-500/20 border-red-500/40 text-red-400'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminPayment) => (
        <div className="flex items-center gap-2">
          {row.status !== 'Paid' && (
            <button
              onClick={() => handleSendReminder(row.id)}
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
              title="Send Payment Reminder"
            >
              <Bell className="h-3 w-3" /> Remind
            </button>
          )}
          <button
            onClick={() => handleDeletePayment(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Payment Record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" /> Payment Management
          </h2>
          <p className="text-xs text-white/50">Track client retainers, pending invoices, overdue balances & payment reminders</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadPaymentsPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Payments PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Log Payment Milestone
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Collected Revenue" value={`₹${totalCollected.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Pending Payments" value={`₹${pendingAmount.toLocaleString()}`} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Overdue Amount" value={`₹${overdueAmount.toLocaleString()}`} icon={<AlertCircle className="h-4 w-4 text-red-400" />} />
      </div>

      {/* Filters & Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search invoice number, client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Paid', 'Pending', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={filteredPayments} />
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Log Payment Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-medium">Invoice Number</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Client Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Apex Innovations Global"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Amount ($)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
