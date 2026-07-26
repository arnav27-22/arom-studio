import bcrypt from 'bcryptjs'
import { prisma } from '../database/prisma'
import { CONFIG } from '../config'
import { signToken } from '../middleware/auth'
import { UnauthorizedError } from '../utils/errors'
import { logger } from '../utils/logger'

const SALT_ROUNDS = 12

export class AuthService {
  private adminPasswordHash: string | null = null

  async initialize(): Promise<void> {
    this.adminPasswordHash = await bcrypt.hash(CONFIG.ADMIN_PASSWORD, SALT_ROUNDS)
  }

  async checkAuth(token?: string): Promise<boolean> {
    if (!token) return false
    try {
      const jwt = await import('jsonwebtoken')
      jwt.default.verify(token, CONFIG.JWT_SECRET)
      return true
    } catch {
      return false
    }
  }

  async login(password: string, ip: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new UnauthorizedError('Incorrect password')
    }

    const hash = this.adminPasswordHash || CONFIG.ADMIN_PASSWORD
    const match = await bcrypt.compare(password, hash)

    if (!match) {
      logger.warn('Failed login attempt', { ip })
      throw new UnauthorizedError('Incorrect password')
    }

    const adminId = 'admin_main'
    const token = signToken(adminId, 'SUPER_ADMIN')
    return token
  }

  async logout() {
    return true
  }
}

export const authService = new AuthService()
