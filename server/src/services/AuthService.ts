import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
        jwt.verify(token, CONFIG.JWT_SECRET)
        return true
      } catch {
        return false
      }
    }

  async login(password: string, ip: string): Promise<string> {
    if (!password) {
      throw new UnauthorizedError('Incorrect password')
    }

    let match: boolean
    if (this.adminPasswordHash) {
      match = await bcrypt.compare(password, this.adminPasswordHash)
    } else {
      match = password === CONFIG.ADMIN_PASSWORD
    }

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
