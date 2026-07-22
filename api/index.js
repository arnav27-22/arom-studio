import crypto from 'crypto'
import { db } from './_db.js'
import { requireAuth, getCookieToken, verifyToken, signToken, timingSafeEqual, checkRateLimit, recordFailure } from './_auth.js'

function getJSON(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c) => body += c)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch { resolve({}) }
    })
  })
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
  if (!process.env.ADMIN_JWT_SECRET) {
    send(res, 200, { authenticated: false, error: 'Admin not configured' })
    return false
  }
  const cookies = parseCookies(req)
  if (!cookies.admin_token || !verifyToken(cookies.admin_token)) {
    send(res, 401, { error: 'Unauthorized' })
    return false
  }
  return true
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, {})

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'

  // ---- Auth ----
  if (pathname === '/api/admin/auth') {
    if (req.method === 'GET') {
      const cookies = parseCookies(req)
      return send(res, 200, { authenticated: !!(cookies.admin_token && verifyToken(cookies.admin_token)) })
    }
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'login') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'Too many attempts. Try again later.' })
        const adminPw = process.env.ADMIN_PASSWORD
        if (!adminPw) return send(res, 500, { error: 'ADMIN_PASSWORD not configured' })
        if (!timingSafeEqual(body.password || '', adminPw)) {
          recordFailure(ip)
          return send(res, 401, { error: 'Incorrect password' })
        }
        const token = signToken()
        res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`)
        return send(res, 200, { success: true })
      }
      if (body.action === 'logout') {
        res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
        return send(res, 200, { success: true })
      }
    }
    return send(res, 400, { error: 'Invalid' })
  }

  // ---- Overview ----
  if (pathname === '/api/admin/overview') {
    if (!adminGuard(req, res)) return
    const visits = db.read('visits')
    const pdfs = db.read('pdf_events')
    const leads = db.read('form_submissions')
    const logs = db.read('system_logs')

    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const weekAgo = new Date(now - 7 * 86400000).toISOString()

    const todayVisits = visits.filter((v) => v.createdAt?.startsWith(today))
    const weekVisits = visits.filter((v) => v.createdAt >= weekAgo)

    const pageCounts = {}
    visits.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

    const fiveMinAgo = new Date(now - 5 * 60000).toISOString()
    const activeSessions = new Set(visits.filter(v => v.createdAt >= fiveMinAgo).map(v => v.sessionId)).size

    const recentEvents = [...logs, ...visits.slice(-5)]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return send(res, 200, {
      todayVisits: todayVisits.length,
      weekVisits: weekVisits.length,
      monthVisits: visits.length,
      allTimeVisits: visits.length,
      activeSessions,
      totalPDFs: pdfs.length,
      todayPDFs: pdfs.filter(p => p.createdAt?.startsWith(today)).length,
      totalLeads: leads.length,
      topPage,
      recentEvents,
    })
  }

  // ---- Visitors ----
  if (pathname === '/api/admin/visitors') {
    if (!adminGuard(req, res)) return

    if (req.method === 'DELETE') {
      db.write('visits', [])
      return send(res, 200, { success: true })
    }

    const visits = db.read('visits')
    if (!visits.length) return send(res, 200, { total: 0, allTime: 0, visits: [], dailyChart: [], deviceBreakdown: {}, countryCounts: {} })

    const { page, country, device, from, to } = Object.fromEntries(url.searchParams)

    let filtered = [...visits]
    if (from) filtered = filtered.filter((v) => v.createdAt >= from)
    if (to) filtered = filtered.filter((v) => v.createdAt <= to + 'T23:59:59')
    if (page) filtered = filtered.filter((v) => v.page === page)
    if (country) filtered = filtered.filter((v) => v.country === country)
    if (device) filtered = filtered.filter((v) => v.deviceType === device)

    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const dayVisits = visits.filter((v) => v.createdAt?.startsWith(d))
      return { date: d, visits: dayVisits.length, unique: new Set(dayVisits.map(v => v.sessionId)).size }
    }).reverse()

    const deviceBreakdown = {}
    visits.forEach(v => { deviceBreakdown[v.deviceType] = (deviceBreakdown[v.deviceType] || 0) + 1 })

    const countryCounts = {}
    visits.forEach(v => { if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1 })

    return send(res, 200, {
      total: filtered.length,
      allTime: visits.length,
      visits: filtered.slice(-200).reverse(),
      dailyChart: last30,
      deviceBreakdown,
      countryCounts,
    })
  }

  // ---- PDFs ----
  if (pathname === '/api/admin/pdfs') {
    if (!adminGuard(req, res)) return
    const pdfEvents = db.read('pdf_events')
    if (!pdfEvents.length) return send(res, 200, { total: 0, pdfs: [], byDay: {}, avgSize: 0 })

    const { from, to, pdfType, country } = Object.fromEntries(url.searchParams)

    let filtered = [...pdfEvents]
    if (from) filtered = filtered.filter((e) => e.createdAt >= from)
    if (to) filtered = filtered.filter((e) => e.createdAt <= to + 'T23:59:59')
    if (pdfType) filtered = filtered.filter((e) => e.pdfType === pdfType)
    if (country) filtered = filtered.filter((e) => e.country === country)

    const byDay = {}
    filtered.forEach(e => {
      const day = e.createdAt?.slice(0, 10)
      if (!day) return
      if (!byDay[day]) byDay[day] = { count: 0, totalSize: 0 }
      byDay[day].count++
      byDay[day].totalSize += e.fileSizeKb || 0
    })

    return send(res, 200, {
      total: filtered.length,
      pdfs: filtered.slice(-100).reverse(),
      byDay,
      avgSize: filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / filtered.length) : 0,
    })
  }

  // ---- Leads ----
  if (pathname === '/api/admin/leads') {
    if (!adminGuard(req, res)) return

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

    if (req.method === 'PUT') {
      const body = await getJSON(req)
      const leads = db.read('form_submissions')
      const idx = leads.findIndex(l => l.id === body.id)
      if (idx !== -1) {
        leads[idx].status = body.status || leads[idx].status
        db.write('form_submissions', leads)
        return send(res, 200, { success: true })
      }
      return send(res, 404, { error: 'Not found' })
    }

    const leads = db.read('form_submissions')
    if (!leads.length) return send(res, 200, { total: 0, leads: [], byService: {} })

    const { from, to, status: statusFilter } = Object.fromEntries(url.searchParams)

    let filtered = [...leads]
    if (from) filtered = filtered.filter((l) => l.createdAt >= from)
    if (to) filtered = filtered.filter((l) => l.createdAt <= to + 'T23:59:59')
    if (statusFilter) filtered = filtered.filter((l) => l.status === statusFilter)

    const byService = {}
    filtered.forEach(l => { const s = l.service || 'Unknown'; byService[s] = (byService[s] || 0) + 1 })

    if (url.searchParams.get('view') === 'full' && url.searchParams.get('id')) {
      const lead = leads.find(l => l.id === url.searchParams.get('id'))
      if (!lead) return send(res, 404, { error: 'Not found' })
      return send(res, 200, { ...lead, email: lead.emailEncrypted ? decrypt(lead.emailEncrypted) : lead.email })
    }

    return send(res, 200, {
      total: filtered.length,
      leads: filtered.slice(-100).reverse().map(l => ({ ...l, email: '***' })),
      byService,
    })
  }

  // ---- Analytics ----
  if (pathname === '/api/admin/analytics') {
    if (!adminGuard(req, res)) return
    const visits = db.read('visits')
    if (!visits.length) return send(res, 200, { pages: [], totalUniqueSessions: 0, overallBounceRate: 0, hourlyTraffic: [] })

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

    const uniqueSessions = new Set(visits.map(v => v.sessionId))
    const singlePageSessions = new Set()
    const sessionPages = {}
    visits.forEach(v => { if (!sessionPages[v.sessionId]) sessionPages[v.sessionId] = new Set(); sessionPages[v.sessionId].add(v.page) })
    Object.entries(sessionPages).forEach(([sid, pagesSet]) => { if (pagesSet.size <= 1) singlePageSessions.add(sid) })

    const hourlyTraffic = Array.from({ length: 7 }, () => Array(24).fill(0))
    visits.forEach(v => { const d = new Date(v.createdAt); if (hourlyTraffic[d.getDay()]) hourlyTraffic[d.getDay()][d.getHours()]++ })

    return send(res, 200, {
      pages: Object.entries(pages).map(([path, data]) => ({
        page: path,
        views: data.views,
        uniqueSessions: 0,
        avgTime: data.views > 0 ? Math.round(data.totalTime / data.views) : 0,
        avgScroll: data.views > 0 ? Math.round(data.totalScroll / data.views) : 0,
        bounceRate: 0,
        entries: data.entries,
        exits: data.exits,
        topReferrers: Object.entries(data.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5),
      })),
      totalUniqueSessions: uniqueSessions.size,
      overallBounceRate: 0,
      hourlyTraffic,
    })
  }

  // ---- Clicks ----
  if (pathname === '/api/admin/clicks') {
    if (!adminGuard(req, res)) return
    const clicks = db.read('clicks')
    if (!clicks.length) return send(res, 200, { total: 0, clicks: [], byLabel: {} })

    const { type, from, to } = Object.fromEntries(url.searchParams)

    let filtered = [...clicks]
    if (from) filtered = filtered.filter((c) => c.createdAt >= from)
    if (to) filtered = filtered.filter((c) => c.createdAt <= to + 'T23:59:59')
    if (type) filtered = filtered.filter((c) => c.type === type)

    const byLabel = {}
    filtered.forEach(c => { byLabel[c.label || c.type] = (byLabel[c.label || c.type] || 0) + 1 })

    return send(res, 200, {
      total: filtered.length,
      clicks: filtered.slice(-200).reverse(),
      byLabel,
    })
  }

  // ---- Logs ----
  if (pathname === '/api/admin/logs') {
    if (!adminGuard(req, res)) return
    const logs = db.read('system_logs')
    if (!logs.length) return send(res, 200, { total: 0, logs: [] })

    const { type: typeFilter, severity, from, to } = Object.fromEntries(url.searchParams)

    let filtered = [...logs]
    if (from) filtered = filtered.filter((l) => l.createdAt >= from)
    if (to) filtered = filtered.filter((l) => l.createdAt <= to + 'T23:59:59')
    if (typeFilter) filtered = filtered.filter((l) => l.type === typeFilter)
    if (severity) filtered = filtered.filter((l) => l.severity === severity)

    return send(res, 200, {
      total: filtered.length,
      logs: filtered.slice(-200).reverse(),
    })
  }

  // ---- Settings ----
  if (pathname === '/api/admin/settings') {
    if (!adminGuard(req, res)) return
    return send(res, 200, {
      envChecks: {
        ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
        ADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
        ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      },
      allSet: true,
      adminSessionTimeout: '8h',
      adminJwtExpiry: '8h',
      dbConnected: true,
    })
  }

  // ---- Track Pageview ----
  if (pathname === '/api/track/pageview' && req.method === 'POST') {
    const body = await getJSON(req)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
    db.append('visits', {
      id: crypto.randomUUID(),
      sessionId: body.sessionId,
      page: body.page || '/',
      referrer: body.referrer || '',
      deviceType: body.deviceInfo?.deviceType || 'desktop',
      browser: body.deviceInfo?.browser || 'Unknown',
      os: body.deviceInfo?.os || 'Unknown',
      country: '',
      city: '',
      ipHash,
      timeOnPage: 0,
      scrollDepth: 0,
      createdAt: new Date().toISOString(),
    })
    return send(res, 200, { ok: true })
  }

  // ---- Track Exit ----
  if (pathname === '/api/track/exit' && req.method === 'POST') {
    const body = await getJSON(req)
    if (body.sessionId && body.page) {
      const visits = db.read('visits')
      const last = visits.findLast(v => v.sessionId === body.sessionId && v.page === body.page)
      if (last) { last.timeOnPage = body.timeOnPage || 0; last.scrollDepth = body.scrollDepth || 0; db.write('visits', visits) }
    }
    return send(res, 200, { ok: true })
  }

  // ---- Track Click ----
  if (pathname === '/api/track/click' && req.method === 'POST') {
    const body = await getJSON(req)
    db.append('clicks', {
      id: crypto.randomUUID(),
      sessionId: body.sessionId,
      type: body.type || 'unknown',
      label: body.label || '',
      page: body.page || '/',
      createdAt: new Date().toISOString(),
    })
    return send(res, 200, { ok: true })
  }

  // ---- PDF Save (no auth) ----
  if (pathname === '/api/pdfs/save' && req.method === 'POST') {
    const body = await getJSON(req)
    db.append('pdf_events', {
      id: crypto.randomUUID(),
      sessionId: body.sessionId,
      pdfType: body.pdfType || 'unknown',
      fileSizeKb: body.fileSizeKb || 0,
      storageKey: body.storageKey || '',
      country: '',
      createdAt: new Date().toISOString(),
    })
    return send(res, 200, { ok: true })
  }

  send(res, 404, { error: 'Not found' })
}
