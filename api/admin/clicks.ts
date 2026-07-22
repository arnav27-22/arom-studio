import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_auth'
import { db } from '../_db'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const clicks = db.read<any>('clicks')
  const { type, from, to } = req.query as Record<string, string>

  let filtered = [...clicks]
  if (from) filtered = filtered.filter((c) => c.createdAt >= from)
  if (to) filtered = filtered.filter((c) => c.createdAt <= to + 'T23:59:59')
  if (type) filtered = filtered.filter((c) => c.type === type)

  const byLabel: Record<string, number> = {}
  filtered.forEach((c: any) => { byLabel[c.label || c.type] = (byLabel[c.label || c.type] || 0) + 1 })

  res.json({
    total: filtered.length,
    clicks: filtered.slice(-200).reverse(),
    byLabel,
  })
}
