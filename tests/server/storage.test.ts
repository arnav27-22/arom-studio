import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('../../server/src/database/prisma', () => ({
  prisma: {
    file: {
      create: vi.fn().mockResolvedValue({ id: 'mock-file', url: '/uploads/test.txt' }),
    },
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
}))

describe('Storage service', () => {
  beforeAll(() => {
    process.env.STORAGE_PROVIDER = 'local'
    process.env.STORAGE_LOCAL_PATH = './test-uploads'
    process.env.NODE_ENV = 'test'
    process.env.LOG_LEVEL = 'silent'
  })

  it('validates file types correctly', async () => {
    const { uploadFile } = await import('../../server/src/storage/service')

    const buffer = Buffer.from('test content')
    try {
      await uploadFile(buffer, 'test.txt', 'text/plain')
    } catch (err) {
      expect.fail('Should accept text/plain')
    }
  })

  it('rejects disallowed file types', async () => {
    const { uploadFile } = await import('../../server/src/storage/service')
    const buffer = Buffer.from('bad file')

    try {
      await uploadFile(buffer, 'test.exe', 'application/x-msdownload')
      expect.fail('Should reject exe files')
    } catch (err) {
      expect((err as Error).message).toContain('not allowed')
    }
  })

  it('rejects oversized files', async () => {
    const { uploadFile } = await import('../../server/src/storage/service')
    const buffer = Buffer.alloc(100 * 1024 * 1024 + 1)

    try {
      await uploadFile(buffer, 'large.pdf', 'application/pdf')
      expect.fail('Should reject oversized files')
    } catch (err) {
      expect((err as Error).message).toContain('exceeds maximum')
    }
  })
})
