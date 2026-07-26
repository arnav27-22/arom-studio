import { logger } from '../utils/logger'
import { enqueue } from './worker'

interface ScheduledTask {
  name: string
  interval: number
  handler: () => Promise<void>
  lastRun: number
  running: boolean
}

const tasks: ScheduledTask[] = []
let schedulerInterval: ReturnType<typeof setInterval> | null = null

export function scheduleTask(name: string, intervalMs: number, handler: () => Promise<void>): void {
  tasks.push({ name, interval: intervalMs, handler, lastRun: 0, running: false })
  logger.info('Task scheduled', { name, intervalMs })
}

function startScheduler(): void {
  if (schedulerInterval) return

  schedulerInterval = setInterval(async () => {
    const now = Date.now()

    for (const task of tasks) {
      if (task.running) continue
      if (now - task.lastRun >= task.interval) {
        task.running = true
        task.handler()
          .catch((err) => {
            logger.error('Scheduled task failed', {
              task: task.name,
              error: (err as Error).message,
            })
          })
          .finally(() => {
            task.lastRun = Date.now()
            task.running = false
          })
      }
    }
  }, 10000)
}

export function initializeScheduler(): void {
  scheduleTask('analytics:aggregate', 1800000, async () => {
    await enqueue('analytics:aggregate', {})
  })

  scheduleTask('cleanup:sessions', 3600000, async () => {
    await enqueue('cleanup:sessions', {})
  })

  scheduleTask('cleanup:recycle', 43200000, async () => {
    await enqueue('cleanup:recycle', {})
  })

  scheduleTask('cleanup:temp', 21600000, async () => {
    await enqueue('cleanup:temp', {})
  })

  scheduleTask('cleanup:logs', 86400000, async () => {
    await enqueue('cleanup:logs', {})
  })

  scheduleTask('report:daily', 86400000, async () => {
    await enqueue('report:daily', {})
  })

  scheduleTask('report:weekly', 604800000, async () => {
    await enqueue('report:weekly', {})
  })

  scheduleTask('report:monthly', 2592000000, async () => {
    await enqueue('report:monthly', {})
  })

  scheduleTask('backup:database', 86400000, async () => {
    if (process.env.BACKUP_ENABLED === 'true') {
      await enqueue('backup:database', {})
    }
  })

  startScheduler()
  logger.info('Scheduler initialized with all tasks')
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
  }
  logger.info('Scheduler stopped')
}
