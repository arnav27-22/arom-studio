import { describe, it, expect, vi, beforeAll } from 'vitest'

describe('Auth', () => {
  beforeAll(() => {
    process.env.ADMIN_JWT_SECRET = 'test-secret'
    process.env.ADMIN_PASSWORD = 'test-pass'
    process.env.NODE_ENV = 'test'
    process.env.LOG_LEVEL = 'silent'
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
  })

  it('signToken creates a valid JWT', async () => {
    vi.resetModules()
    const mod = await import('jsonwebtoken')
    const { signToken } = await import('../../server/src/middleware/auth')

    const token = signToken('admin_1', 'SUPER_ADMIN')
    expect(token).toBeTruthy()
    const decoded = mod.default.verify(token, 'test-secret') as any
    expect(decoded.adminId).toBe('admin_1')
    expect(decoded.role).toBe('SUPER_ADMIN')
  })

  it('createTokens returns access and refresh tokens', async () => {
    vi.resetModules()
    const mod = await import('jsonwebtoken')
    const { createTokens } = await import('../../server/src/middleware/auth')

    const tokens = createTokens('admin_1', 'ADMIN')
    expect(tokens.accessToken).toBeTruthy()
    expect(tokens.refreshToken).toBeTruthy()

    const access = mod.default.verify(tokens.accessToken, 'test-secret') as any
    expect(access.type).toBeUndefined()

    const refresh = mod.default.verify(tokens.refreshToken, 'test-secret_refresh') as any
    expect(refresh.type).toBe('refresh')
  })

  it('rejects expired tokens', async () => {
    vi.resetModules()
    const mod = await import('jsonwebtoken')
    const token = mod.default.sign({ adminId: '1', role: 'ADMIN' }, 'test-secret', { expiresIn: '0s' })
    expect(() => mod.default.verify(token, 'test-secret')).toThrow()
  })
})
