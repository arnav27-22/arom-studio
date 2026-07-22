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
  const { sessionId, page, timeOnPage, scrollDepth } = b
  if (!sessionId || !page) return res.status(400).json({ error: 'Missing fields' })

  const visits = db.read('visits')
  const last = visits.findLast(v => v.sessionId === sessionId && v.page === page)
  if (last) {
    last.timeOnPage = timeOnPage || 0
    last.scrollDepth = scrollDepth || 0
    db.write('visits', visits)
  }

  res.json({ ok: true })
}
