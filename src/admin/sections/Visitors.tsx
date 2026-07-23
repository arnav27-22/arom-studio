import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Users, Monitor, Smartphone, Eye, ExternalLink, RefreshCw } from 'lucide-react'
import { getAdminStore, formatIST, recordAdminVisit } from '../adminStore'

export function Visitors() {
  const [store, setStore] = useState(getAdminStore())

  const reload = () => {
    const s = getAdminStore()
    setStore(s)
  }

  useEffect(() => {
    reload()
  }, [])

  const handleSimulateVisit = () => {
    const samplePages = ['/', '/services', '/pricing', '/contact', '/about', '/blog']
    const randomPage = samplePages[Math.floor(Math.random() * samplePages.length)]
    recordAdminVisit(randomPage, 'Direct Visit')
    reload()
  }

  const visitors = store.visitors || []
  const desktopCount = visitors.filter((v) => v.deviceType === 'desktop').length
  const mobileCount = visitors.filter((v) => v.deviceType === 'mobile' || v.deviceType === 'tablet').length
  const devTotal = Math.max(visitors.length, 1)

  const columns = [
    { key: 'createdAt', label: 'Time (IST)', render: (v: string) => formatIST(v) },
    { key: 'page', label: 'Page Route', render: (v: string) => <span className="text-accent font-medium">{v}</span> },
    { key: 'deviceType', label: 'Device', render: (v: string) => <span className="capitalize text-white/80">{v || 'desktop'}</span> },
    { key: 'browser', label: 'Browser', render: (v: string) => v || 'Chrome' },
    { key: 'os', label: 'OS', render: (v: string) => v || 'Windows' },
    { key: 'country', label: 'Country', render: (v: string) => v || 'India' },
    { key: 'referrer', label: 'Referrer', render: (v: string) => v ? v.slice(0, 30) : 'Direct' },
    { key: 'timeOnPage', label: 'Duration', render: (v: number) => `${v || 45}s` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
          <StatCard label="All Time Visits" value={visitors.length} icon={<Users className="h-4 w-4 text-accent" />} />
          <StatCard label="Live Tracked Sessions" value={visitors.length} icon={<Eye className="h-4 w-4 text-accent" />} />
          <StatCard label="Desktop Devices" value={desktopCount} icon={<Monitor className="h-4 w-4 text-accent" />} />
          <StatCard label="Mobile Devices" value={mobileCount} icon={<Smartphone className="h-4 w-4 text-accent" />} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleSimulateVisit} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Record Test Visit
          </button>
          <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-accent/20 border border-accent/30 hover:bg-accent/30 rounded-xl transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> GA4
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Device Distribution</h3>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/80">
                <span>Desktop Browsers</span>
                <span className="font-mono">{desktopCount} ({Math.round((desktopCount / devTotal) * 100)}%)</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-accent rounded-full" style={{ width: `${(desktopCount / devTotal) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/80">
                <span>Mobile &amp; Tablet Devices</span>
                <span className="font-mono">{mobileCount} ({Math.round((mobileCount / devTotal) * 100)}%)</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(mobileCount / devTotal) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10 flex flex-col justify-center">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Live Session Persistence</h3>
          <p className="text-xs text-white/60 leading-relaxed font-body">
            All user sessions and page views are continuously stored in local storage and synced. Visitor stats will never reset to 0 upon reload or login.
          </p>
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Recent Session Visits Log (IST)</h3>
        <DataTable columns={columns} data={visitors} />
      </div>
    </div>
  )
}
