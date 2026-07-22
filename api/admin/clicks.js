import { requireAuth } from '../_auth.js'
import { db } from '../_db.js'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return

  const clicks = db.read('clicks')
  const { type, from, to } = req.query

  let filtered = [...clicks]
  if (from) filtered = filtered.filter((c) => c.createdAt >= from)
  if (to) filtered = filtered.filter((c) => c.createdAt <= to + 'T23:59:59')
  if (type) filtered = filtered.filter((c) => c.type === type)

  const byLabel = {}
  filtered.forEach((c) => { byLabel[c.label || c.type] = (byLabel[c.label || c.type] || 0) + 1 })

  res.json({
    total: filtered.length,
    clicks: filtered.slice(-200).reverse(),
    byLabel,
  })
}
