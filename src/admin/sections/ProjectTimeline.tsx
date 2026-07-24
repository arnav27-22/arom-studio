import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { GitCommit, Search, CheckCircle2, Clock, AlertTriangle, Layers, Trash2 } from 'lucide-react'
import { getAdminStore, moveToRecycleBin } from '../adminStore'

export function ProjectTimeline() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const handleDeleteTimeline = (id: string) => {
    const t = store.timelines.find((x) => x.id === id)
    moveToRecycleBin('timelines', id, t?.projectName || 'Project Timeline', t?.clientName)
    setStore(getAdminStore())
  }

  const timelines = store.timelines || []

  const filteredTimelines = timelines.filter((t) => {
    return (
      t.projectName.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.currentPhase.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-accent" /> Timeline Manager
          </h2>
          <p className="text-xs text-white/50">Visual milestone roadmaps, current active phases, upcoming deadlines & delayed tasks</p>
        </div>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Timelines" value={timelines.length} icon={<GitCommit className="h-4 w-4 text-accent" />} />
        <StatCard label="Phases In Progress" value={timelines.length} icon={<Layers className="h-4 w-4 text-purple-300" />} />
        <StatCard label="Completed Tasks" value={timelines.reduce((a, t) => a + (t.completedTasks?.length || 0), 0)} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Delayed Tasks" value={timelines.reduce((a, t) => a + (t.delayedTasks?.length || 0), 0)} icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Filter by project or current phase..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
        />
      </div>

      {/* Timeline Cards */}
      <div className="space-y-6">
        {filteredTimelines.map((t) => (
          <div key={t.id} className="glass rounded-[28px] p-6 border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">{t.projectName}</h3>
                <p className="text-xs text-accent">Client: {t.clientName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent font-semibold text-xs flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Phase: {t.currentPhase}
                </span>
                <span className="text-xs font-mono text-white/60">Est: {t.estimatedDelivery}</span>
                <button
                  onClick={() => handleDeleteTimeline(t.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
                  title="Delete Timeline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-white/80">
                <span>Overall Timeline Progress</span>
                <span className="text-accent font-bold">{t.timelineProgress}% Completed</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full" style={{ width: `${t.timelineProgress}%` }} />
              </div>
            </div>

            {/* Milestone Task Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Completed */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" /> Completed ({t.completedTasks?.length || 0})
                </h4>
                <ul className="space-y-1.5 text-xs text-white/80">
                  {t.completedTasks?.map((task, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upcoming */}
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 space-y-2">
                <h4 className="text-xs font-bold text-accent flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="h-4 w-4" /> Upcoming ({t.upcomingTasks?.length || 0})
                </h4>
                <ul className="space-y-1.5 text-xs text-white/80">
                  {t.upcomingTasks?.map((task, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delayed */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" /> Delayed ({t.delayedTasks?.length || 0})
                </h4>
                {t.delayedTasks?.length ? (
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {t.delayedTasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-white/40 italic">No delayed tasks for this milestone.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
