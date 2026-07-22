import crypto from 'crypto'
import { db } from '../_db.js'

function getBody(req) {
  return new Promise((resolve) => {
    if (req.body) return resolve(req.body)
    let data = ''
    req.on('data', (c) => data += c)
    req.on('end', () => {
      try { resolve(JSON.parse(data)) } catch { resolve({}) }
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const b = await getBody(req)

  db.append('clicks', {
    id: crypto.randomUUID(),
    sessionId: b.sessionId,
    type: b.type || 'unknown',
    label: b.label || '',
    page: b.page || '/',
    createdAt: new Date().toISOString(),
  })

  res.json({ ok: true })
}
