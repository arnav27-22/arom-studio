import { beforeAll, afterAll } from 'vitest'

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.ADMIN_JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_PASSWORD = 'test-password'
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/arom_studio_test'
})

afterAll(async () => {
  // cleanup
})
