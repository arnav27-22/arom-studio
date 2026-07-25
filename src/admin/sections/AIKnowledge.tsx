import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Brain, Plus, Edit, Trash2, Save, X, BookOpen, Key, RefreshCw } from 'lucide-react'
import { getAiKnowledge, saveAiKnowledge } from '../../lib/aiStore'
import { INITIAL_AI_KNOWLEDGE, type AiKnowledgeItem } from '../../lib/aiEngine'

export function AIKnowledge() {
  const [items, setItems] = useState<AiKnowledgeItem[]>(getAiKnowledge())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AiKnowledgeItem | null>(null)

  // Form State
  const [category, setCategory] = useState<AiKnowledgeItem['category']>('company')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [keywordsStr, setKeywordsStr] = useState('')

  const reload = () => {
    setItems(getAiKnowledge())
  }

  useEffect(() => {
    reload()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setCategory('company')
    setQuestion('')
    setAnswer('')
    setKeywordsStr('')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: AiKnowledgeItem) => {
    setEditingItem(item)
    setCategory(item.category)
    setQuestion(item.question)
    setAnswer(item.answer)
    setKeywordsStr(item.keywords.join(', '))
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    const newItem: AiKnowledgeItem = {
      id: editingItem ? editingItem.id : 'k_' + Math.random().toString(36).slice(2, 9),
      category,
      question: question.trim(),
      answer: answer.trim(),
      keywords: keywords.length ? keywords : [category],
      updatedAt: new Date().toISOString(),
    }

    let updatedList = [...items]
    if (editingItem) {
      const idx = updatedList.findIndex((i) => i.id === editingItem.id)
      if (idx !== -1) updatedList[idx] = newItem
    } else {
      updatedList.unshift(newItem)
    }

    saveAiKnowledge(updatedList)
    reload()
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this AI knowledge entry?')) {
      const updated = items.filter((i) => i.id !== id)
      saveAiKnowledge(updated)
      reload()
    }
  }

  const handleResetDefaults = () => {
    if (confirm('Reset AI knowledge base to system defaults?')) {
      saveAiKnowledge(INITIAL_AI_KNOWLEDGE)
      reload()
    }
  }

  const columns = [
    {
      key: 'question',
      label: 'Question / Topic',
      render: (_: string, row: AiKnowledgeItem) => (
        <div>
          <p className="text-white font-medium hover:text-accent transition-colors line-clamp-1">{row.question}</p>
          <p className="text-white/40 text-[10px] font-mono mt-0.5">Keywords: {row.keywords.join(', ')}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v: string) => (
        <span className="text-accent font-medium px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-xs uppercase tracking-wider">
          {v}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (v: string) => (
        <span className="text-xs text-white/70">{new Date(v).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: AiKnowledgeItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
            title="Edit Knowledge Rule"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
            title="Delete Rule"
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
            <Brain className="h-5 w-5 text-accent" /> AROM AI Knowledge Base &amp; System Rules
          </h2>
          <p className="text-xs text-white/50">Manage custom Q&amp;A rules, service guidelines, and system knowledge for AROM AI</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Knowledge Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Knowledge Rules" value={items.length} icon={<Brain className="h-4 w-4 text-accent" />} />
        <StatCard label="Categories" value={[...new Set(items.map((i) => i.category))].length} icon={<BookOpen className="h-4 w-4 text-accent" />} />
        <StatCard label="Out-of-Scope Protection" value="Active" icon={<Key className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Knowledge Version" value="v1.4 Live" icon={<Brain className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Configured AI Knowledge Items ({items.length})
        </h3>
        {items.length > 0 ? (
          <DataTable columns={columns} data={items} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No custom knowledge rules configured yet.
          </div>
        )}
      </div>

      {/* Add / Edit Knowledge Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="glass rounded-[28px] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col border border-white/15 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                <h3 className="font-heading text-lg text-white">
                  {editingItem ? 'Edit AI Knowledge Rule' : 'Add AI Knowledge Rule'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 text-white/50 hover:text-white rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-6 space-y-4 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 font-body mb-1 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body bg-black"
                  >
                    <option value="company">Company &amp; Founder</option>
                    <option value="services">Services &amp; Capabilities</option>
                    <option value="pricing">Pricing &amp; Packages</option>
                    <option value="process">Process &amp; Timeline</option>
                    <option value="portal">Client Portal</option>
                    <option value="admin">Admin Dashboard</option>
                    <option value="policies">Policies &amp; Deposit</option>
                    <option value="faq">Tech Stack &amp; FAQ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60 font-body mb-1 block">Trigger Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={keywordsStr}
                    onChange={(e) => setKeywordsStr(e.target.value)}
                    placeholder="e.g. price, cost, budget, rate"
                    className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 font-body mb-1 block">Question / Intent Topic *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What is included in the Professional Website Tier?"
                  className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 font-body mb-1 block">Structured Answer (Markdown supported: ###, -, **bold**) *</label>
                <textarea
                  rows={8}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write the exact response content..."
                  className="w-full bg-white/5 border border-white/10 rounded-[16px] p-4 text-xs font-mono text-white/90 focus:outline-none focus:border-accent/40 leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
