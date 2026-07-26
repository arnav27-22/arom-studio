import { describe, it, expect } from 'vitest'

describe('Monitoring', () => {
  it('records requests and errors', async () => {
    const monitoring = await import('../../server/src/monitoring/index')
    monitoring.recordRequest()
    monitoring.recordRequest()
    monitoring.recordError()

    const metrics = monitoring.getMetrics()
    expect(metrics.totalRequests).toBeGreaterThanOrEqual(2)
    expect(metrics.totalErrors).toBeGreaterThanOrEqual(1)
    expect(metrics.errorRate).toBeGreaterThan(0)
  })
})
