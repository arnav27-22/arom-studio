import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { init, query, readAll, readWhere, insertRow, deleteWhere, deleteAll, countWhere, updateWhere, getById } from './_db.js'
import { requireAuth, verifyToken, signToken, checkRateLimit, recordFailure, verifyAdminPassword, logAdminEvent } from './_auth.js'
import { computeDashboard, computeAnalytics } from './stats.js'

const sseClients = new Map()

function getCorsHeaders(req) {
  const origin = req.headers.origin || ''
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://arom-studio.vercel.app',
    'https://www.aromstudio.in',
  ]
  const allowOrigin = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') ? origin : (origin ? origin : '*')
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
}

function j(res, data, req = null) {
  const headers = req ? getCorsHeaders(req) : {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
  res.writeHead(200, headers)
  res.end(JSON.stringify(data))
}

function send(res, status, data, req = null) {
  const headers = req ? getCorsHeaders(req) : {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
  res.writeHead(status, headers)
  res.end(JSON.stringify(data))
}

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const [id, client] of sseClients) {
    try { client.write(msg) } catch { sseClients.delete(id) }
  }
}

function parseCookies(req) {
  const cookies = {}
  ;(req.headers.cookie || '').split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=')
    if (k) cookies[k.trim()] = v.join('=')
  })
  return cookies
}

function getJSON(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)) } catch {}
  }
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c) => body += c)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
    setTimeout(() => resolve({}), 500)
  })
}

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') return send(res, 200, {})

    const url = new URL(req.url, 'http://localhost')
    const pathname = url.pathname
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'

    if (pathname === '/api/ping') return j(res, { ok: true, timestamp: new Date().toISOString() })

    // Auth
    if (pathname === '/api/admin/auth') {
      if (req.method === 'GET') {
        const cookies = parseCookies(req)
return j(res, { authenticated: !!(cookies.admin_token && verifyToken(cookies.admin_token)) }, req)
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
return j(res, { success: true }, req)
        }
        if (body.action === 'logout') {
          res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
return j(res, { success: true }, req)
        }
      }
return send(res, 400, { error: 'Invalid' }, req)
    }

    // Require auth for all /api/admin/ routes
    if (pathname.startsWith('/api/admin/')) {
      const cookies = parseCookies(req)
      if (!cookies.admin_token || !verifyToken(cookies.admin_token)) {
return send(res, 401, { error: 'Unauthorized' }, req)
      }
    }

    // SSE
    if (pathname === '/api/admin/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      })
      res.write('event: connected\ndata: {}\n\n')
      const clientId = crypto.randomUUID()
      sseClients.set(clientId, res)
      req.on('close', () => { sseClients.delete(clientId) })
      return
    }

    // Dashboard
    if (pathname === '/api/admin/dashboard' || pathname === '/api/admin/statistics') {
      const stats = await computeDashboard()
return j(res, stats, req)
    }

    // Analytics
    if (pathname === '/api/admin/analytics') {
      const analytics = await computeAnalytics()
return j(res, analytics, req)
    }

    // Visitors
    if (pathname === '/api/admin/visitors') {
      if (req.method === 'DELETE') {
        await deleteAll('visitors')
return j(res, { success: true }, req)
      }
      const rows = await readAll('visitors')
return j(res, { total: rows.length, visitors: rows }, req)
    }

    // PDFs
    if (pathname === '/api/admin/pdfs') {
      const rows = await readAll('generated_pdfs')
return j(res, { total: rows.length, pdfs: rows }, req)
    }

    if (pathname.startsWith('/api/admin/pdfs/') && req.method === 'DELETE') {
      const pdfId = pathname.split('/').pop()
      await deleteWhere('generated_pdfs', 'id', pdfId)
return j(res, { success: true }, req)
    }

    async function getPDFBuffer(pdf) {
      if (pdf.storage_url) {
        try {
          const possiblePaths = [
            path.join(process.cwd(), 'server', 'storage', 'pdfs', path.basename(pdf.storage_url)),
            path.join(process.cwd(), 'uploads', path.basename(pdf.storage_url)),
            pdf.storage_url,
          ]
          for (const fp of possiblePaths) {
            if (fs.existsSync(fp)) return fs.readFileSync(fp)
          }
        } catch {}
      }
      if (pdf.pdf_data_url) {
        const base64 = pdf.pdf_data_url.replace(/^data:application\/pdf;base64,/, '')
        return Buffer.from(base64, 'base64')
      }
      return null
    }

    if (pathname.match(/^\/api\/admin\/pdfs\/[^\/]+\/download$/) && req.method === 'GET') {
      const pdfId = pathname.split('/')[4]
      const pdf = await getById('generated_pdfs', pdfId)
      if (!pdf) return send(res, 404, { error: 'PDF not found' })
      const buffer = await getPDFBuffer(pdf)
      if (!buffer) return send(res, 404, { error: 'PDF data not available' })
      const downloadName = (pdf.file_name || pdf.title || pdf.pdf_type || 'document').replace(/\s+/g, '_') + '.pdf'
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': buffer.length,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      })
      res.end(buffer)
      return
    }

    if (pathname.match(/^\/api\/admin\/pdfs\/[^\/]+\/preview$/) && req.method === 'GET') {
      const pdfId = pathname.split('/')[4]
      const pdf = await getById('generated_pdfs', pdfId)
      if (!pdf) return send(res, 404, { error: 'PDF not found' })
      const buffer = await getPDFBuffer(pdf)
      if (!buffer) return send(res, 404, { error: 'PDF data not available' })
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdf.file_name || 'document.pdf'}"`,
        'Content-Length': buffer.length,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      })
      res.end(buffer)
      return
    }

    if (pathname.startsWith('/api/admin/pdfs/') && req.method === 'GET') {
      const pdfId = pathname.split('/').pop()
      const pdf = await getById('generated_pdfs', pdfId)
      if (!pdf) return send(res, 404, { error: 'PDF not found' })
return j(res, pdf, req)
    }

    // Leads
    if (pathname === '/api/admin/leads') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        const row = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          name: body.name || '',
          email: body.email || '',
          phone: body.phone || '',
          company: body.company || '',
          service: body.service || '',
          budget: body.budget || '',
          message: body.message || '',
          status: body.status || 'New',
          country: body.country || '',
        }
        await insertRow('leads', row)
