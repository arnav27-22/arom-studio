import { describe, it, expect } from 'vitest'

describe('SearchService', () => {
  it('exists and exports correctly', async () => {
    const { SearchService } = await import('../../server/src/services/SearchService')
    const service = new SearchService()
    expect(service).toBeDefined()
    expect(typeof service.globalSearch).toBe('function')
  })
})
