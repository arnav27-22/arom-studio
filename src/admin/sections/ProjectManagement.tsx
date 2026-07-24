import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Briefcase, Search, Plus, CheckCircle2, Clock, Archive, Rocket, Users, X, Eye, Trash2, Download } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, type AdminProject } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function ProjectManagement() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDownloadProjectsPDF = () => {
    const projects = store.projects || []
    const headers = ['Project Title', 'Client Name', 'Status', 'Progress', 'Start Date', 'Due Date', 'Launch']
    const rows = projects.map((p) => [
      p.title,
      p.clientName,
      p.status,
      `${p.progress}%`,
      p.startDate,
      p.dueDate,
      p.launchStatus || 'Pending',
    ])
    exportSectionReportPDF('Project Management Audit Report', 'AROM Studio Agency Project Delivery Pipeline', headers, rows, 'Projects_Management_Report')
  }

  // Form State
  const [form, setForm] = useState({
    title: '',
    clientName: '',
    status: 'In Progress' as const,
    priority: 'High' as const,
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: '2026-08-30',
    progress: 25,
    team: 'Arnav (Lead Developer), Om (Lead Designer)',
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const projects = store.projects || []
  const clients = store.clients || []

  const handleDeleteProject = (id: string) => {
    const p = projects.find((x) => x.id === id)
    moveToRecycleBin('projects', id, p?.title, p?.clientName)
    setStore(getAdminStore())
    if (selectedProject?.id === id) setSelectedProject(null)
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalProjects = projects.length
  const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length
  const launchedProjects = projects.filter((p) => p.status === 'Launched' || p.launchStatus === 'Live').length
  const inReviewProjects = projects.filter((p) => p.status === 'In Review').length

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) return

    const newProj: AdminProject = {
      id: 'proj_' + Math.random().toString(36).slice(2, 9),
      title: form.title,
      clientId: 'cli_1',
      clientName: form.clientName || clients[0]?.companyName || 'Apex Innovations',
      status: form.status,
      progress: Number(form.progress) || 0,
      startDate: form.startDate,
      dueDate: form.dueDate,
      priority: form.priority,
      assignedTeam: form.team.split(',').map((t) => t.trim()),
      projectFiles: [
        { name: 'Initial_Brief.pdf', url: '#', uploadedAt: new Date().toISOString().slice(0, 10) },
      ],
      milestones: [
        { title: 'Project Kickoff & Discovery', completed: true, dueDate: form.startDate },
        { title: 'UI Design & Wireframing', completed: false, dueDate: form.dueDate },
      ],
      launchStatus: 'Pending',
      createdAt: new Date().toISOString(),
    }

    const updated = { ...store, projects: [newProj, ...store.projects] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  const handleArchiveProject = (id: string) => {
    const updatedProjects = store.projects.map((p) =>
      p.id === id ? { ...p, status: 'Archived' as const } : p
    )
    const updated = { ...store, projects: updatedProjects }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleToggleLaunch = (id: string) => {
    const updatedProjects = store.projects.map((p) => {
      if (p.id === id) {
        const nextLaunch = p.launchStatus === 'Live' ? 'Pending' : 'Live'
        const nextStatus = nextLaunch === 'Live' ? ('Launched' as const) : p.status
        return { ...p, launchStatus: nextLaunch as any, status: nextStatus }
      }
      return p
    })
    const updated = { ...store, projects: updatedProjects }
    saveAdminStore(updated)
    setStore(updated)
  }

  const columns = [
    {
      key: 'title',
      label: 'Project Title & Client',
      render: (v: string, row: AdminProject) => (
        <div>
          <div className="text-white font-bold text-xs">{v}</div>
          <div className="text-[11px] text-accent font-medium">{row.clientName}</div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Progress %',
      render: (v: number) => (
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-white/80">
            <span>Progress</span>
            <span>{v}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-accent rounded-full" style={{ width: `${v}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v: string) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          v === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          v === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {v} Priority
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Timeline',
      render: (v: string, row: AdminProject) => (
        <div className="text-xs text-white/70 font-mono">
          <div>Start: {row.startDate}</div>
          <div className="text-accent font-semibold">Due: {v}</div>
        </div>
      ),
    },
    {
      key: 'launchStatus',
      label: 'Launch Status',
      render: (v: string, row: AdminProject) => (
        <button
          onClick={() => handleToggleLaunch(row.id)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-all ${
            v === 'Live' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
            v === 'Staging' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
            'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <Rocket className="h-3 w-3" /> {v || 'Pending'}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'In Progress' ? 'bg-accent/20 border-accent/40 text-accent' :
          v === 'In Review' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
          v === 'Launched' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
          'bg-white/5 border-white/10 text-white/40'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminProject) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedProject(row)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer"
            title="View Milestones & Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleArchiveProject(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-white/60 transition-colors cursor-pointer"
            title="Archive Project"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteProject(row.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer"
            title="Delete Project"
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
            <Briefcase className="h-5 w-5 text-accent" /> Project Management
          </h2>
          <p className="text-xs text-white/50">Track build progress, team assignments, milestones, and live launch deployments</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadProjectsPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Projects PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create New Project
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={totalProjects} icon={<Briefcase className="h-4 w-4 text-accent" />} />
        <StatCard label="In Progress" value={inProgressProjects} icon={<Clock className="h-4 w-4 text-accent" />} />
        <StatCard label="In Client Review" value={inReviewProjects} icon={<Eye className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Live Deployed" value={launchedProjects} icon={<Rocket className="h-4 w-4 text-emerald-400" />} />
      </div>

      {/* Table & Filters */}
      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search project title or assigned client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto max-w-full">
            {['All', 'Planning', 'In Progress', 'In Review', 'Launched', 'Archived'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={filteredProjects} />
      </div>

      {/* Create Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Create New Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-medium">Project Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Next.js SaaS Web App"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Assigned Client</label>
                  <select
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.companyName}>
                        {c.companyName}
                      </option>
                    ))}
                    {!clients.length && <option value="Apex Innovations">Apex Innovations</option>}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Target Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Initial Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Assigned Team Members</label>
                <input
                  type="text"
                  placeholder="Arnav (Dev), Om (Design)"
                  value={form.team}
                  onChange={(e) => setForm({ ...form, team: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">{selectedProject.title}</h3>
                <p className="text-xs text-accent">Client: {selectedProject.clientName}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Project Milestones
              </h4>
              <div className="space-y-2">
                {selectedProject.milestones?.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <span className={`font-medium ${m.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {m.title}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Due: {m.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-accent" /> Assigned Team
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.assignedTeam?.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button onClick={() => setSelectedProject(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
