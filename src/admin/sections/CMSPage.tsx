import { useState, useEffect } from 'react'
import { FileText, Save, Loader2, Globe } from 'lucide-react'

interface CmsEntry {
  id: string
  title: string
  content: Record<string, any>
  published: boolean
  updated_at?: string
}

const CMS_IDS = ['homepage', 'about', 'services', 'pricing', 'faq']

const LABELS: Record<string, string> = {
  homepage: 'Homepage',
  about: 'About Us',
  services: 'Services',
  pricing: 'Pricing',
  faq: 'FAQ',
}

export function CMSPage() {
  const [entries, setEntries] = useState<Record<string, CmsEntry>>({})
  const [activeId, setActiveId] = useState('homepage')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/cms', { credentials: 'include' })
      if (resp.ok) {
        const data = await resp.json()
        const map: Record<string, CmsEntry> = {}
        for (const item of data) {
          map[item.id] = item
        }
        for (const id of CMS_IDS) {
          if (!map[id]) {
            map[id] = { id, title: LABELS[id] || id, content: {}, published: false }
          }
        }
        setEntries(map)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const activeEntry = entries[activeId] || { id: activeId, title: LABELS[activeId] || activeId, content: {}, published: false }

  const updateContent = (key: string, value: any) => {
    setEntries(prev => ({
      ...prev,
      [activeId]: {
        ...prev[activeId],
        content: { ...(prev[activeId]?.content || {}), [key]: value },
      },
    }))
  }

  const togglePublished = () => {
    setEntries(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], published: !prev[activeId]?.published },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const entry = entries[activeId]
      await fetch(`/api/admin/cms/${activeId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: entry?.title || LABELS[activeId],
          content: entry?.content || {},
          published: entry?.published || false,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ }
    setSaving(false)
  }

  const content = activeEntry.content || {}

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> Content Management
          </h2>
          <p className="text-xs text-white/50">
            Edit static page content — homepage, about, services, pricing, FAQ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePublished}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeEntry.published
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            {activeEntry.published ? 'Published' : 'Draft'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-black font-semibold text-xs rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {CMS_IDS.map(id => (
          <button
            key={id}
            onClick={() => setActiveId(id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeId === id
                ? 'bg-accent/20 text-accent border border-accent/30 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {LABELS[id] || id}
            {entries[id]?.published && <span className="ml-1.5 text-emerald-400">&#x2022;</span>}
          </button>
        ))}
      </div>

      {/* Content editor */}
      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Editing: {LABELS[activeId] || activeId}
        </h3>

        <div className="space-y-4">
          {/* Hero Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Hero Section</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Headline</label>
                <input
                  value={content.headline || ''}
                  onChange={(e) => updateContent('headline', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Main headline"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Subheadline</label>
                <input
                  value={content.subheadline || ''}
                  onChange={(e) => updateContent('subheadline', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Subheadline"
                />
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Body Content</h4>
            <textarea
              value={content.body || ''}
              onChange={(e) => updateContent('body', e.target.value)}
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-body resize-y"
              placeholder="Main body content (supports basic HTML)"
            />
          </div>

          {/* Sections (cards, features, etc.) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Sections</h4>
            <div className="space-y-2">
              {Array.isArray(content.sections) ? content.sections.map((section: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      value={section.title || ''}
                      onChange={(e) => {
                        const newSections = [...(content.sections || [])]
                        newSections[idx] = { ...newSections[idx], title: e.target.value }
                        updateContent('sections', newSections)
                      }}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
                      placeholder="Section title"
                    />
                    <input
                      value={section.subtitle || ''}
                      onChange={(e) => {
                        const newSections = [...(content.sections || [])]
                        newSections[idx] = { ...newSections[idx], subtitle: e.target.value }
                        updateContent('sections', newSections)
                      }}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
                      placeholder="Subtitle"
                    />
                    <textarea
                      value={section.body || ''}
                      onChange={(e) => {
                        const newSections = [...(content.sections || [])]
                        newSections[idx] = { ...newSections[idx], body: e.target.value }
                        updateContent('sections', newSections)
                      }}
                      rows={2}
                      className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white resize-none"
                      placeholder="Body text"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newSections = (content.sections || []).filter((_: any, i: number) => i !== idx)
                      updateContent('sections', newSections)
                    }}
                    className="text-red-400 hover:text-red-300 text-xs p-1"
                  >
                    &times;
                  </button>
                </div>
              )) : null}
              <button
                onClick={() => {
                  const current = content.sections || []
                  updateContent('sections', [...current, { title: '', subtitle: '', body: '' }])
                }}
                className="text-xs text-accent hover:text-accent/80"
              >
                + Add Section
              </button>
            </div>
          </div>

          {/* Features (for homepage/services) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Features / Highlights</h4>
            <div className="space-y-2">
              {Array.isArray(content.features) ? content.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(content.features || [])]
                      newFeatures[idx] = e.target.value
                      updateContent('features', newFeatures)
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
                    placeholder="Feature item"
                  />
                  <button
                    onClick={() => {
                      updateContent('features', (content.features || []).filter((_: any, i: number) => i !== idx))
                    }}
                    className="text-red-400 hover:text-red-300 text-xs p-1"
                  >
                    &times;
                  </button>
                </div>
              )) : null}
              <button
                onClick={() => updateContent('features', [...(content.features || []), ''])}
                className="text-xs text-accent hover:text-accent/80"
              >
                + Add Feature
              </button>
            </div>
          </div>

          {/* Raw JSON editor */}
          <details className="mt-6">
            <summary className="text-[10px] text-white/30 cursor-pointer hover:text-white/50">Raw JSON</summary>
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setEntries(prev => ({
                    ...prev,
                    [activeId]: { ...prev[activeId], content: parsed },
                  }))
                } catch { /* invalid JSON */ }
              }}
              rows={10}
              className="w-full mt-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-white/60 resize-y"
            />
          </details>
        </div>
      </div>
    </div>
  )
}