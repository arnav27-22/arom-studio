interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, sub, icon, trend }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-400'

  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${trendColor}`}>{sub}</p>}
    </div>
  )
}
