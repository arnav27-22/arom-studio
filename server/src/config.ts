import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve(process.cwd(), '.env') })

const requiredVars = [
  'DATABASE_URL',
  'ADMIN_JWT_SECRET',
  'ADMIN_PASSWORD',
] as const

for (const v of requiredVars) {
  if (!process.env[v]) {
    throw new Error(`Missing required environment variable: ${v}`)
  }
}

if (process.env.ADMIN_PASSWORD === 'change-this-password') {
  throw new Error('ADMIN_PASSWORD must be changed from the default value in .env')
}

if (process.env.ADMIN_JWT_SECRET === 'change-this-secret-min-32-chars-xxxxxxxxxxxx') {
  throw new Error('ADMIN_JWT_SECRET must be changed from the default value in .env')
}

if (process.env.NODE_ENV === 'production' && (process.env.ADMIN_JWT_SECRET || '').length < 32) {
  throw new Error('ADMIN_JWT_SECRET must be at least 32 characters in production')
}

const productionRequired = ['SMTP_HOST', 'CORS_ORIGIN']
if (process.env.NODE_ENV === 'production') {
  for (const v of productionRequired) {
    if (!process.env[v]) {
      throw new Error(`Missing required environment variable for production: ${v}`)
    }
  }
}

export const CONFIG = {
  PORT: parseInt(process.env.SERVER_PORT || process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.ADMIN_JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.ADMIN_JWT_REFRESH_SECRET || process.env.ADMIN_JWT_SECRET! + '_refresh',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.VITE_SITE_URL || 'http://localhost:5173',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  LOGIN_RATE_LIMIT_MAX: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '50', 10),
  AI_RATE_LIMIT_MAX: parseInt(process.env.AI_RATE_LIMIT_MAX || '30', 10),
  JWT_EXPIRY: process.env.JWT_EXPIRY || '8h',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT_MS || '28800000', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  STORAGE_LOCAL_PATH: process.env.STORAGE_LOCAL_PATH || path.resolve(process.cwd(), 'uploads'),
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_BUCKET: process.env.AWS_BUCKET || '',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET: process.env.R2_BUCKET || '',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@aromstudio.com',
  BACKUP_ENABLED: process.env.BACKUP_ENABLED === 'true',
  BACKUP_DIR: process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups'),
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  VERSION: process.env.APP_VERSION || '1.0.0',
}
