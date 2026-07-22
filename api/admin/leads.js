import crypto from 'crypto'
import { requireAuth } from '../_auth.js'
import { getSupabase } from '../_supabase.js'

function encrypt(text) {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-me-32chars!!'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key.padEnd(32, 'x').slice(0, 32)), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted + ':' + cipher.getAuthTag().toString('hex')
}

function decrypt(encrypted) {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-me-32chars!!'
  const [ivHex, enc, tagHex] = encrypted.split(':')
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key.padEnd(32, 'x').slice(0, 32)), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  let decrypted = decipher.update(enc, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

  if (req.method === 'PUT') {
    const { id, status } = req.body || {}
    const { error } = await supabase.from('form_submissions').update({ status }).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ success: true })
  }

  const { data: leads, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  if (!leads) return res.json({ total: 0, leads: [], byService: {} })

  const { from, to, status: statusFilter } = req.query

  let filtered = [...leads]
  if (from) filtered = filtered.filter((l) => l.createdAt >= from)
  if (to) filtered = filtered.filter((l) => l.createdAt <= to + 'T23:59:59')
  if (statusFilter) filtered = filtered.filter((l) => l.status === statusFilter)

  const byService = {}
  filtered.forEach((l) => { const s = l.service || 'Unknown'; byService[s] = (byService[s] || 0) + 1 })

  if (req.query.view === 'full' && req.query.id) {
    const lead = leads.find((l) => l.id === req.query.id)
    if (!lead) return res.status(404).json({ error: 'Not found' })
    return res.json({ ...lead, email: lead.emailEncrypted ? decrypt(lead.emailEncrypted) : lead.email })
  }

  res.json({
    total: filtered.length,
    leads: filtered.slice(-100).reverse().map((l) => ({ ...l, email: '***' })),
    byService,
  })
}