return j(res, row, req)
      }
      if (req.method === 'PUT') {
        const body = await getJSON(req)
        await updateWhere('leads', { status: body.status }, 'id', body.id)
return j(res, { success: true }, req)
      }
      const rows = await readAll('leads')
return j(res, { total: rows.length, leads: rows }, req)
    }

    // AI Conversations
    if (pathname === '/api/admin/ai/conversations') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        if (body.action === 'delete') {
          await deleteWhere('ai_conversations', 'id', body.id)
return j(res, { success: true }, req)
        }
        if (body.action === 'rename') {
          await updateWhere('ai_conversations', { title: body.title }, 'id', body.id)
return j(res, { success: true }, req)
        }
        if (body.action === 'save' && body.data) {
          await insertRow('ai_conversations', { ...body.data, updated_at: new Date().toISOString() })
return j(res, { success: true }, req)
        }
      }
      if (req.method === 'DELETE') {
        const body = await getJSON(req)
        await deleteWhere('ai_conversations', 'id', body.id)
return j(res, { success: true }, req)
      }
      const convs = await readAll('ai_conversations')
return j(res, { total: convs.length, conversations: convs }, req)
    }

    // AI Knowledge
    if (pathname === '/api/admin/ai/knowledge') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        await deleteAll('ai_knowledge')
        if (Array.isArray(body.items)) {
          for (const item of body.items) {
            await insertRow('ai_knowledge', item)
          }
        }
return j(res, { success: true }, req)
      }
      const items = await readAll('ai_knowledge')
return j(res, { items }, req)
    }

    // Overview (legacy)
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

    // Logs
    if (pathname === '/api/admin/logs') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        const entry = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          type: body.type || 'system',
          event: body.event || '',
          detail: body.detail || '',
          severity: body.severity || 'info',
          ip_hash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
        }
        await insertRow('audit_logs', entry)
return j(res, entry, req)
      }
      const rows = await readAll('audit_logs')
