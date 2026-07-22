-- Run this entire SQL in Supabase SQL Editor

DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS pdf_events CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS click_events CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;

CREATE TABLE visits (
  id UUID PRIMARY KEY,
  session_id TEXT NOT NULL,
  page TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  device_type TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'Unknown',
  os TEXT DEFAULT 'Unknown',
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  time_on_page INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pdf_events (
  id UUID PRIMARY KEY,
  session_id TEXT,
  pdf_type TEXT,
  file_size_kb INTEGER DEFAULT 0,
  storage_key TEXT,
  page TEXT,
  device_type TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY,
  session_id TEXT,
  name TEXT,
  name_encrypted TEXT,
  email TEXT,
  email_encrypted TEXT,
  service TEXT,
  message TEXT,
  country TEXT DEFAULT '',
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE click_events (
  id UUID PRIMARY KEY,
  session_id TEXT,
  type TEXT DEFAULT 'unknown',
  label TEXT DEFAULT '',
  page TEXT DEFAULT '/',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT DEFAULT 'admin',
  event TEXT,
  detail TEXT,
  severity TEXT DEFAULT 'info',
  ip_hash TEXT DEFAULT ''
);

CREATE INDEX idx_visits_created ON visits (created_at DESC);
CREATE INDEX idx_visits_session ON visits (session_id);
CREATE INDEX idx_visits_page ON visits (page);
CREATE INDEX idx_pdf_created ON pdf_events (created_at DESC);
CREATE INDEX idx_clicks_created ON click_events (created_at DESC);
CREATE INDEX idx_logs_created ON system_logs (created_at DESC);
CREATE INDEX idx_submissions_created ON form_submissions (created_at DESC);
