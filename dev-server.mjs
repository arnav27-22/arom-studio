import fs from 'fs'
import path from 'path'
import http from 'http'
import { randomUUID, createHash, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'

const PORT = 3001
const DATA_DIR = path.resolve(process.cwd(), 'data')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production'

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
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
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
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  })
  res.end(JSON.stringify(data))
}
function j(res, data) { return send(res, 200, data) }

function verifyAuth(req) {
  const cookies = parseCookies(req)
  try { jwt.verify(cookies.admin_token || '', JWT_SECRET); return true }
  catch { return false }
}

function computeDashboard() {
  const visitors = (dbRead('real_visitors')) || []
  const pdfs = (dbRead('real_pdfs')) || []
  const leads = (dbRead('real_leads')) || []
  const logs = (dbRead('system_logs')) || []
  const aiConversations = (dbRead('real_ai_conversations')) || []
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now - 7 * 86400000).toISOString()
  const monthAgo = new Date(now - 30 * 86400000).toISOString()
  const fiveMinAgo = new Date(now - 5 * 60000).toISOString()

  const todayVisits = visitors.filter(v => v.createdAt?.startsWith(today))
  const weekVisits = visitors.filter(v => v.createdAt >= weekAgo)
  const monthVisits = visitors.filter(v => v.createdAt >= monthAgo)

  const pageCounts = {}
  visitors.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1 })
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '/'

  const activeSessions = new Set(visitors.filter(v => v.createdAt >= fiveMinAgo).map(v => v.sessionId)).size
  const deviceBreakdown = {}
  visitors.forEach(v => { deviceBreakdown[v.deviceType || 'desktop'] = (deviceBreakdown[v.deviceType || 'desktop'] || 0) + 1 })
  const browserBreakdown = {}
  visitors.forEach(v => { browserBreakdown[v.browser || 'Unknown'] = (browserBreakdown[v.browser || 'Unknown'] || 0) + 1 })
  const countryCounts = {}
  visitors.forEach(v => { if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1 })
  const cityCounts = {}
  visitors.forEach(v => { if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1 })
  const dailyVisits = {}
  visitors.forEach(v => { if (v.createdAt) { const d = v.createdAt.slice(0, 10); dailyVisits[d] = (dailyVisits[d] || 0) + 1 } })
  const returningCount = visitors.filter(v => v.isReturning).length
  const bounceCount = visitors.filter(v => v.isBounce).length

  return {
    visitors: {
      total: visitors.length, today: todayVisits.length, thisWeek: weekVisits.length,
      thisMonth: monthVisits.length, activeSessions, returning: returningCount,
      new: visitors.length - returningCount,
      bounceRate: visitors.length ? Math.round((bounceCount / visitors.length) * 100) : 0,
      topPage, deviceBreakdown, browserBreakdown, countryCounts, cityCounts, dailyVisits,
    },
    pdfs: {
      total: pdfs.length,
      today: pdfs.filter(p => p.createdAt?.startsWith(today)).length,
      avgSize: pdfs.length ? Math.round(pdfs.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / pdfs.length) : 0,
    },
    leads: { total: leads.length, new: leads.filter(l => l.status === 'New').length },
    ai: {
      totalConversations: aiConversations.length,
      today: aiConversations.filter(a => (a.lastActiveAt || a.createdAt)?.startsWith(today)).length,
      totalMessages: aiConversations.reduce((sum, c) => sum + (Array.isArray(c.messages) ? c.messages.length : 0), 0),
    },
    activity: {
      recent: [...logs, ...visitors.slice(-5)].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10),
    },
  }
}

