import fs from 'fs'
import path from 'path'
import { CONFIG } from '../config'
import { logger } from '../utils/logger'
import { enqueue } from '../jobs/worker'

interface BackupResult {
  filename: string
  size: number
  createdAt: Date
}

interface BackupSchedule {
  type: 'daily' | 'weekly' | 'monthly'
  retention: number
  cron: string
}

const SCHEDULES: BackupSchedule[] = [
  { type: 'daily', retention: 7, cron: '0 2 * * *' },
  { type: 'weekly', retention: 4, cron: '0 3 * * 0' },
  { type: 'monthly', retention: 3, cron: '0 4 1 * *' },
]

export async function createBackup(): Promise<BackupResult> {
  const { execSync } = await import('child_process')

  if (!CONFIG.BACKUP_ENABLED) {
    throw new Error('Backups are not enabled')
  }

  ensureBackupDir()

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `arom-studio-backup-${timestamp}.sql.gz`
  const filepath = path.join(CONFIG.BACKUP_DIR, filename)

  try {
    execSync(
      `pg_dump "${CONFIG.DATABASE_URL.replace(/"/g, '\\"')}" --no-owner --no-acl | gzip > "${filepath.replace(/"/g, '\\"')}"`,
      { timeout: 180000, stdio: 'pipe' }
    )

    const stats = fs.statSync(filepath)
    const result: BackupResult = {
      filename,
      size: stats.size,
      createdAt: new Date(),
    }

    logger.info('Backup created', {
      filename,
      size: `${(result.size / 1024 / 1024).toFixed(2)} MB`,
    })

    await cleanupOldBackups()
    return result
  } catch (err) {
    logger.error('Backup failed', { error: (err as Error).message })
    throw err
  }
}

function ensureBackupDir(): void {
  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true })
  }
}

async function cleanupOldBackups(): Promise<void> {
  ensureBackupDir()

  for (const schedule of SCHEDULES) {
    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter((f) => f.startsWith('arom-studio-backup-'))
      .map((f) => ({
        name: f,
        path: path.join(CONFIG.BACKUP_DIR, f),
        mtime: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    if (files.length > schedule.retention) {
      const toDelete = files.slice(schedule.retention)
      for (const file of toDelete) {
        fs.unlinkSync(file.path)
        logger.debug('Deleted old backup', { filename: file.name })
      }
    }
  }
}

export async function restoreBackup(filepath: string): Promise<void> {
  const { execSync } = await import('child_process')

  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup file not found: ${filepath}`)
  }

  try {
  const safePath = filepath.replace(/"/g, '\\"')
  const safeDbUrl = CONFIG.DATABASE_URL.replace(/"/g, '\\"')
  const cmd = filepath.endsWith('.gz')
    ? `gunzip -c "${safePath}" | psql "${safeDbUrl}"`
    : `psql "${safeDbUrl}" < "${safePath}"`
  execSync(cmd, { timeout: 300000, stdio: 'pipe' })

    logger.info('Backup restored', { filepath })
  } catch (err) {
    logger.error('Backup restore failed', { filepath, error: (err as Error).message })
    throw err
  }
}

export async function listBackups(): Promise<BackupResult[]> {
  ensureBackupDir()

  return fs.readdirSync(CONFIG.BACKUP_DIR)
    .filter((f) => f.startsWith('arom-studio-backup-'))
    .map((f) => ({
      filename: f,
      size: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).size,
      createdAt: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).mtime,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function verifyLatestBackup(): Promise<{ valid: boolean; size: number; message: string }> {
  const backups = await listBackups()
  if (backups.length === 0) {
    return { valid: false, size: 0, message: 'No backups found' }
  }

  const latest = backups[0]
  if (latest.size === 0) {
    return { valid: false, size: 0, message: 'Latest backup is empty' }
  }

  try {
    const { execSync } = await import('child_process')
    execSync(`gunzip -t "${path.join(CONFIG.BACKUP_DIR, latest.filename)}"`, {
      timeout: 30000, stdio: 'pipe',
    })
    return { valid: true, size: latest.size, message: 'Backup verified successfully' }
  } catch {
    return { valid: false, size: latest.size, message: 'Backup file is corrupted' }
  }
}

export function getBackupSchedules(): BackupSchedule[] {
  return SCHEDULES
}
