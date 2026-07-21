import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Download, CheckCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'

const categories = ['Communication', 'Design', 'Development', 'Delivery', 'Overall Experience']

export default function Feedback() {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [hovered, setHovered] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [portfolio, setPortfolio] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleRate = (cat: string, value: number) => {
    setRatings((prev) => ({ ...prev, [cat]: value }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleDownloadPDF = () => {
    const lines = categories.map((c) => `${c}: ${'★'.repeat(ratings[c] || 0)}${'☆'.repeat(5 - (ratings[c] || 0))} (${ratings[c] || 0}/5)`)
    const text = [
      'FEEDBACK — AROM STUDIO',
      '=======================',
      `Date: ${new Date().toLocaleDateString('en-IN')}`,
      '',
      ...lines,
      '',
      `Portfolio Permission: ${portfolio ? 'Yes' : 'No'}`,
      '',
      'Comments:',
      comment || '(None)',
      '',
      '=======================',
      'Thank you for your feedback!',
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Feedback_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="font-heading text-3xl text-white mb-3">Thank You!</h2>
        <p className="text-sm text-white/60 font-body font-light mb-8">Your feedback has been submitted. It means a lot to us.</p>
        <Button variant="secondary" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4" /> Download Feedback Copy
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Feedback</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Share your experience working with AROM Studio.</p>
      </div>

      <div className="glass rounded-[32px] p-8">
        {/* Star ratings */}
        <div className="space-y-5 mb-8">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-sm text-white/70 font-body mb-2">{cat}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(cat, star)}
                    onMouseEnter={() => setHovered((prev) => ({ ...prev, [cat]: star }))}
                    onMouseLeave={() => setHovered((prev) => ({ ...prev, [cat]: 0 }))}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        (hovered[cat] || ratings[cat] || 0) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/20',
                      )}
                    />
                  </button>
                ))}
                {ratings[cat] && (
                  <span className="text-xs text-white/40 font-body ml-2 self-center">{ratings[cat]}/5</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="text-sm text-white/70 font-body block mb-2">Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-[18px] px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body resize-none"
          />
        </div>

        {/* Portfolio permission */}
        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <div className="mt-0.5">
            <input
              type="checkbox"
              checked={portfolio}
              onChange={(e) => setPortfolio(e.target.checked)}
              className="sr-only"
            />
            <div className={cn(
              'w-5 h-5 rounded-md border flex items-center justify-center transition-colors',
              portfolio ? 'bg-accent border-accent' : 'border-white/20 group-hover:border-white/40',
            )}>
              {portfolio && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
            </div>
          </div>
          <span className="text-sm text-white/60 font-body font-light leading-relaxed">
            I allow AROM Studio to showcase my project in its portfolio.
          </span>
        </label>

        <Button variant="primary" size="lg" onClick={handleSubmit} className="w-full">
          Submit Feedback
        </Button>
      </div>
    </div>
  )
}
