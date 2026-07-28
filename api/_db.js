import pg from 'pg'
const { Pool } = pg

const ALLOWED_TABLES = new Set([
  'visitors', 'visitor_sessions', 'ai_conversations', 'generated_pdfs',
  'leads', 'discovery_forms', 'invoices', 'projects', 'notifications',
  'audit_logs', 'blog_posts', 'recycle_bin',
  'clients', 'proposals', 'agreements', 'payments', 'content_collection',
  'asset_folders', 'design_approvals', 'project_timelines', 'handovers',
  'feedbacks', 'ai_knowledge', 'cms_content', 'link_clicks',
])

function validateTable(table) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Invalid table name: ${table}`)
  }
}

let pool

function requireDB() {
  if (pool) return
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is required.\n' +
      'Set DATABASE_URL in your Vercel project dashboard (Settings → Environment Variables).\n' +
      'Example: postgresql://user:***@ep-example-123456.us-east-2.aws.neon.tech/dbname?sslmode=require'
    )
  }
  const isNeon = url.includes('neon.tech')
  pool = new Pool({
    connectionString: url,
    max: 4,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isNeon ? { rejectUnauthorized: true } : undefined,
  })
  pool.on('error', (err) => {
    console.error('Unexpected pool error:', err.message)
  })
}

export async function query(text, params) {
  requireDB()
  const result = await pool.query(text, params)
  return result
}

async function tableExists(name) {
  const { rows } = await pool.query(
    `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
    [name]
  )
  return rows[0].exists
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_activity_at TIMESTAMPTZ,
      page TEXT NOT NULL DEFAULT '/',
      entry_page TEXT,
      exit_page TEXT,
      device_type TEXT DEFAULT 'desktop',
      device_label TEXT,
      device_brand TEXT,
      browser TEXT DEFAULT 'Browser',
      os TEXT DEFAULT 'Unknown',
      country TEXT DEFAULT '',
      city TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      referrer TEXT DEFAULT 'Direct',
      time_on_page INTEGER DEFAULT 0,
      session_duration INTEGER DEFAULT 0,
      scroll_depth INTEGER DEFAULT 0,
      page_views_count INTEGER DEFAULT 1,
      is_returning BOOLEAN DEFAULT FALSE,
      is_bounce BOOLEAN DEFAULT FALSE,
      is_live BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
    CREATE INDEX IF NOT EXISTS idx_visitors_page ON visitors(page);

    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_activity_at TIMESTAMPTZ,
      page_views INTEGER DEFAULT 1,
      pages TEXT[] DEFAULT '{}',
      device_type TEXT,
      browser TEXT,
      os TEXT,
      country TEXT,
      city TEXT,
      ip TEXT,
      referrer TEXT,
      is_returning BOOLEAN DEFAULT FALSE,
      is_bounce BOOLEAN DEFAULT FALSE,
      duration INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at DESC);

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ,
      title TEXT DEFAULT 'AI Chat',
      messages JSONB DEFAULT '[]'::jsonb,
      message_count INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

    CREATE TABLE IF NOT EXISTS generated_pdfs (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ,
      pdf_type TEXT DEFAULT 'Document',
      title TEXT DEFAULT 'PDF Document',
      client_name TEXT DEFAULT 'Client',
      client_email TEXT DEFAULT '',
      company TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      file_size_kb INTEGER DEFAULT 0,
      page_count INTEGER DEFAULT 0,
      device_type TEXT DEFAULT 'desktop',
      browser TEXT DEFAULT 'Chrome',
      os TEXT DEFAULT 'Windows',
      pdf_data_url TEXT DEFAULT '',
      storage_url TEXT DEFAULT '',
      storage_provider TEXT DEFAULT 'inline',
      sha256_hash TEXT DEFAULT '',
      reference_number TEXT DEFAULT '',
      agreement_id TEXT DEFAULT '',
      version TEXT DEFAULT '1.0.0',
      status TEXT DEFAULT 'Final',
      download_count INTEGER DEFAULT 0,
      file_name TEXT DEFAULT '',
      visitor_id TEXT DEFAULT '',
      session_id TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_generated_pdfs_created_at ON generated_pdfs(created_at DESC);

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      company TEXT DEFAULT '',
      service TEXT DEFAULT '',
      budget TEXT DEFAULT '',
      message TEXT DEFAULT '',
      status TEXT DEFAULT 'New',
      country TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

    CREATE TABLE IF NOT EXISTS discovery_forms (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name TEXT DEFAULT '',
      company TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      website TEXT DEFAULT '',
      budget TEXT DEFAULT '',
      urgency TEXT DEFAULT '',
      preferred_launch_date TEXT DEFAULT '',
      content_provider TEXT DEFAULT '',
      status TEXT DEFAULT 'New',
      full_data JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_discovery_forms_created_at ON discovery_forms(created_at DESC);

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      due_date TIMESTAMPTZ,
      invoice_number TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      client_phone TEXT DEFAULT '',
      client_company TEXT DEFAULT '',
      currency TEXT DEFAULT 'INR',
      items JSONB DEFAULT '[]'::jsonb,
      tax_rate NUMERIC DEFAULT 0,
      discount_rate NUMERIC DEFAULT 0,
      subtotal NUMERIC DEFAULT 0,
      tax_amount NUMERIC DEFAULT 0,
      discount_amount NUMERIC DEFAULT 0,
      total_amount NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      notes TEXT DEFAULT '',
      receipt_url TEXT DEFAULT '',
      payment_method TEXT DEFAULT '',
      reminder_sent_count INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      title TEXT DEFAULT '',
      client_id TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      status TEXT DEFAULT 'Planning',
      progress INTEGER DEFAULT 0,
      start_date TIMESTAMPTZ,
      due_date TIMESTAMPTZ,
      completion_date TIMESTAMPTZ,
      priority TEXT DEFAULT 'Medium',
      assigned_team JSONB DEFAULT '[]'::jsonb,
      project_files JSONB DEFAULT '[]'::jsonb,
      milestones JSONB DEFAULT '[]'::jsonb,
      launch_status TEXT DEFAULT 'Pending',
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      type TEXT DEFAULT 'alert',
      title TEXT DEFAULT '',
      message TEXT DEFAULT '',
      read BOOLEAN DEFAULT FALSE,
      link TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      type TEXT DEFAULT 'system',
      event TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      severity TEXT DEFAULT 'info',
      ip_hash TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ,
      slug TEXT UNIQUE,
      title TEXT DEFAULT '',
      excerpt TEXT DEFAULT '',
      content TEXT DEFAULT '',
      author TEXT DEFAULT 'AROM Studio',
      cover_image TEXT DEFAULT '',
      tags TEXT[] DEFAULT '{}',
      published BOOLEAN DEFAULT FALSE,
      published_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC NULLS LAST);

    CREATE TABLE IF NOT EXISTS recycle_bin (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      original_collection TEXT NOT NULL,
      item_data JSONB,
      title TEXT DEFAULT '',
      subtitle TEXT DEFAULT '',
      deleted_by TEXT DEFAULT '',
      deleted_by_name TEXT DEFAULT '',
      original_created_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS idx_recycle_bin_created_at ON recycle_bin(created_at DESC);

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      company_name TEXT DEFAULT '',
      contact_person TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      website TEXT DEFAULT '',
      active_projects_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      total_revenue NUMERIC DEFAULT 0,
      notes TEXT DEFAULT '',
      timeline JSONB DEFAULT '[]'::jsonb,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      proposal_number TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      title TEXT DEFAULT '',
      amount NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'Draft',
      valid_until TIMESTAMPTZ,
      download_url TEXT DEFAULT '',
      scope_summary TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS agreements (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      agreement_number TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending',
      agreement_version TEXT DEFAULT '',
      signed_date TIMESTAMPTZ,
      download_url TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      invoice_number TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      amount NUMERIC DEFAULT 0,
      due_date TIMESTAMPTZ,
      paid_date TIMESTAMPTZ,
      status TEXT DEFAULT 'Pending',
      invoice_link TEXT DEFAULT '',
      receipt_url TEXT DEFAULT '',
      payment_method TEXT DEFAULT '',
      reminder_sent_count INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS content_collection (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      client_name TEXT DEFAULT '',
      project_name TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending',
      completion_percentage INTEGER DEFAULT 0,
      download_url TEXT DEFAULT '',
      checklist JSONB DEFAULT '[]'::jsonb,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS asset_folders (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      client_name TEXT DEFAULT '',
      project_name TEXT DEFAULT '',
      google_drive_link TEXT DEFAULT '',
      folder_status TEXT DEFAULT 'Needs Files',
      missing_files_count INTEGER DEFAULT 0,
      checklist JSONB DEFAULT '[]'::jsonb,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS design_approvals (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      project_name TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      status TEXT DEFAULT 'Waiting Approval',
      approval_date TIMESTAMPTZ,
      preview_url TEXT DEFAULT '',
      comments JSONB DEFAULT '[]'::jsonb,
      version TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS project_timelines (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      project_name TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      current_phase TEXT DEFAULT '',
      estimated_delivery TEXT DEFAULT '',
      timeline_progress INTEGER DEFAULT 0,
      upcoming_tasks JSONB DEFAULT '[]'::jsonb,
      completed_tasks JSONB DEFAULT '[]'::jsonb,
      delayed_tasks JSONB DEFAULT '[]'::jsonb,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS handovers (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      project_name TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      status TEXT DEFAULT 'Ready',
      download_zip_url TEXT DEFAULT '',
      github_link TEXT DEFAULT '',
      admin_login_url TEXT DEFAULT '',
      admin_username TEXT DEFAULT '',
      domain TEXT DEFAULT '',
      hosting TEXT DEFAULT '',
      warranty_period_months INTEGER DEFAULT 12,
      support_expiry_date TIMESTAMPTZ,
      handover_date TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      client_name TEXT DEFAULT '',
      company TEXT DEFAULT '',
      rating INTEGER DEFAULT 5,
      review TEXT DEFAULT '',
      testimonial_approved BOOLEAN DEFAULT FALSE,
      portfolio_permission BOOLEAN DEFAULT FALSE,
      client_suggestions TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      category TEXT DEFAULT '',
      keywords TEXT[] DEFAULT '{}',
      content TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS cms_content (
      id TEXT PRIMARY KEY,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      title TEXT DEFAULT '',
      content JSONB DEFAULT '{}'::jsonb,
      published BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{}'::jsonb
    );
  `)

  const missing = []
  const required = [
    'visitors', 'visitor_sessions', 'ai_conversations', 'generated_pdfs',
    'leads', 'discovery_forms', 'invoices', 'projects', 'notifications',
    'audit_logs', 'blog_posts', 'recycle_bin',
    'clients', 'proposals', 'agreements', 'payments', 'content_collection',
    'asset_folders', 'design_approvals', 'project_timelines', 'handovers',
    'feedbacks', 'ai_knowledge', 'cms_content',
  ]
  for (const name of required) {
    if (!(await tableExists(name))) missing.push(name)
  }
  if (missing.length > 0) {
    throw new Error(`Failed to create tables: ${missing.join(', ')}`)
  }
}

let schemaEnsured = false

async function ensureInitialized() {
  requireDB()
  if (!schemaEnsured) {
    schemaEnsured = true
    await ensureSchema()
  }
}

export async function init() {
  requireDB()
  try {
    const { rows } = await pool.query('SELECT 1 AS ok')
    if (!rows[0]?.ok) throw new Error('Connection check failed')
  } catch (err) {
    throw new Error(`PostgreSQL connection failed: ${err.message}`)
  }
  await ensureInitialized()
}

export async function readAll(table, orderBy = 'created_at DESC', limit = null) {
  validateTable(table)
  await ensureInitialized()
  const cleanOrderBy = orderBy.replace(/[^a-zA-Z0-9_\s,]/g, '')
  const sql = limit
    ? `SELECT * FROM ${table} ORDER BY ${cleanOrderBy} LIMIT $1`
    : `SELECT * FROM ${table} ORDER BY ${cleanOrderBy}`
  const params = limit ? [limit] : []
  const { rows } = await query(sql, params)
  return rows
}

export async function readWhere(table, column, value, orderBy = 'created_at DESC') {
  validateTable(table)
  const cleanColumn = column.replace(/[^a-zA-Z0-9_]/g, '')
  const cleanOrderBy = orderBy.replace(/[^a-zA-Z0-9_\s,]/g, '')
  await ensureInitialized()
  const { rows } = await query(
    `SELECT * FROM ${table} WHERE ${cleanColumn} = $1 ORDER BY ${cleanOrderBy}`,
    [value]
  )
  return rows
}

export async function insertRow(table, data) {
  validateTable(table)
  await ensureInitialized()
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
  const columns = keys.join(', ')
  await query(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')}`,
    values
  )
}

export async function deleteWhere(table, column, value) {
  validateTable(table)
  const cleanColumn = column.replace(/[^a-zA-Z0-9_]/g, '')
  await ensureInitialized()
  await query(`DELETE FROM ${table} WHERE ${cleanColumn} = $1`, [value])
}

export async function deleteAll(table) {
  validateTable(table)
  await ensureInitialized()
  await query(`DELETE FROM ${table}`)
}

export async function countWhere(table, column, value) {
  validateTable(table)
  const cleanColumn = column.replace(/[^a-zA-Z0-9_]/g, '')
  await ensureInitialized()
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${cleanColumn} = $1`,
    [value]
  )
  return rows[0].count
}

export async function countAll(table) {
  validateTable(table)
  await ensureInitialized()
  const { rows } = await query(`SELECT COUNT(*)::int AS count FROM ${table}`)
  return rows[0].count
}

export async function updateWhere(table, data, column, value) {
  validateTable(table)
  const cleanColumn = column.replace(/[^a-zA-Z0-9_]/g, '')
  await ensureInitialized()
  const keys = Object.keys(data)
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const values = [value, ...Object.values(data)]
  await query(
    `UPDATE ${table} SET ${setClause} WHERE ${column} = $1`,
    values
  )
}

export async function getById(table, id) {
  validateTable(table)
  await ensureInitialized()
  const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
  return rows[0] || null
}

export { pool }
