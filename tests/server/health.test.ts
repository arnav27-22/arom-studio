import { describe, it, expect } from 'vitest'

describe('Health endpoints', () => {
  it('getLiveness returns alive status', async () => {
    const { getLiveness } = await import('../../server/src/health')
    const result = await getLiveness()
    expect(result.status).toBe('alive')
    expect(result.timestamp).toBeTruthy()
  })

  it('getHealth returns health status object', async () => {
    const { getHealth } = await import('../../server/src/health')
    const health = await getHealth()
    expect(health).toHaveProperty('status')
    expect(health).toHaveProperty('database')
    expect(health).toHaveProperty('websocket')
    expect(health).toHaveProperty('memory')
    expect(health).toHaveProperty('cpu')
    expect(health).toHaveProperty('version')
    expect(health).toHaveProperty('uptimeHuman')
  })
})
