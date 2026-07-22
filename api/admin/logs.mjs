import { requireAuth } from '../_auth.mjs'
import { db } from '../_db.mjs'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return

  const logs = db.read('system_logs')
  const { type: typeFilter, severity, from, to } = req.query

  let filtered = [...logs]
  if (from) filtered = filtered.filter((l) => l.timestamp >= from)
  if (to) filtered = filtered.filter((l) => l.timestamp <= to + 'T23:59:59')
  if (typeFilter) filtered = filtered.filter((l) => l.type === typeFilter)
  if (severity) filtered = filtered.filter((l) => l.severity === severity)

  res.json({
    total: filtered.length,
    logs: filtered.slice(-200).reverse(),
  })
}