function computeAnalytics() {
  const visits = dbRead('real_visitors') || []
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
  const sessionPages = {}
  visits.forEach(v => { if (!sessionPages[v.sessionId]) sessionPages[v.sessionId] = new Set(); sessionPages[v.sessionId].add(v.page) })
  const singlePageSessions = new Set(Object.entries(sessionPages).filter(([, s]) => s.size <= 1).map(([sid]) => sid))
  const hourlyTraffic = Array.from({ length: 7 }, () => Array(24).fill(0))
  visits.forEach(v => { const d = new Date(v.createdAt); if (hourlyTraffic[d.getDay()]) hourlyTraffic[d.getDay()][d.getHours()]++ })

  return {
    pages: Object.entries(pages).map(([path, data]) => ({
      page: path, views: data.views, avgTime: data.views > 0 ? Math.round(data.totalTime / data.views) : 0,
      avgScroll: data.views > 0 ? Math.round(data.totalScroll / data.views) : 0,
      entries: data.entries, exits: data.exits,
      topReferrers: Object.entries(data.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5),
    })),
    totalUniqueSessions: uniqueSessions.size,
    overallBounceRate: uniqueSessions.size > 0 ? Math.round((singlePageSessions.size / uniqueSessions.size) * 100) : 0,
    hourlyTraffic,
  }
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, {})
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'

  if (pathname === '/api/ping') return j(res, { ok: true, timestamp: new Date().toISOString() })

  // Auth
  if (pathname === '/api/admin/auth') {
    if (req.method === 'GET') {
      try { jwt.verify(parseCookies(req).admin_token || '', JWT_SECRET); return j(res, { authenticated: true }) }
      catch { return j(res, { authenticated: false }) }
    }
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'login') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'Too many attempts. Try again later.' })
        const bufA = Buffer.from(body.password || ''), bufB = Buffer.from(ADMIN_PASSWORD)
        let match = bufA.length === bufB.length
        if (match) match = timingSafeEqual(bufA, bufB)
        if (!match) { recordFailure(ip); return send(res, 401, { error: 'Incorrect password' }) }
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' })
        res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`)
        return j(res, { success: true })
      }
      if (body.action === 'logout') {
        res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0')
        return j(res, { success: true })
      }
    }
    return send(res, 400, { error: 'Invalid' })
  }

  // Require auth for all /api/admin/ routes (except auth itself)
  if (pathname.startsWith('/api/admin/')) {
    try { jwt.verify(parseCookies(req).admin_token || '', JWT_SECRET) }
    catch { return send(res, 401, { error: 'Unauthorized' }) }
  }

  // Dashboard
  if (pathname === '/api/admin/dashboard') return j(res, computeDashboard())
  if (pathname === '/api/admin/statistics') return j(res, computeDashboard())

  // Analytics
  if (pathname === '/api/admin/analytics') return j(res, computeAnalytics())

  // Visitors
  if (pathname === '/api/admin/visitors') {
    if (req.method === 'DELETE') { dbWrite('real_visitors', []); return j(res, { success: true }) }
    const visits = dbRead('real_visitors') || []
    return j(res, { total: visits.length, visitors: visits.reverse() })
  }

  // PDFs
  if (pathname === '/api/admin/pdfs') {
    const pdfs = dbRead('real_pdfs') || []
    return j(res, { total: pdfs.length, pdfs: pdfs.reverse() })
  }
  if (pathname.startsWith('/api/admin/pdfs/') && req.method === 'DELETE') {
    const pdfId = pathname.split('/').pop()
    let pdfs = dbRead('real_pdfs') || []
    pdfs = pdfs.filter(p => p.id !== pdfId)
    dbWrite('real_pdfs', pdfs)
    return j(res, { success: true })
  }

  // Leads
  if (pathname === '/api/admin/leads') {
    const leads = dbRead('real_leads') || []
    if (req.method === 'PUT') {
      const body = await getJSON(req)
      const idx = leads.findIndex(l => l.id === body.id)
      if (idx !== -1) { leads[idx].status = body.status || leads[idx].status; dbWrite('real_leads', leads); return j(res, { success: true }) }
      return send(res, 404, { error: 'Not found' })
    }
    return j(res, { total: leads.length, leads: leads.reverse() })
  }

  // AI Conversations
  if (pathname === '/api/admin/ai/conversations') {
    const convs = dbRead('real_ai_conversations') || []
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'delete') { dbWrite('real_ai_conversations', convs.filter(c => c.id !== body.id)); return j(res, { success: true }) }
      if (body.action === 'rename') { const t = convs.find(c => c.id === body.id); if (t) t.title = body.title; dbWrite('real_ai_conversations', convs); return j(res, { success: true }) }
      if (body.action === 'save') {
        const idx = convs.findIndex(c => c.id === body.data?.id)
        if (idx !== -1) convs[idx] = body.data; else convs.unshift(body.data)
        dbWrite('real_ai_conversations', convs)
        return j(res, { success: true })
      }
    }
    if (req.method === 'DELETE') { const b = await getJSON(req); dbWrite('real_ai_conversations', convs.filter(c => c.id !== b.id)); return j(res, { success: true }) }
    return j(res, { total: convs.length, conversations: convs.reverse() })
  }

  // AI Knowledge
  if (pathname === '/api/admin/ai/knowledge') {
    const knowledge = dbRead('real_ai_knowledge') || []
    if (req.method === 'POST') { const b = await getJSON(req); dbWrite('real_ai_knowledge', b.items || []); return j(res, { success: true }) }
    return j(res, { items: knowledge })
  }

  // Overview (legacy)
  if (pathname === '/api/admin/overview') {
    const s = computeDashboard()
    return j(res, {
      todayVisits: s.visitors.today, weekVisits: s.visitors.thisWeek, monthVisits: s.visitors.thisMonth,
      allTimeVisits: s.visitors.total, activeSessions: s.visitors.activeSessions,
      totalPDFs: s.pdfs.total, todayPDFs: s.pdfs.today, totalLeads: s.leads.total,
      topPage: s.visitors.topPage, recentEvents: s.activity.recent,
    })
  }

  // Logs
  if (pathname === '/api/admin/logs') { const logs = dbRead('system_logs') || []; return j(res, { total: logs.length, logs: logs.reverse() }) }

  // Settings
  if (pathname === '/api/admin/settings') return j(res, { envChecks: { ADMIN_PASSWORD: true, ADMIN_JWT_SECRET: true }, allSet: true, adminSessionTimeout: '8h' })

  // Activity
  if (pathname === '/api/admin/activity') { const s = computeDashboard(); return j(res, { events: s.activity.recent }) }

  // Recycle Bin
  if (pathname === '/api/admin/recycle') {
    const bin = dbRead('real_recycle_bin') || []
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'restore') {
        const record = bin.find(r => r.id === body.id)
        if (record) {
          const collMap = { visitors: 'real_visitors', pdfs: 'real_pdfs', leads: 'real_leads', clients: 'real_clients', projects: 'real_projects', proposals: 'real_proposals', agreements: 'real_agreements', payments: 'real_payments', blogs: 'real_blogs' }
          const dbName = collMap[record.originalCollection] || `real_${record.originalCollection}`
          const coll = dbRead(dbName)
          const exists = coll.some(i => i.id === record.itemData?.id)
          if (!exists && record.itemData) { coll.unshift(record.itemData); dbWrite(dbName, coll) }
          dbWrite('real_recycle_bin', bin.filter(r => r.id !== body.id))
        }
        return j(res, { success: true })
      }
      if (body.action === 'permanent_delete') { const ids = Array.isArray(body.ids) ? body.ids : [body.id]; dbWrite('real_recycle_bin', bin.filter(r => !ids.includes(r.id))); return j(res, { success: true }) }
      if (body.action === 'empty') { dbWrite('real_recycle_bin', []); return j(res, { success: true }) }
    }
    return j(res, { total: bin.length, items: bin.reverse() })
  }

  // Sync (legacy)
  if (pathname === '/api/sync') {
    if (req.method === 'GET') {
      const visitors = dbRead('real_visitors') || []
      const collections = ['real_pdfs', 'real_leads', 'real_invoices', 'system_logs', 'real_clients', 'real_projects', 'real_proposals', 'real_agreements', 'real_payments', 'real_content', 'real_assets', 'real_approvals', 'real_timelines', 'real_handovers', 'real_feedbacks', 'real_notifications', 'real_recycle_bin', 'real_discovery', 'real_blogs', 'real_ai_conversations']
      const results = {}
      for (const c of collections) { results[c] = dbRead(c) || [] }
      return j(res, {
        visitors, pdfs: results.real_pdfs, leads: results.real_leads, invoices: results.real_invoices,
        logs: results.system_logs, clients: results.real_clients.length ? results.real_clients : undefined,
        projects: results.real_projects.length ? results.real_projects : undefined,
        proposals: results.real_proposals.length ? results.real_proposals : undefined,
        agreements: results.real_agreements.length ? results.real_agreements : undefined,
        payments: results.real_payments.length ? results.real_payments : undefined,
        content: results.real_content.length ? results.real_content : undefined,
        assets: results.real_assets.length ? results.real_assets : undefined,
        approvals: results.real_approvals.length ? results.real_approvals : undefined,
        timelines: results.real_timelines.length ? results.real_timelines : undefined,
        handovers: results.real_handovers.length ? results.real_handovers : undefined,
        feedbacks: results.real_feedbacks.length ? results.real_feedbacks : undefined,
        notifications: results.real_notifications.length ? results.real_notifications : undefined,
        discoveryQuestionnaires: results.real_discovery,
        recycleBin: results.real_recycle_bin,
        blogs: results.real_blogs,
        aiConversations: results.real_ai_conversations,
      })
    }
    if (req.method === 'POST') {
      const body = await getJSON(req)
      const action = body.action || body.type
      const item = body.data || body
      const collections = { visit: 'real_visitors', pdf: 'real_pdfs', lead: 'real_leads', invoice: 'real_invoices', discovery: 'real_discovery', ai_conversation: 'real_ai_conversations' }
      if (collections[action]) {
        const coll = dbRead(collections[action])
        const exists = coll.some(e => e.id === item.id)
        if (!exists) dbAppend(collections[action], item)
        else { const idx = coll.findIndex(e => e.id === item.id); if (idx !== -1) coll[idx] = item; dbWrite(collections[action], coll) }
      } else if (action === 'save_store' && item) {
        const map = { clients: 'real_clients', projects: 'real_projects', proposals: 'real_proposals', agreements: 'real_agreements', payments: 'real_payments', content: 'real_content', assets: 'real_assets', approvals: 'real_approvals', timelines: 'real_timelines', handovers: 'real_handovers', feedbacks: 'real_feedbacks', notifications: 'real_notifications', discoveryQuestionnaires: 'real_discovery', visitors: 'real_visitors', pdfs: 'real_pdfs', invoices: 'real_invoices', leads: 'real_leads', blogs: 'real_blogs', recycleBin: 'real_recycle_bin', logs: 'system_logs' }
        for (const [k, v] of Object.entries(map)) { if (Array.isArray(item[k])) dbWrite(v, item[k]) }
      }
      return j(res, { success: true })
    }
  }

  // Tracking
  if ((pathname === '/api/track/pageview' || pathname === '/api/track/page-view') && req.method === 'POST') {
    const body = await getJSON(req)
    const ua = req.headers['user-agent'] || ''
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)
    let brand = 'Desktop PC'
    if (/iPhone/i.test(ua)) brand = 'Apple iPhone'
    else if (/Samsung/i.test(ua)) brand = 'Samsung Galaxy'
    else if (/Pixel/i.test(ua)) brand = 'Google Pixel'
    else if (isMobile) brand = 'Mobile Device'
    dbAppend('real_visitors', {
      id: 'v_' + randomUUID().slice(0, 8), sessionId: body.sessionId || 'sess_' + randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(), page: body.page || '/',
      deviceType: isMobile ? 'mobile' : 'desktop', deviceLabel: isMobile ? 'Mobile' : 'Desktop (PC)',
      deviceBrand: brand, browser: body.deviceInfo?.browser || 'Chrome',
      referrer: body.referrer || 'Direct', timeOnPage: 30, scrollDepth: 80, pageViewsCount: 1,
    })
    return j(res, { ok: true })
  }

  if ((pathname === '/api/pdfs/save' || pathname === '/api/track/save-pdf' || pathname === '/api/track/save') && req.method === 'POST') {
    const body = await getJSON(req)
    dbAppend('real_pdfs', {
      id: 'p_' + randomUUID().slice(0, 8), createdAt: new Date().toISOString(),
      pdfType: body.pdfType || 'Document', title: body.title || body.storageKey || 'PDF Document',
      clientName: body.clientName || 'Client', fileSizeKb: body.fileSizeKb || 180,
      deviceType: body.deviceType || 'desktop', browser: body.browser || 'Chrome', os: body.os || 'Windows',
      pdfDataUrl: body.pdfDataUrl || '',
    })
    return j(res, { ok: true })
  }

  if ((pathname === '/api/track/ai-conversation') && req.method === 'POST') {
    const body = await getJSON(req)
    const convs = dbRead('real_ai_conversations') || []
    if (body.action === 'delete') { dbWrite('real_ai_conversations', convs.filter(c => c.id !== body.id)); return j(res, { success: true }) }
    if (body.action === 'rename') { const t = convs.find(c => c.id === body.id); if (t) t.title = body.title; dbWrite('real_ai_conversations', convs); return j(res, { success: true }) }
    if (body.action === 'save' && body.data) {
      const idx = convs.findIndex(c => c.id === body.data?.id)
      if (idx !== -1) convs[idx] = body.data; else convs.unshift(body.data)
      dbWrite('real_ai_conversations', convs)
      return j(res, { success: true })
    }
    return j(res, { ok: true })
  }

  if (pathname.startsWith('/api/track/')) return j(res, { ok: true })

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
  console.log(`  Data dir: ${DATA_DIR}`)
})
