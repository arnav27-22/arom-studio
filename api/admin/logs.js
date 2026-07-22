import { requireAuth } from '../_auth.js'
import { db } from '../_db.js'

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return

  const logs = db.read('system_logs')
  if (!logs.length) return res.json({ total: 0, logs: [] })

  const { type: typeFilter, severity, from, to } = req.query

  let filtered = [...logs]
  if (from) filtered = filtered.filter((l) => l.createdAt >= from)
  if (to) filtered = filtered.filter((l) => l.createdAt <= to + 'T23:59:59')
  if (typeFilter) filtered = filtered.filter((l) => l.type === typeFilter)
  if (severity) filtered = filtered.filter((l) => l.severity === severity)

  res.json({
    total: filtered.length,
    logs: filtered.slice(-200).reverse(),
  })
}
