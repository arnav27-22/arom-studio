import { describe, it, expect } from 'vitest'

describe('Cache', () => {
  it('exports valid cache config', async () => {
    const { DEFAULT_TTL, DASHBOARD_TTL, SESSION_TTL } = await import('../../server/src/cache/index')
    expect(DEFAULT_TTL).toBe(300)
    expect(DASHBOARD_TTL).toBe(60)
    expect(SESSION_TTL).toBe(28800)
  })
})
