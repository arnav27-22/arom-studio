import { describe, it, expect } from 'vitest'
import { logger } from '../../server/src/utils/logger'

describe('Logger', () => {
  it('logs info messages', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('test message')
    expect(spy).toHaveBeenCalled()
    const call = JSON.parse(spy.mock.calls[0][0])
    expect(call.level).toBe('info')
    expect(call.message).toBe('test message')
    expect(call.timestamp).toBeTruthy()
    spy.mockRestore()
  })

  it('logs error messages to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('error message', { detail: 'test' })
    expect(spy).toHaveBeenCalled()
    const call = JSON.parse(spy.mock.calls[0][0])
    expect(call.level).toBe('error')
    expect(call.detail).toBe('test')
    spy.mockRestore()
  })

  it('includes metadata in log output', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('with meta', { key: 'value', count: 42 })
    const call = JSON.parse(spy.mock.calls[0][0])
    expect(call.key).toBe('value')
    expect(call.count).toBe(42)
    spy.mockRestore()
  })
})
