import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_auth'
import { db } from '../_db'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const logs = db.read<any>('system_logs')
  const { type: typeFilter, severity, from, to } = req.query as Record<string, string>

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
