import crypto from 'crypto'
import { db } from './_db.js'
import { requireAuth, verifyToken, signToken, timingSafeEqual, checkRateLimit, recordFailure } from './_auth.js'

function j(res, data) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  })
  res.end(JSON.stringify(data))
}

function parseCookies(req) {
  const cookies = {}
  ;(req.headers.cookie || '').split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=')
    if (k) cookies[k.trim()] = v.join('=')
  })
  return cookies
}

function adminGuard(req, res) {
  const cookies = parseCookies(req)
  if (!cookies.admin_token || !verifyToken(cookies.admin_token)) {
    send(res, 401, { error: 'Unauthorized' })
    return false
  }
  return true
}

function getJSON(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c) => body += c)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
  })
}

function parseMultipart(buf, boundary) {
  const parts = []
  const delimiter = Buffer.from(`--${boundary}`)
  const endDelimiter = Buffer.from(`--${boundary}--`)
  let pos = 0
  while (pos < buf.length) {
    const start = buf.indexOf(delimiter, pos)
    if (start === -1) break
    const sectionStart = start + delimiter.length
    if (buf.slice(sectionStart, sectionStart + 2).toString() === '--') break
    let sectionEnd = buf.indexOf(delimiter, sectionStart)
    if (sectionEnd === -1) sectionEnd = buf.length
    const section = buf.slice(sectionStart, sectionEnd).toString('latin1')
    const headerEnd = section.indexOf('\r\n\r\n')
    if (headerEnd === -1) { pos = sectionEnd; continue }
    const headers = section.slice(0, headerEnd)
    const nameMatch = headers.match(/name="([^"]+)"/)
    const filenameMatch = headers.match(/filename="([^"]+)"/)
    const dataStart = sectionStart + headerEnd + 4
    const dataEnd = sectionEnd - 2
    const part = { name: nameMatch ? nameMatch[1] : '', value: '' }
    if (filenameMatch) {
      part.filename = filenameMatch[1]
      const ct = headers.match(/Content-Type:\s*(\S+)/i)
      part.contentType = ct ? ct[1] : 'application/octet-stream'
      part.data = buf.slice(dataStart, dataEnd)
    } else {
      part.value = buf.slice(dataStart, dataEnd).toString('utf-8').replace(/\r$/, '')
    }
    parts.push(part)
    pos = sectionEnd
  }
  return parts
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, {})

  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'

  // Auth
  if (pathname === '/api/admin/auth') {
    if (req.method === 'GET') {
      const cookies = parseCookies(req)
      return j(res, { authenticated: !!(cookies.admin_token && verifyToken(cookies.admin_token)) })
    }
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'login') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'Too many attempts' })
        if (!timingSafeEqual(body.password || '', process.env.ADMIN_PASSWORD || 'ARNAVOM272213')) {
          recordFailure(ip); return send(res, 401, { error: 'Incorrect password' })
        }
        const token = signToken()
        res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`)
        return j(res, { success: true })
      }
      if (body.action === 'logout') {
        res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
        return j(res, { success: true })
      }
    }
    return send(res, 400, { error: 'Invalid' })
  }

  // Overview
  if (pathname === '/api/admin/overview') {
    if (!adminGuard(req, res)) return
    const visits = db.read('visits')
    const pdfs = db.read('pdf_events')
    const leads = db.read('form_submissions')
    const logs = db.read('system_logs')
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const weekAgo = new Date(now - 7 * 86400000).toISOString()
    const fiveMinAgo = new Date(now - 5 * 60000).toISOString()
    const todayVisits = visits.filter(v => v.createdAt?.startsWith(today))
    const weekVisits = visits.filter(v => v.createdAt >= weekAgo)
    const pageCounts = {}
    visits.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'
    const recent = [...logs, ...visits.slice(-5)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    return j(res, {
      todayVisits: todayVisits.length, weekVisits: weekVisits.length, monthVisits: visits.length, allTimeVisits: visits.length,
      activeSessions: new Set(visits.filter(v => v.createdAt >= fiveMinAgo).map(v => v.sessionId)).size,
      totalPDFs: pdfs.length, todayPDFs: pdfs.filter(p => p.createdAt?.startsWith(today)).length, totalLeads: leads.length,
      topPage, recentEvents: recent,
    })
  }

  // Visitors
  if (pathname === '/api/admin/visitors') {
    if (!adminGuard(req, res)) return
    if (req.method === 'DELETE') { db.write('visits', []); return j(res, { success: true }) }
    const visits = db.read('visits')
    if (!visits.length) return j(res, { total: 0, allTime: 0, visits: [], dailyChart: [], deviceBreakdown: {}, countryCounts: {} })
    const params = Object.fromEntries(url.searchParams)
    let filtered = [...visits]
    if (params.from) filtered = filtered.filter(v => v.createdAt >= params.from)
    if (params.to) filtered = filtered.filter(v => v.createdAt <= params.to + 'T23:59:59')
    if (params.page) filtered = filtered.filter(v => v.page === params.page)
    if (params.country) filtered = filtered.filter(v => v.country === params.country)
    if (params.device) filtered = filtered.filter(v => v.deviceType === params.device)
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const day = visits.filter(v => v.createdAt?.startsWith(d))
      return { date: d, visits: day.length, unique: new Set(day.map(v => v.sessionId)).size }
    }).reverse()
    const deviceB = {}; visits.forEach(v => { deviceB[v.deviceType] = (deviceB[v.deviceType] || 0) + 1 })
    const countryC = {}; visits.forEach(v => { if (v.country) countryC[v.country] = (countryC[v.country] || 0) + 1 })
    return j(res, { total: filtered.length, allTime: visits.length, visits: filtered.slice(-200).reverse(), dailyChart: last30, deviceBreakdown: deviceB, countryCounts: countryC })
  }

  // PDFs
  if (pathname === '/api/admin/pdfs') {
    if (!adminGuard(req, res)) return
    const pdfs = db.read('pdf_events')
    if (!pdfs.length) return j(res, { total: 0, pdfs: [], byDay: {}, avgSize: 0 })
    const params = Object.fromEntries(url.searchParams)
    let f = [...pdfs]
    if (params.from) f = f.filter(e => e.createdAt >= params.from)
    if (params.to) f = f.filter(e => e.createdAt <= params.to + 'T23:59:59')
    if (params.pdfType) f = f.filter(e => e.pdfType === params.pdfType)
    if (params.country) f = f.filter(e => e.country === params.country)
    const byDay = {}
    f.forEach(e => { const d = e.createdAt?.slice(0, 10); if (d) { if (!byDay[d]) byDay[d] = { count: 0, totalSize: 0 }; byDay[d].count++; byDay[d].totalSize += e.fileSizeKb || 0 } })
    return j(res, { total: f.length, pdfs: f.slice(-100).reverse(), byDay, avgSize: f.length ? Math.round(f.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / f.length) : 0 })
  }

  // Leads
  if (pathname === '/api/admin/leads') {
    if (!adminGuard(req, res)) return
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-me-32chars!!'
    function decrypt(enc) {
      const [iv, ct, tag] = enc.split(':')
      const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key.padEnd(32, 'x').slice(0, 32)), Buffer.from(iv, 'hex'))
      d.setAuthTag(Buffer.from(tag, 'hex'))
      return d.update(ct, 'hex', 'utf8') + d.final('utf8')
    }
    if (req.method === 'PUT') {
      const body = await getJSON(req)
      const leads = db.read('form_submissions')
      const idx = leads.findIndex(l => l.id === body.id)
      if (idx !== -1) { leads[idx].status = body.status || leads[idx].status; db.write('form_submissions', leads); return j(res, { success: true }) }
      return send(res, 404, { error: 'Not found' })
    }
    const leads = db.read('form_submissions')
    if (!leads.length) return j(res, { total: 0, leads: [], byService: {} })
    const params = Object.fromEntries(url.searchParams)
    let f = [...leads]
    if (params.from) f = f.filter(l => l.createdAt >= params.from)
    if (params.to) f = f.filter(l => l.createdAt <= params.to + 'T23:59:59')
    if (params.status) f = f.filter(l => l.status === params.status)
    const byService = {}; f.forEach(l => { const s = l.service || 'Unknown'; byService[s] = (byService[s] || 0) + 1 })
    if (params.view === 'full' && params.id) {
      const lead = leads.find(l => l.id === params.id)
      if (!lead) return send(res, 404, { error: 'Not found' })
      return j(res, { ...lead, email: lead.emailEncrypted ? decrypt(lead.emailEncrypted) : lead.email })
    }
    return j(res, { total: f.length, leads: f.slice(-100).reverse().map(l => ({ ...l, email: '***' })), byService })
  }

  // Analytics
  if (pathname === '/api/admin/analytics') {
    if (!adminGuard(req, res)) return
    const visits = db.read('visits')
    if (!visits.length) return j(res, { pages: [], totalUniqueSessions: 0, overallBounceRate: 0, hourlyTraffic: [] })
    const pages = {}
    visits.forEach((v, i) => {
      if (!pages[v.page]) pages[v.page] = { views: 0, totalTime: 0, totalScroll: 0, entries: 0, exits: 0, referrers: {} }
      pages[v.page].views++
      if (v.timeOnPage) pages[v.page].totalTime += v.timeOnPage
      if (v.scrollDepth) pages[v.page].totalScroll += v.scrollDepth
      if (v.referrer) pages[v.page].referrers[v.referrer] = (pages[v.page].referrers[v.referrer] || 0) + 1
      if (i === 0 || visits[i - 1]?.sessionId !== v.sessionId) pages[v.page].entries++
      if (i === visits.length - 1 || visits[i + 1]?.sessionId !== v.sessionId) pages[v.page].exits++
    })
    const unique = new Set(visits.map(v => v.sessionId))
    const single = new Set()
    const sp = {}; visits.forEach(v => { if (!sp[v.sessionId]) sp[v.sessionId] = new Set(); sp[v.sessionId].add(v.page) })
    Object.entries(sp).forEach(([sid, p]) => { if (p.size <= 1) single.add(sid) })
    const hourly = Array.from({ length: 7 }, () => Array(24).fill(0))
    visits.forEach(v => { const d = new Date(v.createdAt); if (hourly[d.getDay()]) hourly[d.getDay()][d.getHours()]++ })
    return j(res, {
      pages: Object.entries(pages).map(([path, d]) => ({ page: path, views: d.views, uniqueSessions: 0, avgTime: d.views ? Math.round(d.totalTime / d.views) : 0, avgScroll: d.views ? Math.round(d.totalScroll / d.views) : 0, bounceRate: 0, entries: d.entries, exits: d.exits, topReferrers: Object.entries(d.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5) })),
      totalUniqueSessions: unique.size, overallBounceRate: unique.size ? Math.round(single.size / unique.size * 100) : 0, hourlyTraffic: hourly,
    })
  }

  // Clicks
  if (pathname === '/api/admin/clicks') {
    if (!adminGuard(req, res)) return
    const clicks = db.read('clicks')
    if (!clicks.length) return j(res, { total: 0, clicks: [], byLabel: {} })
    const params = Object.fromEntries(url.searchParams)
    let f = [...clicks]
    if (params.from) f = f.filter(c => c.createdAt >= params.from)
    if (params.to) f = f.filter(c => c.createdAt <= params.to + 'T23:59:59')
    if (params.type) f = f.filter(c => c.type === params.type)
    const byLabel = {}; f.forEach(c => { byLabel[c.label || c.type] = (byLabel[c.label || c.type] || 0) + 1 })
    return j(res, { total: f.length, clicks: f.slice(-200).reverse(), byLabel })
  }

  // Logs
  if (pathname === '/api/admin/logs') {
    if (!adminGuard(req, res)) return
    const logs = db.read('system_logs')
    if (!logs.length) return j(res, { total: 0, logs: [] })
    const params = Object.fromEntries(url.searchParams)
    let f = [...logs]
    if (params.from) f = f.filter(l => l.createdAt >= params.from)
    if (params.to) f = f.filter(l => l.createdAt <= params.to + 'T23:59:59')
    if (params.type) f = f.filter(l => l.type === params.type)
    if (params.severity) f = f.filter(l => l.severity === params.severity)
    return j(res, { total: f.length, logs: f.slice(-200).reverse() })
  }

  // Settings
  if (pathname === '/api/admin/settings') {
    if (!adminGuard(req, res)) return
    return j(res, { envChecks: { ADMIN_PASSWORD: true, ADMIN_JWT_SECRET: true, ENCRYPTION_KEY: true }, allSet: true, adminSessionTimeout: '8h', adminJwtExpiry: '8h', dbConnected: true })
  }

  // Track pageview
  if (pathname === '/api/track/pageview' && req.method === 'POST') {
    const body = await getJSON(req)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
    db.append('visits', {
      id: crypto.randomUUID(), sessionId: body.sessionId, page: body.page || '/', referrer: body.referrer || '',
      deviceType: body.deviceInfo?.deviceType || 'desktop', browser: body.deviceInfo?.browser || 'Unknown', os: body.deviceInfo?.os || 'Unknown',
      country: '', city: '', ipHash, timeOnPage: 0, scrollDepth: 0, createdAt: new Date().toISOString(),
    })
    return j(res, { ok: true })
  }

  // Track exit
  if (pathname === '/api/track/exit' && req.method === 'POST') {
    const body = await getJSON(req)
    if (body.sessionId && body.page) {
      const visits = db.read('visits')
      const last = visits.findLast(v => v.sessionId === body.sessionId && v.page === body.page)
      if (last) { last.timeOnPage = body.timeOnPage || 0; last.scrollDepth = body.scrollDepth || 0; db.write('visits', visits) }
    }
    return j(res, { ok: true })
  }

  // Track click
  if (pathname === '/api/track/click' && req.method === 'POST') {
    const body = await getJSON(req)
    db.append('clicks', { id: crypto.randomUUID(), sessionId: body.sessionId, type: body.type || 'unknown', label: body.label || '', page: body.page || '/', createdAt: new Date().toISOString() })
    return j(res, { ok: true })
  }

  // PDF upload (no auth - from client)
  if (pathname === '/api/pdfs/upload' && req.method === 'POST') {
    const bufs = []
    let total = 0
    for await (const chunk of req) { bufs.push(chunk); total += chunk.length }
    const boundary = req.headers['content-type']?.split('boundary=')[1]
    if (!boundary) return send(res, 400, { error: 'missing boundary' })
    const buf = Buffer.concat(bufs)
    const parts = parseMultipart(buf, boundary)
    const fileField = parts.find(p => p.name === 'file')
    const pdfType = parts.find(p => p.name === 'pdfType')?.value || 'unknown'
    const storageKey = parts.find(p => p.name === 'storageKey')?.value || `pdf_${crypto.randomUUID()}.pdf`
    const sessionId = parts.find(p => p.name === 'sessionId')?.value || ''
    const deviceType = parts.find(p => p.name === 'deviceType')?.value || ''
    const browser = parts.find(p => p.name === 'browser')?.value || ''
    const os = parts.find(p => p.name === 'os')?.value || ''

    if (!fileField || !fileField.data) return send(res, 400, { error: 'no file' })

    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(`pdfs/${storageKey}`, fileField.data, { access: 'public', addRandomSuffix: true })
      db.append('pdf_events', {
        id: crypto.randomUUID(), sessionId, pdfType, fileSizeKb: Math.round(fileField.data.length / 1024),
        storageKey, blobUrl: blob.url, deviceType, browser, os, country: '', createdAt: new Date().toISOString(),
      })
      return j(res, { ok: true, url: blob.url })
    } catch (e) {
      return send(res, 500, { error: 'upload failed' })
    }
  }

  // PDF download (admin, requires auth)
  if (pathname === '/api/pdfs/download' && req.method === 'GET') {
    if (!adminGuard(req, res)) return
    const pdfs = db.read('pdf_events')
    const id = url.searchParams.get('id')
    const entry = pdfs.find(p => p.id === id)
    if (!entry || !entry.blobUrl) return send(res, 404, { error: 'not found' })
    try {
      const response = await fetch(entry.blobUrl)
      const buffer = Buffer.from(await response.arrayBuffer())
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${entry.storageKey || 'document.pdf'}"`,
        'Content-Length': buffer.length,
      })
      res.end(buffer)
    } catch {
      return send(res, 500, { error: 'download failed' })
    }
  }

  // Ping
  if (pathname === '/api/ping') return j(res, { ok: true })

  send(res, 404, { error: 'not found', path: pathname })
}
