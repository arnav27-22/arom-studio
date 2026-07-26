import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { CONFIG } from '../config'

const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.includes(req.method)) {
    let token = req.cookies?.[CSRF_COOKIE]
    if (!token) {
      token = crypto.randomBytes(32).toString('hex')
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        sameSite: 'strict',
        secure: CONFIG.NODE_ENV === 'production',
        maxAge: 86400000,
      })
    }
    res.locals.csrfToken = token
    next()
    return
  }

  const headerToken = req.headers[CSRF_HEADER] as string | undefined
  const cookieToken = req.cookies?.[CSRF_COOKIE]

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    })
    return
  }

  next()
}

export function getCsrfToken(req: Request, res: Response): string | undefined {
  return res.locals.csrfToken
}
