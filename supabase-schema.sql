-- Run this entire SQL in Supabase SQL Editor

DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS pdf_events CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS click_events CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;

CREATE TABLE visits (
  "id" UUID PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "referrer" TEXT DEFAULT '',
  "deviceType" TEXT DEFAULT 'desktop',
  "browser" TEXT DEFAULT 'Unknown',
  "os" TEXT DEFAULT 'Unknown',
  "country" TEXT DEFAULT '',
  "city" TEXT DEFAULT '',
  "ipHash" TEXT DEFAULT '',
  "timeOnPage" INTEGER DEFAULT 0,
  "scrollDepth" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pdf_events (
  "id" UUID PRIMARY KEY,
  "sessionId" TEXT,
  "pdfType" TEXT,
  "fileSizeKb" INTEGER DEFAULT 0,
  "storageKey" TEXT,
  "page" TEXT,
  "deviceType" TEXT,
  "country" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE form_submissions (
  "id" UUID PRIMARY KEY,
  "sessionId" TEXT,
  "name" TEXT,
  "nameEncrypted" TEXT,
  "email" TEXT,
  "emailEncrypted" TEXT,
  "service" TEXT,
  "message" TEXT,
  "country" TEXT DEFAULT '',
  "status" TEXT DEFAULT 'New',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE click_events (
  "id" UUID PRIMARY KEY,
  "sessionId" TEXT,
  "type" TEXT DEFAULT 'unknown',
  "label" TEXT DEFAULT '',
  "page" TEXT DEFAULT '/',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_logs (
  "id" UUID PRIMARY KEY,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  "type" TEXT DEFAULT 'admin',
  "event" TEXT,
  "detail" TEXT,
  "severity" TEXT DEFAULT 'info',
  "ipHash" TEXT DEFAULT ''
);

CREATE INDEX idx_visits_created ON visits ("createdAt" DESC);
CREATE INDEX idx_visits_session ON visits ("sessionId");
CREATE INDEX idx_visits_page ON visits ("page");
CREATE INDEX idx_pdf_created ON pdf_events ("createdAt" DESC);
CREATE INDEX idx_clicks_created ON click_events ("createdAt" DESC);
CREATE INDEX idx_logs_created ON system_logs ("createdAt" DESC);
CREATE INDEX idx_logs_timestamp ON system_logs ("timestamp" DESC);
CREATE INDEX idx_submissions_created ON form_submissions ("createdAt" DESC);
