import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Brain, Plus, Edit, Trash2, Save, X, BookOpen, Key, RefreshCw, Layers } from 'lucide-react'
import { getAiKnowledge, saveAiKnowledge } from '../../lib/aiStore'
import { INITIAL_AI_KNOWLEDGE } from '../../lib/aiEngine'
import type { AiKnowledgeItem } from '../../types/ai'

export function AIKnowledge() {
  const [items, setItems] = useState<AiKnowledgeItem[]>(getAiKnowledge())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AiKnowledgeItem | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('Company')
  const [question, setQuestion] = useState('')
  const [alternateQuestionsStr, setAlternateQuestionsStr] = useState('')
  const [keywordsStr, setKeywordsStr] = useState('')
  const [detailedAnswer, setDetailedAnswer] = useState('')
  const [status, setStatus] = useState<'Active' | 'Archived' | 'Draft'>('Active')

  const reload = () => {
    setItems(getAiKnowledge())
  }

  useEffect(() => {
    reload()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setTitle('')
    setCategory('Company')
    setQuestion('')
    setAlternateQuestionsStr('')
    setKeywordsStr('')
    setDetailedAnswer('')
    setStatus('Active')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: AiKnowledgeItem) => {
    setEditingItem(item)
    setTitle(item.title || item.question)
    setCategory(item.category || 'Company')
    setQuestion(item.question)
    setAlternateQuestionsStr(Array.isArray(item.alternateQuestions) ? item.alternateQuestions.join(', ') : '')
    setKeywordsStr(Array.isArray(item.keywords) ? item.keywords.join(', ') : '')
    setDetailedAnswer(item.detailedAnswer || (item as any).answer || '')
    setStatus(item.status || 'Active')
    setModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !detailedAnswer.trim()) return

    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    const alternateQuestions = alternateQuestionsStr
      .split(',')
      .map((q) => q.trim())
      .filter(Boolean)

    const newItem: AiKnowledgeItem = {
      id: editingItem ? editingItem.id : 'k_' + Math.random().toString(36).slice(2, 9),
      category,
      title: title.trim() || question.trim(),
      question: question.trim(),
      alternateQuestions: alternateQuestions.length ? alternateQuestions : undefined,
      keywords: keywords.length ? keywords : [category.toLowerCase()],
      detailedAnswer: detailedAnswer.trim(),
      shortAnswer: detailedAnswer.slice(0, 140) + '...',
      status,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Admin',
      source: 'AROM STUDIO Knowledge Engine',
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
    if (confirm('Delete this AI knowledge record?')) {
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
      label: 'Title & Primary Question',
      render: (_: string, row: AiKnowledgeItem) => (
        <div>
          <p className="text-white font-medium hover:text-accent transition-colors line-clamp-1">{row.title || row.question}</p>
          <p className="text-white/40 text-[10px] font-mono mt-0.5">Keywords: {Array.isArray(row.keywords) ? row.keywords.join(', ') : ''}</p>
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
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${v === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
          {v || 'Active'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (v: string) => (
        <span className="text-xs text-white/70">{v ? new Date(v).toLocaleDateString() : 'System'}</span>
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
            title="Edit Knowledge Item"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
            title="Delete Item"
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
            <Brain className="h-5 w-5 text-accent" /> AROM AI Unlimited Knowledge Engine (v1.0)
          </h2>
          <p className="text-xs text-white/50">Manage scalable public knowledge items, semantic indexing, and categories for AROM AI</p>
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
        <StatCard label="Total Knowledge Items" value={items.length} icon={<Brain className="h-4 w-4 text-accent" />} />
        <StatCard label="Active Public Categories" value={[...new Set(items.map((i) => i.category))].length} icon={<BookOpen className="h-4 w-4 text-accent" />} />
        <StatCard label="Public Access Security" value="Strict Active" icon={<Key className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Semantic Engine" value="v1.0 Unlimited" icon={<Layers className="h-4 w-4 text-accent" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Indexed Public Knowledge Base ({items.length})
        </h3>
        {items.length > 0 ? (
          <DataTable columns={columns} data={items} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No public knowledge items indexed.
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
                  {editingItem ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 text-white/50 hover:text-white rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-6 space-y-4 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/60 font-body mb-1 block">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Services, Pricing, FAQs"
                    className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-body mb-1 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body bg-black"
                  >
                    <option value="Active">Active (Public)</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60 font-body mb-1 block">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={keywordsStr}
                    onChange={(e) => setKeywordsStr(e.target.value)}
                    placeholder="price, cost, budget"
                    className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 font-body mb-1 block">Title / Topic Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Professional Website Tier Features"
                  className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 font-body mb-1 block">Primary Question *</label>
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
                <label className="text-xs text-white/60 font-body mb-1 block">Alternate Questions (comma separated)</label>
                <input
                  type="text"
                  value={alternateQuestionsStr}
                  onChange={(e) => setAlternateQuestionsStr(e.target.value)}
                  placeholder="e.g. Tell me about professional plan, What does tier 2 cost?"
                  className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 font-body mb-1 block">Detailed Answer (Markdown supported) *</label>
                <textarea
                  rows={6}
                  required
                  value={detailedAnswer}
                  onChange={(e) => setDetailedAnswer(e.target.value)}
                  placeholder="Write the full response content..."
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
                  <Save className="h-4 w-4" /> Save Knowledge Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
