import { useState, useEffect } from 'react'
import { DollarSign, Plus, TrendingUp, TrendingDown, X, Search, Trash2, BarChart3, Download, Calendar } from 'lucide-react'
import { getAdminStore, syncFromCloud, saveAdminStore, formatIST } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  paymentMethod: string
  clientName: string
  reference: string
  notes: string
  recurring: boolean
  recurringInterval: string
  createdAt: string
}

const INCOME_CATS = ['Website Development', 'E-commerce', 'SEO', 'Maintenance', 'Consulting', 'Hosting', 'Design', 'Other']
const EXPENSE_CATS = ['Hosting', 'Domain', 'Software', 'Marketing', 'Equipment', 'Office', 'Vendor', 'Subscription', 'Tax', 'Other']
const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
const uid = () => `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function Finance() {
  const [store, setStore] = useState(getAdminStore())
  const [tab, setTab] = useState<'overview' | 'income' | 'expense' | 'reports'>('overview')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'income' | 'expense'>('income')
  const [reportYear, setReportYear] = useState(new Date().getFullYear())

  const [amount, setAmount] = useState(0); const [category, setCategory] = useState('')
  const [description, setDescription] = useState(''); const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(''); const [clientName, setClientName] = useState('')
  const [reference, setReference] = useState(''); const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false); const [recurringInterval, setRecurringInterval] = useState('Monthly')

  const reload = () => { syncFromCloud().then(s => setStore(s)) }
  useEffect(() => { reload() }, [])

  const allIncomes: Transaction[] = (store.incomes || []).map((t: any) => ({ ...t, type: 'income' as const }))
  const allExpenses: Transaction[] = (store.expenses || []).map((t: any) => ({ ...t, type: 'expense' as const }))

  const totalIncome = allIncomes.reduce((s, t) => s + (t.amount || 0), 0)
  const totalExpense = allExpenses.reduce((s, t) => s + (t.amount || 0), 0)
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0'

  const byCategory = (items: Transaction[]) => {
    const map: Record<string, number> = {}
    items.forEach(t => { const c = t.category || 'Other'; map[c] = (map[c] || 0) + (t.amount || 0) })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }

  const byMonth = (items: Transaction[], year: number) => {
    const map: Record<string, number> = {}
    MONTHS.forEach(m => { map[m] = 0 })
    items.forEach(t => {
      const d = new Date(t.date || t.createdAt)
      if (d.getFullYear() !== year) return
      const m = MONTHS[d.getMonth()]
      map[m] = (map[m] || 0) + (t.amount || 0)
    })
    return map
  }

  const years = [...new Set([...allIncomes, ...allExpenses].map(t => new Date(t.date || t.createdAt).getFullYear()))].sort()

  const monthlyIncome = byMonth(allIncomes, reportYear)
  const monthlyExpense = byMonth(allExpenses, reportYear)

  const maxMonthly = Math.max(...Object.values(monthlyIncome), ...Object.values(monthlyExpense), 1)
  const currentYearIncome = Object.values(monthlyIncome).reduce((s, v) => s + v, 0)
  const currentYearExpense = Object.values(monthlyExpense).reduce((s, v) => s + v, 0)

  const currentItems = tab === 'income' ? allIncomes : tab === 'expense' ? allExpenses : []
  const filtered = currentItems.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.clientName?.toLowerCase().includes(q)
  })

  const save = async (txn: Transaction) => {
    const endpoint = txn.type === 'income' ? 'incomes' : 'expenses'
    await fetch(`/api/admin/${endpoint}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txn),
    })
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) return
    const txn: Transaction = {
      id: uid(), type: modalType, category, amount, description, date: date || new Date().toISOString().split('T')[0],
      paymentMethod, clientName, reference, notes, recurring, recurringInterval,
      createdAt: new Date().toISOString(),
    }
    await save(txn)
    setShowModal(false)
    setAmount(0); setCategory(''); setDescription(''); setDate(''); setPaymentMethod(''); setClientName(''); setReference(''); setNotes(''); setRecurring(false)
  }

  const deleteItem = async (id: string, type: string) => {
    await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE', credentials: 'include' })
    reload()
  }

  const handleExportReport = () => {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Year', String(reportYear)], ['Total Income', `₹${currentYearIncome.toLocaleString('en-IN')}`],
      ['Total Expenses', `₹${currentYearExpense.toLocaleString('en-IN')}`],
      ['Net Profit', `₹${(currentYearIncome - currentYearExpense).toLocaleString('en-IN')}`],
      ['All-time Income', `₹${totalIncome.toLocaleString('en-IN')}`],
      ['All-time Expenses', `₹${totalExpense.toLocaleString('en-IN')}`],
      ['All-time Net', `₹${(totalIncome - totalExpense).toLocaleString('en-IN')}`],
      ['Profit Margin', `${profitMargin}%`],
    ]
    exportSectionReportPDF(`Finance Report ${reportYear}`, 'AROM Studio Financial Summary', headers, rows, `Finance_Report_${reportYear}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><DollarSign className="h-5 w-5 text-accent" /> Finance</h2>
          <p className="text-xs text-white/50">Income, expenses, profit, monthly trends & reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setModalType('income'); setShowModal(true) }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/30 transition-all cursor-pointer border border-emerald-500/30">
            <Plus className="h-4 w-4" /> Add Income
          </button>
          <button onClick={() => { setModalType('expense'); setShowModal(true) }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-semibold text-xs hover:bg-red-500/30 transition-all cursor-pointer border border-red-500/30">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-emerald-500/20">
          <div className="text-xs text-white/50 mb-1">Total Income</div>
          <div className="text-2xl font-bold text-emerald-400">₹{totalIncome.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass rounded-2xl p-4 border border-red-500/20">
          <div className="text-xs text-white/50 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-400">₹{totalExpense.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="text-xs text-white/50 mb-1">Net Profit</div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="text-xs text-white/50 mb-1">Profit Margin</div>
          <div className="text-2xl font-bold text-accent">{profitMargin}%</div>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3 flex-wrap">
          {(['overview', 'income', 'expense', 'reports'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize ${tab === t ? 'bg-accent/20 text-accent border border-accent/30' : 'text-white/50 hover:text-white'}`}>{t === 'reports' ? <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Reports</span> : t}</button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Income by Category</h4>
              <div className="space-y-2">
                {byCategory(allIncomes).map(([cat, amt]) => {
                  const pct = totalIncome > 0 ? ((amt / totalIncome) * 100).toFixed(1) : '0'
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs"><span className="text-white/80">{cat}</span><span className="text-emerald-400 font-mono">₹{amt.toLocaleString('en-IN')} ({pct}%)</span></div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-emerald-400/50 transition-all" style={{ width: `${pct}%` }} /></div>
                    </div>
                  )
                })}
                {allIncomes.length === 0 && <div className="text-xs text-white/30 py-4 text-center">No income recorded yet.</div>}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Expenses by Category</h4>
              <div className="space-y-2">
                {byCategory(allExpenses).map(([cat, amt]) => {
                  const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0'
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs"><span className="text-white/80">{cat}</span><span className="text-red-400 font-mono">₹{amt.toLocaleString('en-IN')} ({pct}%)</span></div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-red-400/50 transition-all" style={{ width: `${pct}%` }} /></div>
                    </div>
                  )
                })}
                {allExpenses.length === 0 && <div className="text-xs text-white/30 py-4 text-center">No expenses recorded yet.</div>}
              </div>
            </div>
          </div>
        ) : tab === 'reports' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-accent" />
                <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button onClick={handleExportReport} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer">
                <Download className="h-4 w-4" /> Export Report
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Monthly Income vs Expenses (₹)</h4>
              <div className="flex items-end gap-1.5 h-48 overflow-x-auto pb-2">
                {MONTHS.map(m => {
                  const inc = monthlyIncome[m] || 0
                  const exp = monthlyExpense[m] || 0
                  const incH = (inc / maxMonthly) * 100
                  const expH = (exp / maxMonthly) * 100
                  return (
                    <div key={m} className="flex-1 min-w-[32px] flex flex-col items-center gap-0.5">
                      <div className="w-full flex flex-col items-center justify-end h-40 gap-0.5">
                        <div className="w-4 rounded-t bg-emerald-400/60 transition-all" style={{ height: `${Math.max(incH, 0.5)}%` }} title={`${m} Income: ₹${inc.toLocaleString('en-IN')}`} />
                        <div className="w-4 rounded-t bg-red-400/60 transition-all" style={{ height: `${Math.max(expH, 0.5)}%` }} title={`${m} Expenses: ₹${exp.toLocaleString('en-IN')}`} />
                      </div>
                      <span className="text-[9px] text-white/30 font-mono">{m}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-white/40">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/60" /> Income</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400/60" /> Expenses</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Year Income</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">₹{currentYearIncome.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Year Expenses</div>
                <div className="text-lg font-bold text-red-400 mt-1">₹{currentYearExpense.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Year Net</div>
                <div className={`text-lg font-bold mt-1 ${currentYearIncome - currentYearExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentYearIncome - currentYearExpense >= 0 ? '+' : ''}₹{(currentYearIncome - currentYearExpense).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/10">
                  <th className="text-left py-2 pr-4">Month</th><th className="text-right pr-4">Income</th><th className="text-right pr-4">Expenses</th><th className="text-right">Net</th>
                </tr></thead>
                <tbody>
                  {MONTHS.map(m => {
                    const inc = monthlyIncome[m] || 0
                    const exp = monthlyExpense[m] || 0
                    const net = inc - exp
                    return (
                      <tr key={m} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 pr-4 text-white/70">{m}</td>
                        <td className="py-2 pr-4 text-right text-emerald-400 font-mono">₹{inc.toLocaleString('en-IN')}</td>
                        <td className="py-2 pr-4 text-right text-red-400 font-mono">₹{exp.toLocaleString('en-IN')}</td>
                        <td className={`py-2 text-right font-mono ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{net >= 0 ? '+' : ''}₹{net.toLocaleString('en-IN')}</td>
                      </tr>
                    )
                  })}
                  <tr className="font-bold border-t border-white/20">
                    <td className="py-2 pr-4 text-white">Total</td>
                    <td className="py-2 pr-4 text-right text-emerald-400">₹{currentYearIncome.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-4 text-right text-red-400">₹{currentYearExpense.toLocaleString('en-IN')}</td>
                    <td className={`py-2 text-right ${currentYearIncome - currentYearExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{(currentYearIncome - currentYearExpense).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-accent/50" />
            </div>
            <div className="space-y-2">
              {filtered.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className={`p-1.5 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">{t.description || t.category}</div>
                    <div className="text-[10px] text-white/40">{t.category} • {t.date} {t.clientName ? `• ${t.clientName}` : ''}</div>
                  </div>
                  <div className={`text-xs font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{(t.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <button onClick={() => deleteItem(t.id, t.type === 'income' ? 'incomes' : 'expenses')} className="p-1.5 text-red-400/60 hover:text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-center py-8 text-white/30 text-xs">No transactions found.</div>}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading capitalize">Add {modalType}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Amount (₹) *</label><input required type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Category *</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white">
                    <option value="">Select...</option>
                    {(modalType === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-white/60 block mb-1">Description</label><input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div><label className="text-white/60 block mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white">
                    <option value="">Select...</option><option>Bank Transfer</option><option>UPI</option><option>Credit Card</option><option>Cash</option><option>Cheque</option>
                  </select>
                </div>
              </div>
              <div><label className="text-white/60 block mb-1">Client / Vendor</label><input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-white/60 block mb-1">Reference / Invoice #</label><input value={reference} onChange={e => setReference(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" /></div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="accent-accent" />
                  <label className="text-white/60 text-xs">Recurring</label>
                  {recurring && <select value={recurringInterval} onChange={e => setRecurringInterval(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-[10px]"><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select>}
                </div>
              </div>
              <div><label className="text-white/60 block mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold">Add {modalType}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
