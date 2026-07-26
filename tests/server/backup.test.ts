import { describe, it, expect } from 'vitest'

describe('Backup system', () => {
  it('returns backup schedules', async () => {
    const { getBackupSchedules } = await import('../../server/src/backup/index')
    const schedules = getBackupSchedules()
    expect(schedules.length).toBeGreaterThan(0)
    expect(schedules[0]).toHaveProperty('type')
    expect(schedules[0]).toHaveProperty('retention')
  })
})
