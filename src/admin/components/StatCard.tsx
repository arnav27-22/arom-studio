interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, sub, icon, trend }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'

  return (
    <div className="glass rounded-[--radius-card] p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{label}</span>
        {icon && <span className="text-text-secondary">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-text-primary tracking-tight">{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${trendColor}`}>{sub}</p>}
    </div>
  )
}
