import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Brain, User, Search, Database, Globe, Wallet, FileText } from 'lucide-react'
import { getAiConversations, loadAiConversationsFromServer, type AiConversation } from '../../lib/aiStore'

export function AIMemory() {
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConv, setSelectedConv] = useState<AiConversation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const reload = () => {
    setConversations(getAiConversations())
  }

  useEffect(() => {
    loadAiConversationsFromServer().then(reload)
  }, [])

  const withMemory = conversations.filter(c => c.context?.userName)
  const withProject = conversations.filter(c => c.context?.projectType)
  const withBudget = conversations.filter(c => c.context?.budget)

  const filtered = conversations.filter(c => {
    const ctx = c.context
    const term = searchTerm.toLowerCase()
    if (!ctx) return false
    return (
      (ctx.userName || '').toLowerCase().includes(term) ||
      (ctx.businessName || '').toLowerCase().includes(term) ||
      (ctx.projectType || '').toLowerCase().includes(term) ||
      (ctx.preferredPackage || '').toLowerCase().includes(term) ||
      (ctx.conversationSummary || '').toLowerCase().includes(term) ||
      ctx.discussedTopics.some(t => t.toLowerCase().includes(term))
    )
  })

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, row: AiConversation) => {
        const ctx = row.context
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-white font-medium">{ctx?.userName || 'Anonymous'}</p>
              {ctx?.businessName && <p className="text-[10px] text-white/40">{ctx.businessName}</p>}
            </div>
          </div>
        )
      },
    },
    {
      key: 'project',
      label: 'Project',
      render: (_: any, row: AiConversation) => {
        const ctx = row.context
        return (
          <div className="text-xs">
            {ctx?.projectType ? (
              <span className="text-accent bg-accent/10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-accent/20">
                {ctx.projectType}
              </span>
            ) : <span className="text-white/30">—</span>}
          </div>
        )
      },
    },
    {
      key: 'package',
      label: 'Package',
      render: (_: any, row: AiConversation) => (
        <span className="text-xs text-white/80">{row.context?.preferredPackage || '—'}</span>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (_: any, row: AiConversation) => (
        <span className="text-xs text-white/80">{row.context?.budget || '—'}</span>
      ),
    },
    {
      key: 'timeline',
      label: 'Timeline',
      render: (_: any, row: AiConversation) => (
        <span className="text-xs text-white/80">{row.context?.timeline || '—'}</span>
      ),
    },
    {
      key: 'summary',
      label: 'Summary',
      render: (_: any, row: AiConversation) => (
        <p className="text-xs text-white/60 line-clamp-1 max-w-[200px]">
          {row.context?.conversationSummary || 'No summary'}
        </p>
      ),
    },
    {
      key: 'actions',
      label: 'View',
      render: (_: any, row: AiConversation) => (
        <button
          onClick={() => { setSelectedConv(row); setModalOpen(true) }}
          className="p-1.5 text-accent hover:text-white bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-colors cursor-pointer"
          title="View Full Memory"
        >
          <FileText className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-accent" /> AROM AI Memory Bank
        </h2>
        <p className="text-xs text-white/50">Stored user memories, preferences, and project context across conversations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Conversations with Memory" value={withMemory.length} icon={<Brain className="h-4 w-4 text-accent" />} />
        <StatCard label="Project Types Identified" value={withProject.length} icon={<Globe className="h-4 w-4 text-accent" />} />
        <StatCard label="Budgets Recorded" value={withBudget.length} icon={<Wallet className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Total Conversations" value={conversations.length} icon={<Database className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">
            Memory Records ({filtered.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, project, summary..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 font-body"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No memory records found.
          </div>
        )}
      </div>

      {modalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="glass rounded-[28px] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col border border-white/15 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                <h3 className="font-heading text-lg text-white">Memory Details</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-white/50 hover:text-white rounded-lg cursor-pointer">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-6 space-y-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">User Name</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.userName || 'Anonymous'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Language</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.language === 'mr' ? 'Marathi' : selectedConv.context?.language === 'hi' ? 'Hindi' : 'English'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Business Name</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.businessName || '—'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Project Type</p>
                  <p className="text-sm text-white font-medium capitalize">{selectedConv.context?.projectType || '—'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Preferred Package</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.preferredPackage || '—'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.budget || '—'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Timeline</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.timeline || '—'}</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm text-white font-medium">{selectedConv.context?.email || selectedConv.context?.phone || '—'}</p>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Discussed Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedConv.context?.discussedTopics || []).length > 0 ? selectedConv.context!.discussedTopics.map((t, i) => (
                    <span key={i} className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">{t}</span>
                  )) : <span className="text-xs text-white/30">No topics</span>}
                </div>
              </div>

              {selectedConv.context?.goals && selectedConv.context.goals.length > 0 && (
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Goals</p>
                  <p className="text-xs text-white/80">{selectedConv.context.goals.join(', ')}</p>
                </div>
              )}

              <div className="glass rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Conversation Summary</p>
                <p className="text-xs text-white/80">{selectedConv.context?.conversationSummary || 'No summary generated yet.'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedConv.context?.needsSEO && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Needs SEO</span>}
                {selectedConv.context?.needsMaintenance && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Needs Maintenance</span>}
                {selectedConv.context?.proposalRequested && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Proposal Requested</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
