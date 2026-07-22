import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { db } from '../_db'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { type, label, page, sessionId } = req.body || {}

  db.append('clicks', {
    id: crypto.randomUUID(),
    sessionId,
    type: type || 'unknown',
    label: label || '',
    page: page || '/',
    createdAt: new Date().toISOString(),
  })

  res.json({ ok: true })
}
