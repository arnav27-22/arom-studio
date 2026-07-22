import { requireAuth } from '../_auth.js'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return

  const envChecks = {
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    ADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
  }

  res.json({
    envChecks,
    allSet: Object.values(envChecks).every(Boolean),
    adminSessionTimeout: '8h',
    adminJwtExpiry: '8h',
    dbConnected: true,
  })
}
