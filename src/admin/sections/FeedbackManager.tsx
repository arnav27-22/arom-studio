import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { MessageSquareHeart, Star, CheckCircle2, Search, Lightbulb, Plus, X, Trash2, Download } from 'lucide-react'
import { getAdminStore, saveAdminStore, moveToRecycleBin, type AdminFeedback } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

export function FeedbackManager() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const handleDownloadFeedbacksPDF = () => {
    const feedbacks = store.feedbacks || []
    const headers = ['Client Name', 'Company Name', 'Rating', 'Review Summary', 'Testimonial Approved']
    const rows = feedbacks.map((f) => [
      f.clientName,
      f.company,
      `⭐ ${f.rating}/5`,
      f.review,
      f.testimonialApproved ? 'Live on Website' : 'Hidden',
    ])
    exportSectionReportPDF('Client Feedback Audit Report', 'AROM Studio Client Testimonials & Feedback Ratings', headers, rows, 'Client_Feedback_Report')
  }

  const [form, setForm] = useState({
    clientName: '',
    company: '',
    rating: 5,
    review: '',
    clientSuggestions: '',
  })

  useEffect(() => {
    setStore(getAdminStore())
  }, [])

  const feedbacks = store.feedbacks || []

  const handleDeleteFeedback = (id: string) => {
    const f = feedbacks.find((x) => x.id === id)
    moveToRecycleBin('feedbacks', id, f?.clientName || 'Feedback', f?.company)
    setStore(getAdminStore())
  }

  const filteredFeedbacks = feedbacks.filter((f) => {
    return (
      f.clientName.toLowerCase().includes(search.toLowerCase()) ||
      f.company.toLowerCase().includes(search.toLowerCase()) ||
      f.review.toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalReviews = feedbacks.length
  const avgRating = feedbacks.length ? (feedbacks.reduce((a, f) => a + (f.rating || 5), 0) / feedbacks.length).toFixed(1) : '5.0'
  const approvedTestimonials = feedbacks.filter((f) => f.testimonialApproved).length

  const handleToggleTestimonial = (id: string) => {
    const updatedFbs = feedbacks.map((f) =>
      f.id === id ? { ...f, testimonialApproved: !f.testimonialApproved } : f
    )
    const updated = { ...store, feedbacks: updatedFbs }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleTogglePortfolio = (id: string) => {
    const updatedFbs = feedbacks.map((f) =>
      f.id === id ? { ...f, portfolioPermission: !f.portfolioPermission } : f
    )
    const updated = { ...store, feedbacks: updatedFbs }
    saveAdminStore(updated)
    setStore(updated)
  }

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName || !form.review) return

    const newFb: AdminFeedback = {
      id: 'fb_' + Math.random().toString(36).slice(2, 9),
      clientName: form.clientName,
      company: form.company || 'Client Partner',
      rating: Number(form.rating) || 5,
      review: form.review,
      testimonialApproved: true,
      portfolioPermission: true,
      clientSuggestions: form.clientSuggestions || 'None',
      createdAt: new Date().toISOString(),
    }

    const updated = { ...store, feedbacks: [newFb, ...store.feedbacks] }
    saveAdminStore(updated)
    setStore(updated)
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-accent" /> Feedback & Testimonial Management
          </h2>
          <p className="text-xs text-white/50">Client ratings, reviews, showcase permissions & agency improvement suggestions</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadFeedbacksPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Feedback PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Record Client Review
          </button>
        </div>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Client Reviews" value={totalReviews} icon={<MessageSquareHeart className="h-4 w-4 text-accent" />} />
        <StatCard label="Average Rating" value={`⭐ ${avgRating}`} icon={<Star className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Testimonials Live" value={approvedTestimonials} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search client review, company, or text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent"
        />
      </div>

      {/* Feedbacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFeedbacks.map((f) => (
          <div key={f.id} className="glass rounded-[28px] p-6 border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white font-heading">{f.clientName}</h3>
                  <p className="text-xs text-accent">{f.company}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {f.rating}.0
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-body italic bg-white/5 p-4 rounded-2xl border border-white/5">
                "{f.review}"
              </p>

              {f.clientSuggestions && f.clientSuggestions !== 'None' && (
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs space-y-1">
                  <span className="text-accent font-semibold flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5" /> Client Suggestion
                  </span>
                  <p className="text-white/70">{f.clientSuggestions}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleTestimonial(f.id)}
                className={`px-3 py-1.5 rounded-xl font-medium border text-[11px] transition-all cursor-pointer ${
                  f.testimonialApproved ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                Website Testimonial: {f.testimonialApproved ? 'Approved' : 'Hidden'}
              </button>

              <button
                onClick={() => handleTogglePortfolio(f.id)}
                className={`px-3 py-1.5 rounded-xl font-medium border text-[11px] transition-all cursor-pointer ${
                  f.portfolioPermission ? 'bg-accent/20 border border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                Portfolio Use: {f.portfolioPermission ? 'Permitted' : 'Private'}
              </button>

              <button
                onClick={() => handleDeleteFeedback(f.id)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer ml-auto"
                title="Delete Review"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-heading">Record Client Feedback</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFeedback} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Client Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Sarah Jenkins"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Company</label>
                  <input
                    type="text"
                    placeholder="Apex Innovations"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Star Rating (1 to 5)</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                </select>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Client Testimonial Review *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outstanding work and fast turnarounds..."
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-medium">Suggestions for Improvement</label>
                <textarea
                  rows={2}
                  placeholder="Future feature recommendations..."
                  value={form.clientSuggestions}
                  onChange={(e) => setForm({ ...form, clientSuggestions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
