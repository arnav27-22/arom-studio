import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { Bell, Mail, FileSpreadsheet, CreditCard, CheckSquare, Rocket, PackageCheck, ShieldAlert, Check, Search } from 'lucide-react'
import { getAdminStore, saveAdminStore, formatIST } from '../adminStore'

export function NotificationsCenter() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const notifications = store.notifications || []

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || n.type === typeFilter
    return matchesSearch && matchesType
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const totalCount = notifications.length

  const handleMarkAllRead = () => {
    const updatedNotifs = notifications.map((n) => ({ ...n, read: true }))
    const updated = { ...store, notifications: updatedNotifs }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleToggleRead = (id: string) => {
    const updatedNotifs = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    )
    const updated = { ...store, notifications: updatedNotifs }
    saveAdminStore(updated)
    setStore(updated)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <Mail className="h-4 w-4 text-purple-400" />
      case 'proposal':
        return <FileSpreadsheet className="h-4 w-4 text-accent" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-emerald-400" />
      case 'approval':
        return <CheckSquare className="h-4 w-4 text-accent" />
      case 'live':
        return <Rocket className="h-4 w-4 text-emerald-400" />
      case 'handover':
        return <PackageCheck className="h-4 w-4 text-accent" />
      default:
        return <ShieldAlert className="h-4 w-4 text-amber-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" /> Notifications Center
          </h2>
          <p className="text-xs text-white/50">Central event stream for inquiries, payments, design sign-offs, live deployments & system alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 text-accent" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Notifications" value={totalCount} icon={<Bell className="h-4 w-4 text-accent" />} />
        <StatCard label="Unread Alerts" value={unreadCount} icon={<Bell className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Real-time Stream" value="Active" icon={<Rocket className="h-4 w-4 text-emerald-400" />} />
      </div>

      {/* Search & Filter */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto max-w-full">
            {['All', 'inquiry', 'proposal', 'payment', 'approval', 'live', 'handover', 'alert'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === t ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Feed List */}
        <div className="space-y-3 pt-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleToggleRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  n.read
                    ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100'
                    : 'bg-accent/10 border-accent/30 shadow-lg shadow-accent/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-heading">{n.title}</h4>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed font-body">{n.message}</p>
                    <span className="text-[10px] font-mono text-white/40 block mt-1">
                      {formatIST(n.createdAt)}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                  n.read ? 'bg-white/5 border-white/10 text-white/40' : 'bg-accent/20 border-accent/40 text-accent'
                }`}>
                  {n.read ? 'Read' : 'New'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-white/40 text-xs font-body">
              No notifications matching current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
