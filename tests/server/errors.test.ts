import { describe, it, expect } from 'vitest'
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from '../../server/src/utils/errors'

describe('Error classes', () => {
  it('AppError has correct structure', () => {
    const err = new AppError(400, 'Bad request', 'BAD_REQUEST', { field: 'name' })
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Bad request')
    expect(err.code).toBe('BAD_REQUEST')
    expect(err.details).toEqual({ field: 'name' })
  })

  it('NotFoundError has 404 status', () => {
    const err = new NotFoundError('User', '123')
    expect(err.statusCode).toBe(404)
    expect(err.message).toContain('User')
    expect(err.message).toContain('123')
    expect(err.code).toBe('NOT_FOUND')
  })

  it('UnauthorizedError has 401 status', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('ForbiddenError has 403 status', () => {
    const err = new ForbiddenError('No access')
    expect(err.statusCode).toBe(403)
    expect(err.message).toBe('No access')
  })

  it('ValidationError has 400 status with details', () => {
    const err = new ValidationError('Invalid input', [{ field: 'email', message: 'Required' }])
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.details).toBeTruthy()
  })

  it('ConflictError has 409 status', () => {
    const err = new ConflictError('Already exists')
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
  })
})