return j(res, { total: rows.length, logs: rows }, req)
    }

    // Settings
    if (pathname === '/api/admin/settings') {
      return j(res, {
        envChecks: {
          ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
          ADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
        allSet: !!(process.env.ADMIN_PASSWORD && process.env.ADMIN_JWT_SECRET && process.env.DATABASE_URL),
        adminSessionTimeout: '8h',
      })
    }

    // Activity
    if (pathname === '/api/admin/activity') {
      const stats = await computeDashboard()
return j(res, { events: stats.activity.recent }, req)
    }

    // Recycle Bin
    if (pathname === '/api/admin/recycle') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        if (body.action === 'restore') {
          const record = await getById('recycle_bin', body.id)
          if (record) {
            const collection = record.original_collection
            const tableMap = {
              visitors: 'visitors', pdfs: 'generated_pdfs', leads: 'leads',
              clients: 'clients', projects: 'projects', proposals: 'proposals',
              agreements: 'agreements', payments: 'payments', blogs: 'blog_posts',
            }
            const tableName = tableMap[collection] || collection
            const itemData = record.item_data
            if (itemData && itemData.id) {
              const existing = await getById(tableName, itemData.id)
              if (!existing) {
                await insertRow(tableName, itemData)
              }
            }
            await deleteWhere('recycle_bin', 'id', body.id)
          }
return j(res, { success: true }, req)
        }
        if (body.action === 'permanent_delete') {
          const ids = Array.isArray(body.ids) ? body.ids : [body.id]
          for (const id of ids) {
            await deleteWhere('recycle_bin', 'id', id)
          }
return j(res, { success: true }, req)
        }
        if (body.action === 'empty') {
          await deleteAll('recycle_bin')
return j(res, { success: true }, req)
        }
      }
      const items = await readAll('recycle_bin')
return j(res, { total: items.length, items }, req)
    }

    // Sync endpoint
    if (pathname === '/api/sync') {
      if (req.method === 'GET') {
        const [
          visitors, pdfs, leads, invoices, logs, clients, projects,
          proposals, agreements, payments, content, assets, approvals,
          timelines, handovers, feedbacks, notifications, recycleBin,
          discovery, aiConversations, cms, linkClicks,
        ] = await Promise.all([
          readAll('visitors'), readAll('generated_pdfs'), readAll('leads'),
          readAll('invoices'), readAll('audit_logs'), readAll('clients'),
          readAll('projects'), readAll('proposals'), readAll('agreements'),
          readAll('payments'), readAll('content_collection'), readAll('asset_folders'),
          readAll('design_approvals'), readAll('project_timelines'), readAll('handovers'),
          readAll('feedbacks'), readAll('notifications'), readAll('recycle_bin'),
          readAll('discovery_forms'), readAll('ai_conversations'), readAll('cms_content'),
          readAll('link_clicks'),
        ])
        return j(res, {
          visitors, pdfs, leads, invoices, logs, linkClicks,
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
          discoveryQuestionnaires: discovery,
          recycleBin, aiConversations,
          cmsContent: cms,
        })
      }
      if (req.method === 'POST') {
        const body = await getJSON(req)
        const action = body.action || body.type
        const item = body.data || body
        const collections = {
          visit: 'visitors',
          pdf: 'generated_pdfs',
          lead: 'leads',
          invoice: 'invoices',
          discovery: 'discovery_forms',
          ai_conversation: 'ai_conversations',
        }
        if (collections[action]) {
          const table = collections[action]
          const existing = item.id ? await getById(table, item.id) : null
          if (!existing) {
            await insertRow(table, item)
          } else {
            await updateWhere(table, item, 'id', item.id)
          }
        } else if (action === 'save_store' && item) {
          const map = {
            clients: 'clients', projects: 'projects', proposals: 'proposals',
            agreements: 'agreements', payments: 'payments', content: 'content_collection',
            assets: 'asset_folders', approvals: 'design_approvals', timelines: 'project_timelines',
            handovers: 'handovers', feedbacks: 'feedbacks', notifications: 'notifications',
            discoveryQuestionnaires: 'discovery_forms', visitors: 'visitors', pdfs: 'generated_pdfs',
            invoices: 'invoices', leads: 'leads', recycleBin: 'recycle_bin',
            logs: 'audit_logs', cmsContent: 'cms_content',
          }
          for (const [key, tableName] of Object.entries(map)) {
            if (Array.isArray(item[key])) {
              await deleteAll(tableName)
              for (const row of item[key]) {
                if (row && row.id) await insertRow(tableName, row)
              }
            }
          }
        }
return j(res, { success: true }, req)
      }
    }

    // Discovery questionnaires
    if (pathname === '/api/admin/discovery') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        const row = {
          id: body.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          full_name: body.fullName || '',
          company: body.company || '',
          email: body.email || '',
          phone: body.phone || '',
          website: body.website || '',
          budget: body.budget || '',
          urgency: body.urgency || '',
          preferred_launch_date: body.preferredLaunchDate || '',
          content_provider: body.contentProvider || '',
          status: body.status || 'New',
          full_data: body.fullData ? JSON.stringify(body.fullData) : '{}',
        }
        await insertRow('discovery_forms', row)
