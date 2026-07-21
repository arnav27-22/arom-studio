import { motion } from 'framer-motion'
import { CreditCard, DollarSign, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/cn'

const summary = {
  total: '$380',
  paid: '$0',
  remaining: '$380',
  nextPayment: '$190',
  nextDue: 'Upon Design Approval',
}

const history = [
  { id: 1, label: 'Initial Deposit (50%)', amount: '$190', status: 'pending', date: 'Upon signing', method: 'Stripe' },
  { id: 2, label: 'Final Payment (50%)', amount: '$190', status: 'upcoming', date: 'Upon completion', method: 'Stripe' },
]

const paymentMethods = [
  { name: 'Stripe', desc: 'Credit/Debit Card', icon: CreditCard, color: 'from-blue-500/20 to-indigo-500/20' },
  { name: 'PayPal', desc: 'PayPal Account', icon: DollarSign, color: 'from-sky-500/20 to-blue-500/20' },
  { name: 'Wise', desc: 'International Transfer', icon: ArrowUpRight, color: 'from-green-500/20 to-emerald-500/20' },
  { name: 'Bank Transfer', desc: 'Direct Bank Payment', icon: CreditCard, color: 'from-violet-500/20 to-purple-500/20' },
]

export default function Payments() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Payments</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Manage your project payments.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: summary.total, icon: DollarSign, color: 'from-accent/20 to-blue-500/20' },
          { label: 'Paid', value: summary.paid, icon: CheckCircle2, color: 'from-green-500/20 to-emerald-500/20' },
          { label: 'Remaining', value: summary.remaining, icon: Clock, color: 'from-amber-500/20 to-orange-500/20' },
          { label: 'Next Payment', value: summary.nextPayment, icon: CreditCard, color: 'from-purple-500/20 to-pink-500/20' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-[20px] p-4 relative overflow-hidden"
            >
              <div className={cn('absolute inset-0 opacity-30 bg-gradient-to-br rounded-[20px]', card.color)} />
              <div className="relative z-10">
                <Icon className="h-5 w-5 text-accent mb-2" />
                <p className="text-[10px] text-white/40 font-body uppercase tracking-wider">{card.label}</p>
                <p className="font-heading text-2xl text-white">{card.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Payment methods */}
      <h3 className="font-heading text-xl text-white mb-4">Payment Methods</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {paymentMethods.map((method, i) => {
          const Icon = method.icon
          return (
            <motion.button
              key={method.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="glass rounded-[20px] p-4 text-left hover:border-accent/30 transition-all group"
            >
              <div className={cn('w-10 h-10 rounded-[10px] bg-gradient-to-br flex items-center justify-center mb-3', method.color)}>
                <Icon className="h-5 w-5 text-white/80" />
              </div>
              <p className="font-heading text-sm text-white group-hover:text-accent transition-colors">{method.name}</p>
              <p className="text-[10px] text-white/40 font-body">{method.desc}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Bank transfer details */}
      <div className="glass rounded-[24px] p-6 mb-10">
        <h3 className="font-heading text-lg text-white mb-4">Bank Transfer Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-body">
          <div><span className="text-white/40">Bank Name:</span> <span className="text-white/80">HDFC Bank</span></div>
          <div><span className="text-white/40">Account Name:</span> <span className="text-white/80">AROM Studio</span></div>
          <div><span className="text-white/40">Account Number:</span> <span className="text-white/80">XXXX XXXX XXXX</span></div>
          <div><span className="text-white/40">IFSC Code:</span> <span className="text-white/80">HDFC000XXXX</span></div>
        </div>
      </div>

      {/* Payment history */}
      <h3 className="font-heading text-xl text-white mb-4">Payment History</h3>
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/50 font-medium text-xs">Description</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium text-xs">Amount</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium text-xs">Status</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium text-xs">Due</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-white/80">{item.label}</td>
                  <td className="py-3 px-4 text-white/80">{item.amount}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      item.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-white/10 text-white/50',
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/50 text-xs">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
