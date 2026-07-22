import fs from 'fs'
import path from 'path'
import http from 'http'
import { randomUUID, createHash, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'

const PORT = 3001
const DATA_DIR = path.resolve(process.cwd(), 'data')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ARNAVOM272213'
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-jwt-secret-change-in-production-32chars!!'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-enc-key-32chars!!change-me!'

function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }) }

function dbRead(name) {
  ensureDir()
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), 'utf-8')) }
  catch { return [] }
}

function dbWrite(name, data) {
  ensureDir()
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2))
}

function dbAppend(name, item) {
  const all = dbRead(name)
  all.push(item)
  dbWrite(name, all)
}

const FAIL_ATTEMPTS = new Map()

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

function parseCookies(req) {
  const cookies = {}
  ;(req.headers.cookie || '').split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=')
    if (k) cookies[k.trim()] = v.join('=')
  })
  return cookies
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' })
  res.end(JSON.stringify(data))
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, {})

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'

  // Auth
  if (pathname === '/api/admin/auth') {
    if (req.method === 'GET') {
      const cookies = parseCookies(req)
      try { jwt.verify(cookies.admin_token || '', JWT_SECRET); return send(res, 200, { authenticated: true }) }
      catch { return send(res, 200, { authenticated: false }) }
    }
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'login') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'Too many attempts. Try again later.' })
        const bufA = Buffer.from(body.password || '')
        const bufB = Buffer.from(ADMIN_PASSWORD)
        let match = bufA.length === bufB.length
        if (match) match = timingSafeEqual(bufA, bufB)
        if (!match) { recordFailure(ip); return send(res, 401, { error: 'Incorrect password' }) }
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
        res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=28800`)
        return send(res, 200, { success: true })
      }
      if (body.action === 'logout') {
        res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0')
        return send(res, 200, { success: true })
      }
    }
    return send(res, 400, { error: 'Invalid' })
  }

  // Require auth for all /api/admin/ routes
  if (pathname.startsWith('/api/admin/')) {
    const cookies = parseCookies(req)
    try { jwt.verify(cookies.admin_token || '', JWT_SECRET) }
    catch { return send(res, 401, { error: 'Unauthorized' }) }
  }

  // Overview
  if (pathname === '/api/admin/overview') {
    const visits = dbRead('visits')
    const pdfs = dbRead('pdf_events')
    const leads = dbRead('form_submissions')
    const logs = dbRead('system_logs')
    const now = Date.now()
    const today = new Date().toISOString().slice(0, 10)

    const pageCounts = {}
    visits.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

    const activeSessions = new Set(visits.filter(v => now - new Date(v.createdAt).getTime() < 300000).map(v => v.sessionId)).size

    return send(res, 200, {
      todayVisits: visits.filter(v => v.createdAt?.startsWith(today)).length,
      weekVisits: visits.filter(v => v.createdAt >= new Date(Date.now() - 7 * 86400000).toISOString()).length,
      monthVisits: visits.filter(v => v.createdAt >= new Date(Date.now() - 30 * 86400000).toISOString()).length,
      allTimeVisits: visits.length,
      activeSessions,
      totalPDFs: pdfs.length,
      todayPDFs: pdfs.filter(p => p.createdAt?.startsWith(today)).length,
      totalLeads: leads.length,
      topPage,
      recentEvents: [...logs, ...visits.slice(-5)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    })
  }

  // Visitors
  if (pathname === '/api/admin/visitors') {
    const visits = dbRead('visits')
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const dayVisits = visits.filter(v => v.createdAt?.startsWith(d))
      return { date: d, visits: dayVisits.length, unique: new Set(dayVisits.map(v => v.sessionId)).size }
    }).reverse()

    const deviceBreakdown = {}
    visits.forEach(v => { deviceBreakdown[v.deviceType] = (deviceBreakdown[v.deviceType] || 0) + 1 })

    return send(res, 200, { total: visits.length, allTime: visits.length, visits: visits.slice(-200).reverse(), dailyChart: last30, deviceBreakdown, countryCounts: {} })
  }

  // PDFs
  if (pathname === '/api/admin/pdfs') {
    const pdfs = dbRead('pdf_events')
    const byDay = {}
    pdfs.forEach(e => {
      const day = e.createdAt?.slice(0, 10)
      if (!day) return
      if (!byDay[day]) byDay[day] = { count: 0, totalSize: 0 }
      byDay[day].count++
      byDay[day].totalSize += e.fileSizeKb || 0
    })
    return send(res, 200, { total: pdfs.length, pdfs: pdfs.slice(-100).reverse(), byDay, avgSize: pdfs.length > 0 ? Math.round(pdfs.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / pdfs.length) : 0 })
  }

  // Leads
  if (pathname === '/api/admin/leads') {
    const leads = dbRead('form_submissions')
    if (req.method === 'PUT') {
      const body = await getJSON(req)
      const idx = leads.findIndex(l => l.id === body.id)
      if (idx !== -1) { leads[idx].status = body.status || leads[idx].status; dbWrite('form_submissions', leads); return send(res, 200, { success: true }) }
      return send(res, 404, { error: 'Not found' })
    }
    if (url.searchParams.get('view') === 'full' && url.searchParams.get('id')) {
      const lead = leads.find(l => l.id === url.searchParams.get('id'))
      return send(res, 200, lead || { error: 'Not found' })
    }
    const byService = {}
    leads.forEach(l => { const s = l.service || 'Unknown'; byService[s] = (byService[s] || 0) + 1 })
    return send(res, 200, { total: leads.length, leads: leads.slice(-100).reverse().map(l => ({ ...l, email: '***' })), byService })
  }

  // Analytics
  if (pathname === '/api/admin/analytics') {
    const visits = dbRead('visits')
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
    Object.entries(sessionPages).forEach(([, pagesSet]) => { if (pagesSet.size <= 1) singlePageSessions.add(sid) })

    const hourlyTraffic = Array.from({ length: 7 }, () => Array(24).fill(0))
    visits.forEach(v => { const d = new Date(v.createdAt); if (hourlyTraffic[d.getDay()]) hourlyTraffic[d.getDay()][d.getHours()]++ })

    return send(res, 200, {
      pages: Object.entries(pages).map(([path, data]) => ({ page: path, views: data.views, uniqueSessions: 0, avgTime: data.views > 0 ? Math.round(data.totalTime / data.views) : 0, avgScroll: data.views > 0 ? Math.round(data.totalScroll / data.views) : 0, bounceRate: 0, entries: data.entries, exits: data.exits, topReferrers: Object.entries(data.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5) })),
      totalUniqueSessions: uniqueSessions.size,
      overallBounceRate: 0,
      hourlyTraffic,
    })
  }

  // Clicks
  if (pathname === '/api/admin/clicks') {
    const clicks = dbRead('clicks')
    const byLabel = {}
    clicks.forEach(c => { byLabel[c.label || c.type] = (byLabel[c.label || c.type] || 0) + 1 })
    return send(res, 200, { total: clicks.length, clicks: clicks.slice(-200).reverse(), byLabel })
  }

  // Logs
  if (pathname === '/api/admin/logs') {
    const logs = dbRead('system_logs')
    return send(res, 200, { total: logs.length, logs: logs.slice(-200).reverse() })
  }

  // Settings
  if (pathname === '/api/admin/settings') {
    return send(res, 200, { envChecks: { ADMIN_PASSWORD: true, ADMIN_JWT_SECRET: true, ENCRYPTION_KEY: true }, allSet: true, adminSessionTimeout: '8h', adminJwtExpiry: '8h' })
  }

  // Tracking endpoints
  if (pathname === '/api/track/pageview' && req.method === 'POST') {
    const body = await getJSON(req)
    const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)
    dbAppend('visits', { id: randomUUID(), sessionId: body.sessionId, page: body.page || '/', referrer: body.referrer || '', deviceType: body.deviceInfo?.deviceType || 'desktop', browser: body.deviceInfo?.browser || 'Unknown', os: body.deviceInfo?.os || 'Unknown', country: '', city: '', ipHash, timeOnPage: 0, scrollDepth: 0, createdAt: new Date().toISOString() })
    return send(res, 200, { ok: true })
  }

  if (pathname === '/api/track/exit' && req.method === 'POST') {
    const body = await getJSON(req)
    if (body.sessionId && body.page) {
      const visits = dbRead('visits')
      const last = visits.findLast(v => v.sessionId === body.sessionId && v.page === body.page)
      if (last) { last.timeOnPage = body.timeOnPage || 0; last.scrollDepth = body.scrollDepth || 0; dbWrite('visits', visits) }
    }
    return send(res, 200, { ok: true })
  }

  if (pathname === '/api/track/click' && req.method === 'POST') {
    const body = await getJSON(req)
    dbAppend('clicks', { id: randomUUID(), sessionId: body.sessionId, type: body.type || 'unknown', label: body.label || '', page: body.page || '/', createdAt: new Date().toISOString() })
    return send(res, 200, { ok: true })
  }

  // Save PDF (no auth required - called from client)
  if (pathname === '/api/pdfs/save' && req.method === 'POST') {
    const body = await getJSON(req)
    dbAppend('pdf_events', { id: randomUUID(), sessionId: body.sessionId, pdfType: body.pdfType || 'unknown', fileSizeKb: body.fileSizeKb || 0, storageKey: body.storageKey || '', country: '', createdAt: new Date().toISOString() })
    return send(res, 200, { ok: true })
  }

  send(res, 404, { error: 'Not found' })
}

function checkRateLimit(ip) {
  const entry = FAIL_ATTEMPTS.get(ip)
  if (entry && entry.until > Date.now()) return false
  if (entry && entry.until <= Date.now()) FAIL_ATTEMPTS.delete(ip)
  return true
}

function recordFailure(ip) {
  const entry = FAIL_ATTEMPTS.get(ip) || { count: 0, until: 0 }
  entry.count += 1
  if (entry.count >= 5) entry.until = Date.now() + 15 * 60 * 1000
  FAIL_ATTEMPTS.set(ip, entry)
}

const server = http.createServer(handler)
server.listen(PORT, () => {
  console.log(`\x1b[36m[Arom Admin Dev Server]\x1b[0m running on http://localhost:${PORT}`)
  console.log(`  API routes: /api/admin/*, /api/track/*, /api/pdfs/*`)
  console.log(`  Data dir: ${DATA_DIR}`)
  console.log(`  Admin password: \x1b[33m${ADMIN_PASSWORD}\x1b[0m`)
})