return j(res, { ...row, id: row.id }, req)
      }
      if (req.method === 'DELETE') {
        const body = await getJSON(req)
        await deleteWhere('discovery_forms', 'id', body.id)
return j(res, { success: true }, req)
      }
      const items = await readAll('discovery_forms')
return j(res, { total: items.length, questionnaires: items }, req)
    }

    // Recycle bin restore
    if (pathname === '/api/admin/recycle/restore' && req.method === 'POST') {
      const body = await getJSON(req)
      if (body.bulk && Array.isArray(body.recycleIds)) {
        const results = []
        for (const id of body.recycleIds) {
          const record = await getById('recycle_bin', id)
          if (record && record.item_data && record.original_collection) {
            await insertRow(record.original_collection, record.item_data)
            await deleteWhere('recycle_bin', 'id', id)
            results.push({ recycleId: id, itemData: record.item_data, originalCollection: record.original_collection })
          }
        }
return j(res, { success: true, restoredItems: results }, req)
      }
      const record = await getById('recycle_bin', body.recycleId)
      if (record && record.item_data && record.original_collection) {
        await insertRow(record.original_collection, record.item_data)
        await deleteWhere('recycle_bin', 'id', body.recycleId)
return j(res, { success: true, itemData: record.item_data, originalCollection: record.original_collection }, req)
      }
return j(res, { success: false }, req)
    }

    if (pathname === '/api/admin/recycle/permanent-delete' && req.method === 'POST') {
      const body = await getJSON(req)
      const ids = body.bulk && Array.isArray(body.ids) ? body.ids : [body.recycleId]
      for (const id of ids) {
        await deleteWhere('recycle_bin', 'id', id)
      }
return j(res, { success: true }, req)
    }

    if (pathname === '/api/admin/recycle/empty' && req.method === 'POST') {
      await deleteAll('recycle_bin')
return j(res, { success: true }, req)
    }

    // Logs POST (create audit log)
    // PDF save (admin)
    if (pathname === '/api/admin/pdfs/save' && req.method === 'POST') {
      const body = await getJSON(req)
      const entry = {
        id: body.id || crypto.randomUUID(),
        created_at: body.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pdf_type: body.pdfType || 'Document',
        title: body.title || 'PDF Document',
        client_name: body.clientName || 'Client',
        client_email: body.clientEmail || '',
        company: body.company || '',
        phone: body.phone || '',
        file_size_kb: body.fileSizeKb || 0,
        device_type: body.deviceType || 'desktop',
        browser: body.browser || 'Chrome',
        os: body.os || 'Windows',
        pdf_data_url: body.pdfDataUrl || '',
        status: body.status || 'Final',
        file_name: body.fileName || '',
      }
      await insertRow('generated_pdfs', entry)
return j(res, entry, req)
    }

    // Invoices
    if (pathname === '/api/admin/invoices') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        const invoice = {
          id: body.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          invoice_number: body.invoiceNumber || '',
          client_name: body.clientName || '',
          client_email: body.clientEmail || '',
          client_phone: body.clientPhone || '',
          client_company: body.clientCompany || '',
          currency: body.currency || 'INR',
          items: JSON.stringify(body.items || []),
          tax_rate: body.taxRate || 0,
          discount_rate: body.discountRate || 0,
          subtotal: body.subtotal || 0,
          tax_amount: body.taxAmount || 0,
          discount_amount: body.discountAmount || 0,
          total_amount: body.totalAmount || 0,
          status: body.status || 'Pending',
          notes: body.notes || '',
        }
        await insertRow('invoices', invoice)
return j(res, { ...invoice, id: invoice.id }, req)
      }
      const rows = await readAll('invoices')
