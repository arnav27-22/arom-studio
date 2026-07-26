import helmet from 'helmet'
import cors from 'cors'
import { CONFIG } from '../config'

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://*.emailjs.com', 'https://*.googletagmanager.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.vercel-storage.com', 'https://*.r2.dev', 'https://*.amazonaws.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'ws://localhost:3001', 'wss://*.vercel.app', 'https://*.emailjs.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
})

export const corsConfig = cors({
  origin: CONFIG.CORS_ORIGIN.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Correlation-Id'],
  exposedHeaders: ['X-Request-Id', 'X-Response-Time'],
  maxAge: 86400,
})
