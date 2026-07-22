import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../_auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const envChecks = {
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    ADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
    VITE_EMAILJS_SERVICE_ID: !!process.env.VITE_EMAILJS_SERVICE_ID,
    VITE_EMAILJS_TEMPLATE_ID: !!process.env.VITE_EMAILJS_TEMPLATE_ID,
    VITE_EMAILJS_PUBLIC_KEY: !!process.env.VITE_EMAILJS_PUBLIC_KEY,
    VITE_GA_ID: !!process.env.VITE_GA_ID,
    VITE_CLARITY_ID: !!process.env.VITE_CLARITY_ID,
  }

  res.json({
    envChecks,
    allSet: Object.values(envChecks).every(Boolean),
    adminSessionTimeout: '8h',
    adminJwtExpiry: '8h',
  })
}
