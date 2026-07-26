import { prisma } from '../database/prisma'
import { logger } from '../utils/logger'
import { registerJob } from './worker'

export function registerAllJobs(): void {
  registerJob('email:send', handleEmailSend)
  registerJob('notification:create', handleNotificationCreate)
  registerJob('analytics:aggregate', handleAnalyticsAggregate)
  registerJob('cleanup:sessions', handleSessionCleanup)
  registerJob('cleanup:recycle', handleRecycleCleanup)
  registerJob('cleanup:temp', handleTempCleanup)
  registerJob('cleanup:logs', handleLogArchive)
  registerJob('report:daily', handleDailyReport)
  registerJob('report:weekly', handleWeeklyReport)
  registerJob('report:monthly', handleMonthlyReport)
  registerJob('backup:database', handleDatabaseBackup)
  logger.info('All job handlers registered')
}

async function handleEmailSend(data: unknown): Promise<void> {
  const { to, subject, body } = data as { to: string; subject: string; body: string }
  const emailService = await import('../email/service')
  await emailService.sendEmail({ to, subject, html: body })
  logger.debug('Email sent', { to, subject })
}

async function handleNotificationCreate(data: unknown): Promise<void> {
  const { type, title, message, link } = data as {
    type: string; title: string; message: string; link?: string
  }
  await prisma.notification.create({
    data: { type: type as any, title, message, link, read: false },
  })
  const { wsManager } = await import('../websocket/WebSocketManager')
  wsManager.broadcastToAll('notification:created', { type, title, message, link })
}

async function handleAnalyticsAggregate(): Promise<void> {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  const [visitorCount, leadCount, pdfCount] = await Promise.all([
    prisma.visitor.count({ where: { createdAt: { gte: new Date(today) } } }),
    prisma.lead.count({ where: { createdAt: { gte: new Date(today) } } }),
    prisma.generatedPDF.count({ where: { createdAt: { gte: new Date(today) } } }),
  ])

  await prisma.statSnapshot.create({
    data: {
      type: 'daily',
      data: { visitors: visitorCount, leads: leadCount, pdfs: pdfCount },
      period: today,
    },
  })

  logger.debug('Analytics aggregated', { date: today })
}

async function handleSessionCleanup(): Promise<void> {
  const result = await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  if (result.count > 0) {
    logger.info('Expired sessions cleaned', { count: result.count })
  }
}

async function handleRecycleCleanup(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  const result = await prisma.recycleBin.deleteMany({
    where: { deletedAt: { lt: thirtyDaysAgo } },
  })
  if (result.count > 0) {
    logger.info('Old recycle bin items cleaned', { count: result.count })
  }
}

async function handleTempCleanup(): Promise<void> {
  const tempDir = (await import('../config')).CONFIG.STORAGE_LOCAL_PATH
  const fs = await import('fs/promises')
  const path = await import('path')

  try {
    const files = await fs.readdir(tempDir)
    const now = Date.now()
    let cleaned = 0

    for (const file of files) {
      const filePath = path.join(tempDir, file)
      const stat = await fs.stat(filePath)
      if (now - stat.mtimeMs > 86400000) {
        await fs.unlink(filePath)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.debug('Temp files cleaned', { count: cleaned })
    }
  } catch {
    // temp dir may not exist
  }
}

async function handleLogArchive(): Promise<void> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000)
  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } },
  })
  if (result.count > 0) {
    logger.info('Old audit logs archived', { count: result.count })
  }
}

async function handleDailyReport(): Promise<void> {
  logger.info('Daily report generation started')
  const { statisticsService } = await import('../services/StatisticsService')
  const dashboard = await statisticsService.getDashboard()
  logger.info('Daily report', {
    visitors: dashboard.visitors.today,
    leads: dashboard.leads.new,
    pdfs: dashboard.pdfs.today,
  })
}

async function handleWeeklyReport(): Promise<void> {
  logger.info('Weekly report generation started')
  const { statisticsService } = await import('../services/StatisticsService')
  const dashboard = await statisticsService.getDashboard()
  logger.info('Weekly report', {
    visitors: dashboard.visitors.thisWeek,
    leads: dashboard.leads.total,
    pdfs: dashboard.pdfs.total,
  })
}

async function handleMonthlyReport(): Promise<void> {
  logger.info('Monthly report generation started')
  const { statisticsService } = await import('../services/StatisticsService')
  const dashboard = await statisticsService.getDashboard()
  logger.info('Monthly report', {
    visitors: dashboard.visitors.thisMonth,
    leads: dashboard.leads.total,
    pdfs: dashboard.pdfs.total,
  })
}

async function handleDatabaseBackup(): Promise<void> {
  const { execSync } = await import('child_process')
  const fs = await import('fs')
  const path = await import('path')
  const { CONFIG } = await import('../config')

  const backupDir = CONFIG.BACKUP_DIR
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.sql`
  const filepath = path.join(backupDir, filename)

  try {
    execSync(
      `pg_dump "${CONFIG.DATABASE_URL}" --no-owner --no-acl -f "${filepath}"`,
      { timeout: 120000 }
    )
    const stats = fs.statSync(filepath)
    logger.info('Database backup created', {
      filename,
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    })
  } catch (err) {
    logger.error('Database backup failed', { error: (err as Error).message })
    throw err
  }
}
