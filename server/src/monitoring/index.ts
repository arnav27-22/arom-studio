import { logger } from '../utils/logger'
import { prisma } from '../database/prisma'

const SLOW_QUERY_THRESHOLD = 500
let requestCount = 0
let errorCount = 0
const responseTimes: number[] = []
const MAX_TIMING_SAMPLES = 1000

export function recordRequest(): void {
  requestCount++
}

export function recordError(): void {
  errorCount++
}

export function recordResponseTime(ms: number): void {
  responseTimes.push(ms)
  if (responseTimes.length > MAX_TIMING_SAMPLES) {
    responseTimes.shift()
  }
  if (ms > SLOW_QUERY_THRESHOLD) {
    logger.warn('Slow response detected', { durationMs: ms })
  }
}

export function getMetrics(): {
  totalRequests: number
  totalErrors: number
  errorRate: number
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
} {
  const avg = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0
  const sorted = [...responseTimes].sort((a, b) => a - b)
  const p95Index = Math.floor(sorted.length * 0.95)
  const p99Index = Math.floor(sorted.length * 0.99)

  return {
    totalRequests: requestCount,
    totalErrors: errorCount,
    errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0,
    avgResponseTime: Math.round(avg),
    p95ResponseTime: sorted[p95Index] || 0,
    p99ResponseTime: sorted[p99Index] || 0,
  }
}

export function setupPrismaMonitoring(): void {
  ;(prisma as any).$on('query', (e: any) => {
    if (e.duration > SLOW_QUERY_THRESHOLD) {
      logger.warn('Slow database query', {
        duration: e.duration,
        query: e.query?.substring(0, 200),
      })
    }
  })
}

export { requestCount, errorCount }
