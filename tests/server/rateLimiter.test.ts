import { describe, it, expect, vi } from 'vitest'

describe('Rate limiter', () => {
  it('allows requests within limit', async () => {
    vi.resetModules()
    process.env.RATE_LIMIT_WINDOW_MS = '60000'
    process.env.RATE_LIMIT_MAX = '100'

    const { rateLimiter } = await import('../../server/src/middleware/rateLimiter')
    const req = { ip: '127.0.0.1', path: '/test', admin: undefined } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), setHeader: vi.fn() } as any
    const next = vi.fn()

    await rateLimiter(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
