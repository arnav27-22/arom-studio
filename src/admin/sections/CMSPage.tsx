import { useState, useEffect } from 'react'
import { FileText, Save, Loader2, Globe, Plus, X } from 'lucide-react'

const CMS_IDS = [
  'homepage', 'hero', 'about', 'services', 'pricing', 'portfolio',
  'faq', 'testimonials', 'footer', 'navbar', 'contact',
  'privacy-policy', 'terms', 'cookies', 'seo', 'social-links',
]

const LABELS: Record<string, string> = {
  homepage: 'Homepage', hero: 'Hero', about: 'About Us',
  services: 'Services', pricing: 'Pricing', portfolio: 'Portfolio',
  faq: 'FAQ', testimonials: 'Testimonials', footer: 'Footer',
  navbar: 'Navbar', contact: 'Contact', 'privacy-policy': 'Privacy Policy',
  terms: 'Terms', cookies: 'Cookies', seo: 'SEO', 'social-links': 'Social Links',
}

interface CmsEntry {
  id: string
  title: string
  content: Record<string, any>
  published: boolean
  updated_at?: string
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
    } catch { }
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
    } catch { }
    setSaving(false)
  }

  const content = activeEntry.content || {}

  const setField = (key: string, value: any) => updateContent(key, value)

  const addArrayItem = (key: string) => {
    const arr = content[key] || []
    setField(key, [...arr, ''])
  }

  const removeArrayItem = (key: string, idx: number) => {
    setField(key, (content[key] || []).filter((_: any, i: number) => i !== idx))
  }

  const addSectionItem = (key: string) => {
    const arr = content[key] || []
    setField(key, [...arr, { title: '', subtitle: '', body: '' }])
  }

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
            Edit all website content — every section is editable without coding
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

      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto flex-wrap">
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

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Editing: {LABELS[activeId] || activeId}
        </h3>

        <div className="space-y-6">
          {/* Text Fields */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Text Fields</h4>
            {['headline', 'subheadline', 'title', 'subtitle', 'tagline', 'cta', 'button_text'].filter(k => k in content || true).map(key => (
              <div key={key}>
                <label className="text-[10px] text-white/40 block mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                <input
                  value={content[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder={key.replace(/_/g, ' ')}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <input
                id="new-field-key"
                placeholder="New field name"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget
                    const key = input.value.trim().toLowerCase().replace(/\s+/g, '_')
                    if (key && !(key in content)) setField(key, '')
                    input.value = ''
                  }
                }}
              />
            </div>
          </div>

          {/* Body / Textarea */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Body Content</h4>
            <textarea
              value={content.body || ''}
              onChange={(e) => setField('body', e.target.value)}
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-body resize-y"
              placeholder="Main body content (supports basic HTML)"
            />
          </div>

          {/* Rich Text Areas */}
          {['description', 'intro', 'about_text', 'footer_text', 'privacy_text', 'terms_text'].filter(k => k in content || true).map(key => (
            <div key={key} className="space-y-3">
              <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">{key.replace(/_/g, ' ')}</h4>
              <textarea
                value={content[key] || ''}
                onChange={(e) => setField(key, e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-body resize-y"
              />
            </div>
          ))}

          {/* Lists */}
          {['features', 'highlights', 'services_list', 'steps', 'benefits', 'faq_items', 'keywords', 'social_links'].filter(k => k in content || true).map(key => (
            <div key={key} className="space-y-3">
              <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">{key.replace(/_/g, ' ')}</h4>
              <div className="space-y-2">
                {Array.isArray(content[key]) ? content[key].map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={typeof item === 'string' ? item : item.title || ''}
                      onChange={(e) => {
                        const arr = [...content[key]]
                        arr[idx] = typeof item === 'string' ? e.target.value : { ...item, title: e.target.value }
                        setField(key, arr)
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
                      placeholder="Item"
                    />
                    <button onClick={() => removeArrayItem(key, idx)} className="text-red-400 hover:text-red-300 text-xs p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )) : null}
                <button onClick={() => addArrayItem(key)} className="text-xs text-accent hover:text-accent/80 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Item
                </button>
              </div>
            </div>
          ))}

          {/* Sections Array */}
          {['sections', 'cards', 'team', 'pricing_plans', 'portfolio_items'].filter(k => k in content || true).map(key => (
            <div key={key} className="space-y-3">
              <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">{key.replace(/_/g, ' ')}</h4>
              <div className="space-y-3">
                {Array.isArray(content[key]) ? content[key].map((section: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Item {idx + 1}</span>
                      <button onClick={() => removeArrayItem(key, idx)} className="text-red-400 hover:text-red-300 text-xs p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={section.title || ''}
                        onChange={(e) => {
                          const arr = [...content[key]]
                          arr[idx] = { ...arr[idx], title: e.target.value }
                          setField(key, arr)
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
                        placeholder="Title"
                      />
                      <input
                        value={section.subtitle || ''}
                        onChange={(e) => {
                          const arr = [...content[key]]
                          arr[idx] = { ...arr[idx], subtitle: e.target.value }
                          setField(key, arr)
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
                        placeholder="Subtitle"
                      />
                    </div>
                    <textarea
                      value={section.body || section.description || ''}
                      onChange={(e) => {
                        const arr = [...content[key]]
                        arr[idx] = { ...arr[idx], body: e.target.value, description: e.target.value }
                        setField(key, arr)
                      }}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white resize-none"
                      placeholder="Body text"
                    />
                  </div>
                )) : null}
                <button onClick={() => addSectionItem(key)} className="text-xs text-accent hover:text-accent/80 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add {key.replace(/_/g, ' ')}
                </button>
              </div>
            </div>
          ))}

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
                } catch { }
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
