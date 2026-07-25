import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { BookOpen, Plus, Edit, Trash2, ExternalLink, X, Save } from 'lucide-react'
import { getAdminBlogs, recordAdminBlog, deleteAdminBlog, syncFromCloud } from '../adminStore'
import type { BlogPost } from '../../data/blog'

export function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>(getAdminBlogs())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('Agency & Strategy')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [readTime, setReadTime] = useState('5 min read')
  const [authorName, setAuthorName] = useState('Arnav Pagare')
  const [authorRole, setAuthorRole] = useState('Founder & Lead Engineer')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  const reload = () => {
    setBlogs(getAdminBlogs())
  }

  useEffect(() => {
    reload()
    const timer = setInterval(() => {
      syncFromCloud().then(() => reload())
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const handleOpenCreate = () => {
    setEditingBlog(null)
    setTitle('')
    setSlug('')
    setCategory('Agency & Strategy')
    setDate(new Date().toISOString().split('T')[0])
    setReadTime('5 min read')
    setAuthorName('Arnav Pagare')
    setAuthorRole('Founder & Lead Engineer')
    setExcerpt('')
    setContent(`<h2>Introduction</h2>\n<p>Enter your blog introduction here...</p>\n\n<h2>Key Highlights</h2>\n<ul>\n  <li><strong>Point 1:</strong> Detailed insights on web development.</li>\n  <li><strong>Point 2:</strong> High performance & Core Web Vitals.</li>\n</ul>\n\n<h2>Conclusion</h2>\n<p>Final summary thoughts and next steps.</p>`)
    setActiveTab('editor')
    setModalOpen(true)
  }

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog)
    setTitle(blog.title)
    setSlug(blog.slug)
    setCategory(blog.category)
    setDate(blog.date)
    setReadTime(blog.readTime)
    setAuthorName(blog.author.name)
    setAuthorRole(blog.author.role)
    setExcerpt(blog.excerpt)
    setContent(blog.content)
    setActiveTab('editor')
    setModalOpen(true)
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingBlog) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generatedSlug)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return

    const newBlog: BlogPost = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      date: date || new Date().toISOString().split('T')[0],
      category: category.trim() || 'General',
      readTime: readTime.trim() || '5 min read',
      author: {
        name: authorName.trim() || 'Arnav Pagare',
        role: authorRole.trim() || 'Founder & Lead Engineer',
        avatar: '/favicon.svg',
        bio: 'Founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
      },
      content: content.trim(),
    }

    recordAdminBlog(newBlog)
    reload()
    setModalOpen(false)
  }

  const handleDelete = (slugToDelete: string) => {
    if (confirm('Are you sure you want to delete this blog post? It will be moved to the Recycle Bin.')) {
      deleteAdminBlog(slugToDelete)
      reload()
    }
  }

  const insertFormatting = (tag: string) => {
    if (tag === 'h2') setContent((prev) => prev + '\n<h2>Section Heading</h2>\n')
    else if (tag === 'h3') setContent((prev) => prev + '\n<h3>Sub-heading Title</h3>\n')
    else if (tag === 'p') setContent((prev) => prev + '\n<p>Write your detailed paragraph text here.</p>\n')
    else if (tag === 'ul') setContent((prev) => prev + '\n<ul>\n  <li><strong>Feature:</strong> Key details.</li>\n</ul>\n')
    else if (tag === 'table') setContent((prev) => prev + `\n<table style="width:100%; border-collapse:collapse; margin:20px 0; color:rgba(255,255,255,0.9);">\n  <thead>\n    <tr style="border-bottom:2px solid rgba(78,133,191,0.4); text-align:left;">\n      <th style="padding:12px; color:#4E85BF;">Feature</th>\n      <th style="padding:12px;">Legacy Approach</th>\n      <th style="padding:12px; color:#4E85BF;">AROM STUDIO</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">\n      <td style="padding:12px; font-weight:bold;">Performance</td>\n      <td style="padding:12px;">3-5s load time</td>\n      <td style="padding:12px; color:#4E85BF;">100/100 Core Web Vitals</td>\n    </tr>\n  </tbody>\n</table>\n`)
  }

  const columns = [
    {
      key: 'title',
      label: 'Blog Article Title',
      render: (_: string, row: BlogPost) => (
        <div>
          <p className="text-white font-medium hover:text-accent transition-colors line-clamp-1">{row.title}</p>
          <p className="text-white/40 text-[10px] font-mono mt-0.5">/blog/{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v: string) => (
        <span className="text-accent font-medium px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-xs">
          {v}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Published Date',
      render: (v: string, row: BlogPost) => (
        <div className="text-xs text-white/70">
          <p>{v}</p>
          <p className="text-[10px] text-white/40">{row.readTime}</p>
        </div>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      render: (_: any, row: BlogPost) => (
        <div className="text-xs text-white/80">
          <p className="font-medium text-white">{row.author.name}</p>
          <p className="text-[10px] text-white/40">{row.author.role}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: BlogPost) => (
        <div className="flex items-center gap-2">
          <a
            href={`/blog/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-accent hover:text-white bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-colors"
            title="View live blog post on website"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
            title="Edit blog article"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.slug)}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
            title="Delete blog post"
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
            <BookOpen className="h-5 w-5 text-accent" /> Blog Management &amp; CMS
          </h2>
          <p className="text-xs text-white/50">Upload, edit, and publish technical articles to your public website blog in real-time</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Upload New Blog
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Blog Articles" value={blogs.length} icon={<BookOpen className="h-4 w-4 text-accent" />} />
        <StatCard label="Categories" value={[...new Set(blogs.map((b) => b.category))].length} icon={<BookOpen className="h-4 w-4 text-accent" />} />
        <StatCard label="Latest Post Date" value={blogs[0]?.date || '—'} icon={<BookOpen className="h-4 w-4 text-accent" />} />
        <StatCard label="Live Blog Status" value="Active & Synced" icon={<BookOpen className="h-4 w-4 text-emerald-400" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Published Articles &amp; Insights</span>
          <span className="text-white/40 font-mono text-[10px]">{blogs.length} Posts</span>
        </h3>
        {blogs.length > 0 ? (
          <DataTable columns={columns} data={blogs} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No blog posts uploaded yet. Click "Upload New Blog" above to create your first article.
          </div>
        )}
      </div>

      {/* Upload/Edit Blog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="glass rounded-[28px] p-6 md:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/15 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <h3 className="font-heading text-lg text-white">
                  {editingBlog ? 'Edit Blog Article' : 'Upload New Blog Article'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${activeTab === 'editor' ? 'bg-accent text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${activeTab === 'preview' ? 'bg-accent text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                  >
                    Live Preview
                  </button>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1 text-white/50 hover:text-white rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-6 space-y-5 pr-2">
              {activeTab === 'editor' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">Blog Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Why AROM STUDIO is Redefining Web Design in 2026"
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. why-arom-studio-is-best-web-agency-2026"
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-mono text-xs text-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">Category</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Agency & Strategy"
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">Publish Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">Read Time</label>
                      <input
                        type="text"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                        placeholder="e.g. 6 min read"
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">Author Name</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Arnav Pagare"
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 font-body mb-1 block">Author Role</label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="Founder & Lead Engineer"
                        className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2 text-sm text-white focus:outline-none focus:border-accent/40 font-body"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 font-body mb-1 block">Excerpt (Short Summary)</label>
                    <textarea
                      rows={2}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief overview displayed on the blog catalog page card..."
                      className="w-full bg-white/5 border border-white/10 rounded-[14px] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-white/60 font-body">Article HTML / Text Content *</label>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-white/40">Quick Format:</span>
                        <button type="button" onClick={() => insertFormatting('h2')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-accent font-semibold">H2</button>
                        <button type="button" onClick={() => insertFormatting('h3')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-accent font-semibold">H3</button>
                        <button type="button" onClick={() => insertFormatting('p')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-white/80">Paragraph</button>
                        <button type="button" onClick={() => insertFormatting('ul')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-white/80">List</button>
                        <button type="button" onClick={() => insertFormatting('table')} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-emerald-400 font-semibold">Table</button>
                      </div>
                    </div>
                    <textarea
                      rows={12}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article in HTML or markdown-like sections (e.g. <h2>Title</h2> <p>Text...</p>)"
                      className="w-full bg-white/5 border border-white/10 rounded-[16px] p-4 text-xs font-mono text-white/90 placeholder:text-white/20 focus:outline-none focus:border-accent/40 resize-y leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <div className="glass rounded-[20px] p-8 border border-white/10 min-h-[400px]">
                  <div className="mb-6">
                    <span className="text-xs text-accent font-medium px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                      {category}
                    </span>
                    <h1 className="font-heading text-3xl text-white mt-3 mb-2">{title || 'Blog Title Preview'}</h1>
                    <p className="text-xs text-white/50">{date} • {readTime} • By {authorName} ({authorRole})</p>
                  </div>
                  <div
                    className="prose prose-invert max-w-none text-white/80 font-body text-sm leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: content || '<p>No content written yet.</p>' }}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
                >
                  <Save className="h-4 w-4" /> {editingBlog ? 'Update Article' : 'Publish Blog Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
