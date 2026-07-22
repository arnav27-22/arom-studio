import { db } from '../_db.mjs'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, page, timeOnPage, scrollDepth } = req.body || {}
  if (!sessionId || !page) return res.status(400).json({ error: 'Missing fields' })

  const visits = db.read('visits')
  const last = visits.findLast((v) => v.sessionId === sessionId && v.page === page)
  if (last) {
    last.timeOnPage = timeOnPage || 0
    last.scrollDepth = scrollDepth || 0
    db.write('visits', visits)
  }

  res.json({ ok: true })
}
