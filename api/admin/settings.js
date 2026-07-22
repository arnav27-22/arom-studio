import { requireAuth } from '../_auth.js'
import { getSupabase } from '../_supabase.js'

export default function handler(req, res) {
  if (!requireAuth(req, res)) return
  const supabase = getSupabase()

  const envChecks = {
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    ADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    VITE_GA_ID: !!process.env.VITE_GA_ID,
    VITE_CLARITY_ID: !!process.env.VITE_CLARITY_ID,
  }

  res.json({
    envChecks,
    allSet: Object.values(envChecks).every(Boolean),
    adminSessionTimeout: '8h',
    adminJwtExpiry: '8h',
    dbConnected: !!supabase,
  })
}
