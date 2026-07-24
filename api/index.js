import crypto from 'crypto'
import { db } from './_db.js'
import { requireAuth, verifyToken, signToken, timingSafeEqual, checkRateLimit, recordFailure } from './_auth.js'

function j(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  })
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
  const sectionEndPattern = Buffer.from(`--${boundary}--`)
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

  // Global Sync Endpoint for Cross-Device Synchronization
  if (pathname === '/api/sync') {
    if (req.method === 'GET') {
      const [visitors, pdfs, leads, invoices, logs, clients, projects, proposals, agreements, payments, content, assets, approvals, timelines, handovers, feedbacks, notifications, recycleBin] = await Promise.all([
        db.read('real_visitors'),
        db.read('real_pdfs'),
        db.read('real_leads'),
        db.read('real_invoices'),
        db.read('system_logs'),
        db.read('real_clients'),
        db.read('real_projects'),
        db.read('real_proposals'),
        db.read('real_agreements'),
        db.read('real_payments'),
        db.read('real_content'),
        db.read('real_assets'),
        db.read('real_approvals'),
        db.read('real_timelines'),
        db.read('real_handovers'),
        db.read('real_feedbacks'),
        db.read('real_notifications'),
        db.read('real_recycle_bin'),
        db.read('real_discovery'),
      ])
      return j(res, {
        visitors: visitors || [],
        pdfs: pdfs || [],
        leads: leads || [],
        invoices: invoices || [],
        logs: logs || [],
        clients: clients.length ? clients : undefined,
        projects: projects.length ? projects : undefined,
        proposals: proposals.length ? proposals : undefined,
        agreements: agreements.length ? agreements : undefined,
        payments: payments.length ? payments : undefined,
        content: content.length ? content : undefined,
        assets: assets.length ? assets : undefined,
        approvals: approvals.length ? approvals : undefined,
        timelines: timelines.length ? timelines : undefined,
        handovers: handovers.length ? handovers : undefined,
        feedbacks: feedbacks.length ? feedbacks : undefined,
        notifications: notifications.length ? notifications : undefined,
        discoveryQuestionnaires: discovery || [],
        recycleBin: recycleBin || [],
      })
    }

    if (req.method === 'POST') {
      const body = await getJSON(req)
      const action = body.action || body.type
      const item = body.data || body

      if (action === 'visit') {
        const visits = await db.read('real_visitors')
        if (!visits.some(v => v.id === item.id)) {
          await db.append('real_visitors', item)
        }
      } else if (action === 'pdf') {
        const pdfs = await db.read('real_pdfs')
        if (!pdfs.some(p => p.id === item.id)) {
          await db.append('real_pdfs', item)
        }
      } else if (action === 'lead') {
        const leads = await db.read('real_leads')
        if (!leads.some(l => l.id === item.id)) {
          await db.append('real_leads', item)
        }
      } else if (action === 'invoice') {
        const invoices = await db.read('real_invoices')
        if (!invoices.some(i => i.id === item.id)) {
          await db.append('real_invoices', item)
        }
      } else if (action === 'discovery') {
        const discovery = await db.read('real_discovery')
        if (!discovery.some(d => d.id === item.id)) {
          await db.append('real_discovery', item)
        }
      } else if (action === 'save_store' && item) {
        if (Array.isArray(item.clients)) await db.write('real_clients', item.clients)
        if (Array.isArray(item.projects)) await db.write('real_projects', item.projects)
        if (Array.isArray(item.proposals)) await db.write('real_proposals', item.proposals)
        if (Array.isArray(item.agreements)) await db.write('real_agreements', item.agreements)
        if (Array.isArray(item.payments)) await db.write('real_payments', item.payments)
        if (Array.isArray(item.content)) await db.write('real_content', item.content)
        if (Array.isArray(item.assets)) await db.write('real_assets', item.assets)
        if (Array.isArray(item.approvals)) await db.write('real_approvals', item.approvals)
        if (Array.isArray(item.timelines)) await db.write('real_timelines', item.timelines)
        if (Array.isArray(item.handovers)) await db.write('real_handovers', item.handovers)
        if (Array.isArray(item.feedbacks)) await db.write('real_feedbacks', item.feedbacks)
        if (Array.isArray(item.notifications)) await db.write('real_notifications', item.notifications)
        if (Array.isArray(item.discoveryQuestionnaires)) await db.write('real_discovery', item.discoveryQuestionnaires)
        if (Array.isArray(item.visitors)) await db.write('real_visitors', item.visitors)
        if (Array.isArray(item.pdfs)) await db.write('real_pdfs', item.pdfs)
        if (Array.isArray(item.invoices)) await db.write('real_invoices', item.invoices)
        if (Array.isArray(item.leads)) await db.write('real_leads', item.leads)
        if (Array.isArray(item.recycleBin)) await db.write('real_recycle_bin', item.recycleBin)
      } else if (action === 'save_entity' && body.entity && body.data) {
        await db.write(`real_${body.entity}`, body.data)
      }
      return j(res, { success: true })
    }
  }

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
    const visits = await db.read('real_visitors')
    const pdfs = await db.read('real_pdfs')
    const leads = await db.read('real_leads')
    const logs = await db.read('system_logs')
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
      activeSessions: new Set(visits.filter(v => v.createdAt >= fiveMinAgo).map(v => v.id)).size,
      totalPDFs: pdfs.length, todayPDFs: pdfs.filter(p => p.createdAt?.startsWith(today)).length, totalLeads: leads.length,
      topPage, recentEvents: recent,
    })
  }

  // Visitors
  if (pathname === '/api/admin/visitors') {
    if (req.method === 'DELETE') { await db.write('real_visitors', []); return j(res, { success: true }) }
    const visits = await db.read('real_visitors')
    const deviceB = {}; visits.forEach(v => { deviceB[v.deviceType] = (deviceB[v.deviceType] || 0) + 1 })
    const countryC = {}; visits.forEach(v => { if (v.country) countryC[v.country] = (countryC[v.country] || 0) + 1 })
    return j(res, { total: visits.length, allTime: visits.length, visits: visits.reverse(), dailyChart: [], deviceBreakdown: deviceB, countryCounts: countryC })
  }

  // PDFs
  if (pathname === '/api/admin/pdfs') {
    const pdfs = await db.read('real_pdfs')
    return j(res, { total: pdfs.length, pdfs: pdfs.reverse(), avgSize: pdfs.length ? Math.round(pdfs.reduce((s, e) => s + (e.fileSizeKb || 0), 0) / pdfs.length) : 0 })
  }

  // Leads
  if (pathname === '/api/admin/leads') {
    const leads = await db.read('real_leads')
    return j(res, { total: leads.length, leads: leads.reverse() })
  }

  // Track pageview
  if (pathname === '/api/track/pageview' && req.method === 'POST') {
    const body = await getJSON(req)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || req.socket.remoteAddress || '103.15.22.84'
    const ua = req.headers['user-agent'] || ''
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)
    const isTablet = /Tablet|iPad/i.test(ua) && !/Mobi/i.test(ua)

    let brand = 'Desktop PC'
    if (/iPhone/i.test(ua)) brand = 'Apple iPhone'
    else if (/iPad/i.test(ua)) brand = 'Apple iPad'
    else if (/Samsung/i.test(ua)) brand = 'Samsung Galaxy'
    else if (/Pixel/i.test(ua)) brand = 'Google Pixel'
    else if (/OnePlus/i.test(ua)) brand = 'OnePlus'
    else if (/Xiaomi|Redmi|POCO/i.test(ua)) brand = 'Xiaomi/Redmi'
    else if (/Vivo/i.test(ua)) brand = 'Vivo Mobile'
    else if (/Oppo/i.test(ua)) brand = 'OPPO Mobile'
    else if (isMobile) brand = 'Mobile Device'

    const deviceTypeLabel = isTablet ? 'Mobile (Tablet)' : isMobile ? 'Mobile' : 'Desktop (PC)'

    const newVisit = {
      id: body.id || ('v_' + Math.random().toString(36).slice(2, 9)),
      sessionId: body.sessionId || ('sess_' + Math.random().toString(36).slice(2, 9)),
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      page: body.page || '/',
      entryPage: body.entryPage || body.page || '/',
      deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      deviceLabel: deviceTypeLabel,
      deviceBrand: brand,
      network: req.headers['x-vercel-ip-country-region'] || 'Mobile 5G / Broadband',
      browser: body.deviceInfo?.browser || (ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Browser'),
      country: req.headers['x-vercel-ip-country'] || 'India',
      city: req.headers['x-vercel-ip-city'] || 'Mumbai',
      ip: clientIp,
      referrer: body.referrer || 'Direct',
      timeOnPage: 30,
      scrollDepth: 80,
      pageViewsCount: body.pageViewsCount || 1,
    }
    await db.append('real_visitors', newVisit)
    return j(res, { ok: true, visit: newVisit })
  }

  // Track PDF Save
  if (pathname === '/api/pdfs/save' && req.method === 'POST') {
    const body = await getJSON(req)
    const newPdf = {
      id: body.id || ('p_' + Math.random().toString(36).slice(2, 9)),
      createdAt: new Date().toISOString(),
      pdfType: body.pdfType || 'Document',
      title: body.title || body.storageKey || 'PDF Document',
      clientName: body.clientName || 'Client',
      clientEmail: body.clientEmail || '',
      fileSizeKb: body.fileSizeKb || 180,
      deviceType: body.deviceType || 'desktop',
      browser: body.browser || 'Chrome',
      os: body.os || 'Windows',
      pdfDataUrl: body.pdfDataUrl || '',
    }
    await db.append('real_pdfs', newPdf)
    return j(res, { ok: true, pdf: newPdf })
  }

  // Ping
  if (pathname === '/api/ping') return j(res, { ok: true })

  return send(res, 404, { error: 'Not found' })
}
