import os from 'os'
import { checkDatabaseHealth } from '../database/prisma'
import { redisClient } from '../cache/redis'
import { wsManager } from '../websocket/WebSocketManager'
import { CONFIG } from '../config'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  memory: {
    total: string
    free: string
    usagePercent: number
    heapUsed: string
    heapTotal: string
  }
  cpu: {
    loadAvg: number[]
    cpus: number
  }
  database: {
    connected: boolean
    latency: number
    poolStatus: { totalCount: number; idleCount: number; waitingCount: number }
  }
  redis: {
    connected: boolean
    latency: number
    memory: string
    uptime: number
  }
  websocket: {
    connected: boolean
    clients: number
  }
  storage: {
    provider: string
    writable: boolean
  }
  uptimeHuman: string
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

export async function getHealth(): Promise<HealthStatus> {
  const [dbHealth, redisInfo] = await Promise.all([
    checkDatabaseHealth(),
    redisClient.getConnectionInfo().catch(() => ({
      connected: false, latency: 0, memory: '0', uptime: 0,
    })),
  ])

  const memUsage = process.memoryUsage()
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: CONFIG.VERSION,
    environment: CONFIG.NODE_ENV,
    memory: {
      total: formatBytes(os.totalmem()),
      free: formatBytes(os.freemem()),
      usagePercent: ((1 - os.freemem() / os.totalmem()) * 100),
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
    },
    cpu: {
      loadAvg: os.loadavg(),
      cpus: os.cpus().length,
    },
    database: dbHealth,
    redis: redisInfo,
    websocket: {
      connected: wsManager.isHealthy(),
      clients: wsManager.getClientCount(),
    },
    storage: {
      provider: CONFIG.STORAGE_PROVIDER,
      writable: true,
    },
    uptimeHuman: formatUptime(Math.floor(process.uptime())),
  }

  if (!dbHealth.connected) {
    health.status = 'unhealthy'
  } else if (!redisInfo.connected && CONFIG.REDIS_URL) {
    health.status = 'degraded'
  }

  return health
}

export async function getLiveness(): Promise<{ status: string; timestamp: string }> {
  return { status: 'alive', timestamp: new Date().toISOString() }
}

export async function getReadiness(): Promise<{ status: string; checks: Record<string, boolean> }> {
  const [dbHealth, redisInfo] = await Promise.all([
    checkDatabaseHealth(),
    redisClient.getConnectionInfo().catch(() => ({
      connected: false, latency: 0, memory: '0', uptime: 0,
    })),
  ])

  const checks = {
    database: dbHealth.connected,
    redis: CONFIG.REDIS_URL ? redisInfo.connected : true,
    websocket: wsManager.isHealthy(),
  }

  return {
    status: Object.values(checks).every(Boolean) ? 'ready' : 'not_ready',
    checks,
  }
}
