import { useState, useEffect } from 'react'
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart, X, Search, Trash2 } from 'lucide-react'
import { getAdminStore, syncFromCloud, saveAdminStore, formatIST, logAuditEvent } from '../adminStore'

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

const uid = () => `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function Finance() {
  const [store, setStore] = useState(getAdminStore())
  const [tab, setTab] = useState<'overview' | 'income' | 'expense'>('overview')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'income' | 'expense'>('income')

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
    logAuditEvent('system', `${txn.type === 'income' ? 'Income' : 'Expense'} Added`, `${txn.description}: ${txn.amount}`)
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

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><DollarSign className="h-5 w-5 text-accent" /> Finance</h2>
          <p className="text-xs text-white/50">Track income, expenses, profit & financial reports</p>
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
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          {(['overview', 'income', 'expense'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize ${tab === t ? 'bg-accent/20 text-accent border border-accent/30' : 'text-white/50 hover:text-white'}`}>{t}</button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Income by Category</h4>
              <div className="space-y-2">
                {byCategory(allIncomes).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                    <span className="text-white/80">{cat}</span>
                    <span className="text-emerald-400 font-mono">₹{amt.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {allIncomes.length === 0 && <div className="text-xs text-white/30 py-4 text-center">No income recorded yet.</div>}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Expenses by Category</h4>
              <div className="space-y-2">
                {byCategory(allExpenses).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                    <span className="text-white/80">{cat}</span>
                    <span className="text-red-400 font-mono">₹{amt.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {allExpenses.length === 0 && <div className="text-xs text-white/30 py-4 text-center">No expenses recorded yet.</div>}
              </div>
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
