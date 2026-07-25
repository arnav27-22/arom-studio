import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Bot, MessageSquare, Users, Clock, Search, Printer, FileText, Trash2, ExternalLink, X, User } from 'lucide-react'
import { getAiConversations, loadAiConversationsFromServer, deleteAiConversation, type AiConversation } from '../../lib/aiStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function AIConversations() {
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConv, setSelectedConv] = useState<AiConversation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const reload = () => {
    setConversations(getAiConversations())
  }

  useEffect(() => {
    loadAiConversationsFromServer().then(reload)
    const timer = setInterval(() => {
      loadAiConversationsFromServer().then(reload)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Delete this AI conversation?')) {
      deleteAiConversation(id)
      reload()
      if (selectedConv?.id === id) setModalOpen(false)
    }
  }

  const handleExportPdf = (conv: AiConversation) => {
    const headers = ['#', 'Sender', 'Time Stamp', 'Message Content']
    const rows = conv.messages.map((m, idx) => [
      idx + 1,
      m.sender.toUpperCase(),
      new Date(m.timestamp).toLocaleTimeString(),
      m.text.slice(0, 200),
    ])

    exportSectionReportPDF(
      `AI Conversation - ${conv.title}`,
      `Visitor ID: ${conv.visitorId} | Device: ${conv.device} (${conv.browser})`,
      headers,
      rows,
      `AI_Transcript_${conv.visitorId}`
    )
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.visitorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.messages.some((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Metrics
  const now = Date.now()
  const todayCount = conversations.filter((c) => now - new Date(c.lastActiveAt).getTime() < 86400000).length
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0)
  const avgMessages = conversations.length ? (totalMessages / conversations.length).toFixed(1) : '0'

  const columns = [
    {
      key: 'title',
      label: 'Conversation Title',
      render: (_: string, row: AiConversation) => (
        <div>
          <p className="text-white font-medium hover:text-accent cursor-pointer transition-colors" onClick={() => { setSelectedConv(row); setModalOpen(true); }}>
            {row.title}
          </p>
          <p className="text-white/40 text-[10px] font-mono mt-0.5">{row.id} • {row.visitorId}</p>
        </div>
      ),
    },
    {
      key: 'messages',
      label: 'Messages',
      render: (_: any, row: AiConversation) => (
        <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
          {row.messages.length} msgs
        </span>
      ),
    },
    {
      key: 'device',
      label: 'Device / Browser',
      render: (_: any, row: AiConversation) => (
        <div className="text-xs text-white/80">
          <p className="font-medium text-white">{row.device}</p>
          <p className="text-[10px] text-white/40">{row.browser}</p>
        </div>
      ),
    },
    {
      key: 'lastActiveAt',
      label: 'Last Active',
      render: (v: string) => (
        <span className="text-xs text-white/70">{new Date(v).toLocaleString()}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: AiConversation) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedConv(row); setModalOpen(true); }}
            className="p-1.5 text-accent hover:text-white bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-colors cursor-pointer"
            title="Inspect ChatGPT-style Chat"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleExportPdf(row)}
            className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-colors cursor-pointer"
            title="Export Conversation PDF"
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
            title="Delete Conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" /> AROM AI Conversations &amp; Transcripts
          </h2>
          <p className="text-xs text-white/50">Live analytics and ChatGPT-style chat transcripts recorded by AROM AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total AI Chats" value={conversations.length} icon={<Bot className="h-4 w-4 text-accent" />} />
        <StatCard label="Today's Chats" value={todayCount} icon={<MessageSquare className="h-4 w-4 text-accent" />} />
        <StatCard label="Avg Response Time" value="0.4s" icon={<Clock className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Avg Msgs / Chat" value={avgMessages} icon={<Users className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">
            All AI Chat Transcripts ({filteredConversations.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat transcript..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 font-body"
            />
          </div>
        </div>

        {filteredConversations.length > 0 ? (
          <DataTable columns={columns} data={filteredConversations} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No AI conversations recorded yet. Visitors using AROM AI on your website will appear here in real-time.
          </div>
        )}
      </div>

      {/* ChatGPT-Style Full Chat View Modal */}
      {modalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="glass rounded-[28px] p-6 md:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/15 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-white font-bold">{selectedConv.title}</h3>
                  <p className="text-xs text-white/50 font-mono">
                    ID: {selectedConv.id} • Visitor: {selectedConv.visitorId} • Device: {selectedConv.device} ({selectedConv.browser})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPdf(selectedConv)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <button onClick={() => setModalOpen(false)} className="p-1.5 text-white/50 hover:text-white rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Body - Left User / Right AROM AI */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
              {selectedConv.messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-[20px] p-4 shadow-md ${
                      m.sender === 'user'
                        ? 'bg-accent/20 border border-accent/30 text-white rounded-br-none'
                        : 'glass border border-white/10 text-white/90 rounded-bl-none'
                    }`}
                  >
                    <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    <span className="text-[9px] text-white/30 font-mono block text-right mt-1.5">
                      {new Date(m.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-white/80" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0 text-xs text-white/40 font-mono">
              <span>Total Messages: {selectedConv.messages.length}</span>
              <button
                onClick={() => handleDelete(selectedConv.id)}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
