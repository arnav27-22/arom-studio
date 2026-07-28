import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/AuthService'
import { CONFIG } from '../config'
import { ValidationError } from '../utils/errors'

function validatePassword(password: string): void {
  if (!password || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    throw new ValidationError('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one digit')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one special character')
  }
}

export class AuthController {
  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.admin_token
      const authenticated = await authService.checkAuth(token)
      res.json({ authenticated })
    } catch (err) {
      next(err)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
      try {
        const { password } = req.body
        if (!password || password.length < 1) {
          throw new ValidationError('Password is required')
        }
      const ip = req.ip || req.socket.remoteAddress || ''
      const token = await authService.login(password, ip)

      res.setHeader('Set-Cookie', [
        `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${CONFIG.SESSION_TIMEOUT / 1000}`,
      ])
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async wsToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.admin_token
      if (!token) {
        res.status(401).json({ error: 'No authentication token' })
        return
      }
      const valid = await authService.checkAuth(token)
      if (!valid) {
        res.status(401).json({ error: 'Invalid or expired token' })
        return
      }
      res.json({ token })
    } catch (err) {
      next(err)
    }
  }
}

export const authController = new AuthController()
