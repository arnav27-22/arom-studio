import crypto from 'crypto'
import { db } from './_db.js'
import { requireAuth, verifyToken, signToken, timingSafeEqual, checkRateLimit, recordFailure, getPassword, verifyAdminPassword } from './_auth.js'
import { computeDashboard, computeAnalytics } from './stats.js'

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

  if (pathname === '/api/ping') return j(res, { ok: true, timestamp: new Date().toISOString() })

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
        if (!verifyAdminPassword(body.password)) {
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

  // Require auth for all /api/admin/ routes (except auth itself)
  if (pathname.startsWith('/api/admin/')) {
    const cookies = parseCookies(req)
    if (!cookies.admin_token || !verifyToken(cookies.admin_token)) {
      return send(res, 401, { error: 'Unauthorized' })
    }
  }

  // ====== ADMIN DASHBOARD ======
  if (pathname === '/api/admin/dashboard') {
    const stats = await computeDashboard()
    return j(res, stats)
  }

  // ====== ADMIN STATISTICS ======
  if (pathname === '/api/admin/statistics') {
    const stats = await computeDashboard()
    return j(res, stats)
  }

  // ====== ADMIN ANALYTICS ======
  if (pathname === '/api/admin/analytics') {
    const analytics = await computeAnalytics()
    return j(res, analytics)
  }

  // ====== ADMIN VISITORS ======
  if (pathname === '/api/admin/visitors') {
    if (req.method === 'DELETE') {
      await db.write('real_visitors', [])
      return j(res, { success: true })
    }
    const visits = (await db.read('real_visitors')) || []
    return j(res, { total: visits.length, visitors: visits.reverse() })
  }

  // ====== ADMIN PDFS ======
  if (pathname === '/api/admin/pdfs') {
    const pdfs = (await db.read('real_pdfs')) || []
    return j(res, { total: pdfs.length, pdfs: pdfs.reverse() })
  }

  if (pathname.startsWith('/api/admin/pdfs/') && req.method === 'DELETE') {
    const pdfId = pathname.split('/').pop()
    let pdfs = (await db.read('real_pdfs')) || []
    pdfs = pdfs.filter(p => p.id !== pdfId)
    await db.write('real_pdfs', pdfs)
    return j(res, { success: true })
  }

  // ====== ADMIN LEADS ======
  if (pathname === '/api/admin/leads') {
    const leads = (await db.read('real_leads')) || []
    if (req.method === 'PUT') {
      const body = await getJSON(req)
      const idx = leads.findIndex(l => l.id === body.id)
      if (idx !== -1) { leads[idx].status = body.status || leads[idx].status; await db.write('real_leads', leads); return j(res, { success: true }) }
      return send(res, 404, { error: 'Not found' })
    }
    return j(res, { total: leads.length, leads: leads.reverse() })
  }

  // ====== ADMIN AI CONVERSATIONS ======
  if (pathname === '/api/admin/ai/conversations') {
    const convs = (await db.read('real_ai_conversations')) || []
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'delete') {
        const filtered = convs.filter(c => c.id !== body.id)
        await db.write('real_ai_conversations', filtered)
        return j(res, { success: true })
      }
      if (body.action === 'rename') {
        const target = convs.find(c => c.id === body.id)
        if (target) { target.title = body.title; await db.write('real_ai_conversations', convs) }
        return j(res, { success: true })
      }
      if (body.action === 'save') {
        const idx = convs.findIndex(c => c.id === body.data?.id)
        if (idx !== -1) convs[idx] = body.data
        else convs.unshift(body.data)
        await db.write('real_ai_conversations', convs)
        return j(res, { success: true })
      }
    }
    if (req.method === 'DELETE') {
      const body = await getJSON(req)
      const filtered = convs.filter(c => c.id !== body.id)
      await db.write('real_ai_conversations', filtered)
      return j(res, { success: true })
    }
    return j(res, { total: convs.length, conversations: convs.reverse() })
  }

  // ====== ADMIN AI KNOWLEDGE ======
  if (pathname === '/api/admin/ai/knowledge') {
    const knowledge = (await db.read('real_ai_knowledge')) || []
    if (req.method === 'POST') {
      const body = await getJSON(req)
      await db.write('real_ai_knowledge', body.items || [])
      return j(res, { success: true })
    }
    return j(res, { items: knowledge })
  }

  // ====== ADMIN OVERVIEW (legacy) ======
  if (pathname === '/api/admin/overview') {
    const stats = await computeDashboard()
    return j(res, {
      todayVisits: stats.visitors.today,
      weekVisits: stats.visitors.thisWeek,
      monthVisits: stats.visitors.thisMonth,
      allTimeVisits: stats.visitors.total,
      activeSessions: stats.visitors.activeSessions,
      totalPDFs: stats.pdfs.total,
      todayPDFs: stats.pdfs.today,
      totalLeads: stats.leads.total,
      topPage: stats.visitors.topPage,
      recentEvents: stats.activity.recent,
    })
  }

  // ====== ADMIN LOGS ======
  if (pathname === '/api/admin/logs') {
    const logs = (await db.read('system_logs')) || []
    return j(res, { total: logs.length, logs: logs.reverse() })
  }

  // ====== ADMIN SETTINGS ======
  if (pathname === '/api/admin/settings') {
    return j(res, {
      envChecks: { ADMIN_PASSWORD: true, ADMIN_JWT_SECRET: true },
      allSet: true,
      adminSessionTimeout: '8h',
    })
  }

  // ====== ADMIN ACTIVITY ======
  if (pathname === '/api/admin/activity') {
    const stats = await computeDashboard()
    return j(res, { events: stats.activity.recent })
  }

  // ====== ADMIN RECYCLE BIN ======
  if (pathname === '/api/admin/recycle') {
    const bin = (await db.read('real_recycle_bin')) || []
    if (req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'restore') {
        const record = bin.find(r => r.id === body.id)
        if (record) {
          const collection = record.originalCollection
          const collMap = {
            visitors: 'real_visitors', pdfs: 'real_pdfs', leads: 'real_leads',
            clients: 'real_clients', projects: 'real_projects', proposals: 'real_proposals',
            agreements: 'real_agreements', payments: 'real_payments', blogs: 'real_blogs',
          }
          const dbName = collMap[collection] || `real_${collection}`
          const coll = (await db.read(dbName)) || []
          const exists = coll.some(i => i.id === record.itemData?.id)
          if (!exists && record.itemData) {
            coll.unshift(record.itemData)
            await db.write(dbName, coll)
          }
          const updated = bin.filter(r => r.id !== body.id)
          await db.write('real_recycle_bin', updated)
        }
        return j(res, { success: true })
      }
      if (body.action === 'permanent_delete') {
        const ids = Array.isArray(body.ids) ? body.ids : [body.id]
        const updated = bin.filter(r => !ids.includes(r.id))
        await db.write('real_recycle_bin', updated)
        return j(res, { success: true })
      }
      if (body.action === 'empty') {
        await db.write('real_recycle_bin', [])
        return j(res, { success: true })
      }
    }
    return j(res, { total: bin.length, items: bin.reverse() })
  }

  // ====== SYNC ENDPOINT (legacy, for backward compatibility) ======
  if (pathname === '/api/sync') {
    if (req.method === 'GET') {
      const visitors = (await db.read('real_visitors')) || []
      const [pdfs, leads, invoices, logs, clients, projects, proposals, agreements, payments, content, assets, approvals, timelines, handovers, feedbacks, notifications, recycleBin, discovery, blogs, aiConversations] = await Promise.all([
        db.read('real_pdfs'), db.read('real_leads'), db.read('real_invoices'), db.read('system_logs'),
        db.read('real_clients'), db.read('real_projects'), db.read('real_proposals'), db.read('real_agreements'),
        db.read('real_payments'), db.read('real_content'), db.read('real_assets'), db.read('real_approvals'),
        db.read('real_timelines'), db.read('real_handovers'), db.read('real_feedbacks'), db.read('real_notifications'),
        db.read('real_recycle_bin'), db.read('real_discovery'), db.read('real_blogs'), db.read('real_ai_conversations'),
      ])
      return j(res, {
        visitors: visitors || [], pdfs: pdfs || [], leads: leads || [], invoices: invoices || [],
        logs: logs || [], clients: clients.length ? clients : undefined,
        projects: projects.length ? projects : undefined, proposals: proposals.length ? proposals : undefined,
        agreements: agreements.length ? agreements : undefined, payments: payments.length ? payments : undefined,
        content: content.length ? content : undefined, assets: assets.length ? assets : undefined,
        approvals: approvals.length ? approvals : undefined, timelines: timelines.length ? timelines : undefined,
        handovers: handovers.length ? handovers : undefined, feedbacks: feedbacks.length ? feedbacks : undefined,
        notifications: notifications.length ? notifications : undefined,
        discoveryQuestionnaires: discovery || [], recycleBin: recycleBin || [], blogs: blogs || [],
        aiConversations: aiConversations || [],
      })
    }
    if (req.method === 'POST') {
      const body = await getJSON(req)
      const action = body.action || body.type
      const item = body.data || body
      const collections = {
        visit: { name: 'real_visitors', idField: 'id' },
        pdf: { name: 'real_pdfs', idField: 'id' },
        lead: { name: 'real_leads', idField: 'id' },
        invoice: { name: 'real_invoices', idField: 'id' },
        discovery: { name: 'real_discovery', idField: 'id' },
        ai_conversation: { name: 'real_ai_conversations', idField: 'id' },
      }
      if (collections[action]) {
        const { name, idField } = collections[action]
        const coll = await db.read(name)
        const exists = coll.some(e => e[idField] === item[idField])
        if (!exists) await db.append(name, item)
        else {
          const idx = coll.findIndex(e => e[idField] === item[idField])
          if (idx !== -1) coll[idx] = item
          await db.write(name, coll)
        }
      } else if (action === 'save_store' && item) {
        const map = {
          clients: 'real_clients', projects: 'real_projects', proposals: 'real_proposals',
          agreements: 'real_agreements', payments: 'real_payments', content: 'real_content',
          assets: 'real_assets', approvals: 'real_approvals', timelines: 'real_timelines',
          handovers: 'real_handovers', feedbacks: 'real_feedbacks', notifications: 'real_notifications',
          discoveryQuestionnaires: 'real_discovery', visitors: 'real_visitors', pdfs: 'real_pdfs',
          invoices: 'real_invoices', leads: 'real_leads', blogs: 'real_blogs', recycleBin: 'real_recycle_bin',
          logs: 'system_logs',
        }
        for (const [key, dbName] of Object.entries(map)) {
          if (Array.isArray(item[key])) await db.write(dbName, item[key])
        }
      }
      return j(res, { success: true })
    }
  }

  // ====== DISCOVERY QUESTIONNAIRES ======
  if (pathname === '/api/admin/discovery') {
    const items = (await db.read('real_discovery')) || []
    if (req.method === 'DELETE') {
      const body = await getJSON(req)
      const filtered = items.filter(i => i.id !== body.id)
      await db.write('real_discovery', filtered)
      return j(res, { success: true })
    }
    return j(res, { total: items.length, questionnaires: items.reverse() })
  }

  // ====== TRACKING ======
  if (pathname === '/api/track/pageview' && req.method === 'POST') {
    const body = await getJSON(req)
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
    else if (isMobile) brand = 'Mobile Device'

    await db.append('real_visitors', {
      id: body.id || ('v_' + Math.random().toString(36).slice(2, 9)),
      sessionId: body.sessionId || ('sess_' + Math.random().toString(36).slice(2, 9)),
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      page: body.page || '/',
      entryPage: body.entryPage || body.page || '/',
      deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      deviceLabel: isMobile ? 'Mobile' : 'Desktop (PC)',
      deviceBrand: brand,
      network: 'Broadband / 5G',
      browser: body.deviceInfo?.browser || (ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Browser'),
      country: req.headers['x-vercel-ip-country'] || '',
      city: req.headers['x-vercel-ip-city'] || '',
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '',
      referrer: body.referrer || 'Direct',
      timeOnPage: 30,
      scrollDepth: 80,
      pageViewsCount: body.pageViewsCount || 1,
    })
    return j(res, { ok: true })
  }

  if ((pathname === '/api/track/save-pdf' || pathname === '/api/track/save' || pathname === '/api/pdfs/save') && req.method === 'POST') {
    const body = await getJSON(req)
    await db.append('real_pdfs', {
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
    })
    return j(res, { ok: true })
  }

  if (pathname === '/api/track/ai-conversation' && req.method === 'POST') {
    const body = await getJSON(req)
    const convs = (await db.read('real_ai_conversations')) || []
    if (body.action === 'delete') {
      await db.write('real_ai_conversations', convs.filter(c => c.id !== body.id))
      return j(res, { success: true })
    }
    if (body.action === 'rename') {
      const t = convs.find(c => c.id === body.id)
      if (t) t.title = body.title
      await db.write('real_ai_conversations', convs)
      return j(res, { success: true })
    }
    if (body.action === 'save' && body.data) {
      const idx = convs.findIndex(c => c.id === body.data?.id)
      if (idx !== -1) convs[idx] = body.data
      else convs.unshift(body.data)
      await db.write('real_ai_conversations', convs)
      return j(res, { success: true })
    }
    return j(res, { ok: true })
  }

  if ((pathname === '/api/track/lead' || pathname === '/api/track/leads') && req.method === 'POST') {
    const body = await getJSON(req)
    const leads = (await db.read('real_leads')) || []
    const lead = {
      id: body.id || ('l_' + Math.random().toString(36).slice(2, 9)),
      createdAt: new Date().toISOString(),
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      company: body.company || '',
      service: body.service || '',
      budget: body.budget || '',
      message: body.message || '',
      status: 'New',
      country: body.country || '',
    }
    leads.unshift(lead)
    await db.write('real_leads', leads)
    return j(res, { success: true, id: lead.id })
  }

  if (pathname === '/api/track/discovery' && req.method === 'POST') {
    const body = await getJSON(req)
    const discovery = (await db.read('real_discovery')) || []
    const item = {
      id: body.id || ('dq_' + Math.random().toString(36).slice(2, 9)),
      createdAt: new Date().toISOString(),
      fullName: body.fullName || '',
      company: body.company || '',
      email: body.email || '',
      phone: body.phone || '',
      website: body.website || '',
      budget: body.budget || '',
      urgency: body.urgency || '',
      preferredLaunchDate: body.preferredLaunchDate || '',
      contentProvider: body.contentProvider || '',
      status: 'New',
      fullData: body.fullData,
    }
    discovery.unshift(item)
    await db.write('real_discovery', item ? discovery : [])
    return j(res, { success: true, id: item.id })
  }

  if (pathname.startsWith('/api/track/')) {
    return j(res, { ok: true })
  }

  return send(res, 404, { error: 'Not found' })
}