return j(res, { total: rows.length, invoices: rows }, req)
    }

    // CMS
    if (pathname === '/api/admin/cms') {
      const rows = await readAll('cms_content')
return j(res, rows, req)
    }

    if (pathname.match(/^\/api\/admin\/cms\/(.+)$/)) {
      const cmsId = pathname.match(/^\/api\/admin\/cms\/(.+)$/)[1]
      if (req.method === 'PUT') {
        const body = await getJSON(req)
        await insertRow('cms_content', {
          id: cmsId,
          updated_at: new Date().toISOString(),
          title: body.title || '',
          content: body.content ? JSON.stringify(body.content) : '{}',
          published: body.published || false,
          metadata: body.metadata ? JSON.stringify(body.metadata) : '{}',
        })
        const updated = await getById('cms_content', cmsId)
return j(res, updated, req)
      }
      const item = await getById('cms_content', cmsId)
return j(res, item || { id: cmsId, title: '', content: {}, published: false }, req)
    }

    if (pathname.match(/^\/api\/cms\/(.+)$/) && req.method === 'GET') {
      const cmsId = pathname.match(/^\/api\/cms\/(.+)$/)[1]
      const item = await getById('cms_content', cmsId)
      if (!item || !item.published) return j(res, { id: cmsId, content: {} })
return j(res, { id: item.id, title: item.title, content: item.content, updated_at: item.updated_at }, req)
    }

    // Agreements (specific handler for correct field mapping)
    if (pathname === '/api/admin/agreements') {
      if (req.method === 'POST') {
        const body = await getJSON(req)
        const row = {
          id: body.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          agreement_number: body.agreementNumber || '',
          client_name: body.clientName || '',
          client_email: body.clientEmail || '',
          status: body.status || 'Pending',
          agreement_version: body.agreementVersion || '',
          signed_date: body.signedDate || null,
          download_url: body.downloadUrl || '',
        }
        await insertRow('agreements', row)
return j(res, { ...body, id: row.id }, req)
      }
      const rows = await readAll('agreements')
return j(res, rows, req)
    }

    // Generic collection endpoints
    const collectionRoutes = {
      clients: 'clients', projects: 'projects', proposals: 'proposals',
      agreements: 'agreements', payments: 'payments', content: 'content_collection',
      assets: 'asset_folders', approvals: 'design_approvals', timelines: 'project_timelines',
      handovers: 'handovers', feedbacks: 'feedbacks', notifications: 'notifications',
    }

    for (const [route, table] of Object.entries(collectionRoutes)) {
      if (pathname === `/api/admin/${route}`) {
        if (req.method === 'POST') {
          const body = await getJSON(req)
          const row = { id: body.id || crypto.randomUUID(), ...body, created_at: new Date().toISOString() }
          await insertRow(table, row)
return j(res, row, req)
        }
        const rows = await readAll(table)
return j(res, rows, req)
      }

      if (pathname.startsWith(`/api/admin/${route}/`) && req.method === 'DELETE') {
        const itemId = pathname.split('/').pop()
        const item = await getById(table, itemId)
        if (item) {
          await insertRow('recycle_bin', {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            original_collection: route,
            item_data: item,
            title: item.title || item.name || item.client_name || itemId,
            subtitle: item.client_name || item.company || '',
          })
        }
        await deleteWhere(table, 'id', itemId)
return j(res, { success: true, recycleItem: item ? { id: crypto.randomUUID(), originalCollection: route, itemData: item, title: item.title || item.name || item.client_name || itemId } : null }, req)
      }
    }

    // Tracking
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

      await insertRow('visitors', {
        id: body.id || crypto.randomUUID(),
        session_id: body.sessionId || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        page: body.page || '/',
        entry_page: body.entryPage || body.page || '/',
        device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
        device_label: isMobile ? 'Mobile' : 'Desktop (PC)',
        device_brand: brand,
        browser: body.deviceInfo?.browser || (ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Browser'),
        country: req.headers['x-vercel-ip-country'] || '',
        city: req.headers['x-vercel-ip-city'] || '',
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '',
        referrer: body.referrer || 'Direct',
        time_on_page: body.timeOnPage || body.sessionDuration || 0,
        scroll_depth: body.scrollDepth || 0,
        page_views_count: body.pageViewsCount || 1,
      })
      broadcast('visitor', { action: 'pageview', data: body })
return j(res, { ok: true }, req)
    }

    // PDF tracking
    if ((pathname === '/api/track/save-pdf' || pathname === '/api/track/save' || pathname === '/api/pdfs/save') && req.method === 'POST') {
      const body = await getJSON(req)
      const pdfId = body.id || crypto.randomUUID()
      await insertRow('generated_pdfs', {
        id: pdfId,
        created_at: body.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pdf_type: body.pdfType || 'Document',
        title: body.title || body.storageKey || 'PDF Document',
        client_name: body.clientName || 'Client',
        client_email: body.clientEmail || '',
        company: body.company || '',
        phone: body.phone || '',
        file_size_kb: body.fileSizeKb || 180,
        page_count: body.pageCount || 0,
        device_type: body.deviceType || 'desktop',
        browser: body.browser || 'Chrome',
        os: body.os || 'Windows',
        pdf_data_url: body.pdfDataUrl || '',
        storage_url: body.storageUrl || '',
        storage_provider: body.storageProvider || 'inline',
        sha256_hash: body.sha256Hash || '',
        reference_number: body.referenceNumber || `PDF-${pdfId.slice(0, 8).toUpperCase()}`,
        agreement_id: body.agreementId || '',
        version: body.version || '1.0.0',
        status: body.status || 'Final',
        download_count: body.downloadCount || 0,
        file_name: body.fileName || `${(body.title || body.pdfType || 'Document').replace(/\s+/g, '_')}.pdf`,
        visitor_id: body.visitorId || '',
        session_id: body.sessionId || '',
      })
      broadcast('pdf', { action: 'created', data: { id: pdfId } })
return j(res, { ok: true, id: pdfId, sha256Hash: body.sha256Hash || '', referenceNumber: `PDF-${pdfId.slice(0, 8).toUpperCase()}` }, req)
    }

    // AI conversation tracking
    if (pathname === '/api/track/ai-conversation' && req.method === 'POST') {
      const body = await getJSON(req)
      if (body.action === 'delete') {
        await deleteWhere('ai_conversations', 'id', body.id)
        broadcast('ai_conversation', { action: 'delete', data: body })
return j(res, { success: true }, req)
      }
      if (body.action === 'rename') {
        await updateWhere('ai_conversations', { title: body.title }, 'id', body.id)
        broadcast('ai_conversation', { action: 'rename', data: body })
return j(res, { success: true }, req)
      }
      if (body.action === 'save' && body.data) {
        const conv = {
          ...body.data,
          updated_at: new Date().toISOString(),
          message_count: Array.isArray(body.data.messages) ? body.data.messages.length : 0,
          messages: body.data.messages ? JSON.stringify(body.data.messages) : '[]',
        }
        await insertRow('ai_conversations', conv)
        broadcast('ai_conversation', { action: 'saved', data: body })
return j(res, { success: true }, req)
      }
return j(res, { ok: true }, req)
    }

    // Lead tracking
    if ((pathname === '/api/track/lead' || pathname === '/api/track/leads') && req.method === 'POST') {
      const body = await getJSON(req)
      const lead = {
        id: body.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
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
      await insertRow('leads', lead)
      broadcast('lead', { action: 'created', data: lead })
return j(res, { success: true, id: lead.id }, req)
    }

    // Discovery tracking
    if (pathname === '/api/track/discovery' && req.method === 'POST') {
      const body = await getJSON(req)
      const item = {
        id: body.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        full_name: body.fullName || '',
        company: body.company || '',
        email: body.email || '',
        phone: body.phone || '',
        website: body.website || '',
        budget: body.budget || '',
        urgency: body.urgency || '',
        preferred_launch_date: body.preferredLaunchDate || '',
        content_provider: body.contentProvider || '',
        status: 'New',
        full_data: body.fullData ? JSON.stringify(body.fullData) : '{}',
      }
      await insertRow('discovery_forms', item)
      broadcast('discovery', { action: 'created', data: item })
return j(res, { success: true, id: item.id }, req)
    }

    if (pathname.startsWith('/api/track/')) {
return j(res, { ok: true }, req)
    }

return send(res, 404, { error: 'Not found' }, req)
  } catch (err) {
    console.error('Handler error:', err)
return send(res, 500, { error: 'Internal server error' }, req)
  }
}
