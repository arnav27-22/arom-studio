import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config'
import { prisma } from '../database/prisma'
import { UnauthorizedError, ForbiddenError } from '../utils/errors'

export interface AuthPayload {
  adminId: string
  role: string
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload
      requestId: string
      correlationId?: string
      startTime: number
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return next(new UnauthorizedError('No admin token provided'))
  }
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as AuthPayload
    req.admin = decoded
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired admin token'))
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as AuthPayload
      req.admin = decoded
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  next()
}

export function requireRole(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      return next(new UnauthorizedError())
    }
    if (!roles.includes(req.admin.role)) {
      return next(new ForbiddenError(`Requires one of roles: ${roles.join(', ')}`))
    }
    next()
  }
}

export function signToken(adminId: string, role: string): string {
  return jwt.sign(
    { adminId, role },
    CONFIG.JWT_SECRET,
    { expiresIn: CONFIG.JWT_EXPIRY } as jwt.SignOptions
  )
}

export function signRefreshToken(adminId: string, role: string): string {
  return jwt.sign(
    { adminId, role, type: 'refresh' },
    CONFIG.JWT_REFRESH_SECRET,
    { expiresIn: CONFIG.JWT_REFRESH_EXPIRY } as jwt.SignOptions
  )
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as AuthPayload
}

export function createTokens(adminId: string, role: string): { accessToken: string; refreshToken: string } {
  return {
    accessToken: signToken(adminId, role),
    refreshToken: signRefreshToken(adminId, role),
  }
}
