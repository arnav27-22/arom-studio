import { prisma } from '../database/prisma'

interface AuditEntry {
  adminId?: string
  action: string
  module: string
  resourceId?: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string
  userAgent?: string
  country?: string
  sessionId?: string
  reason?: string
  success?: boolean
  severity?: 'INFO' | 'WARN' | 'ERROR'
  metadata?: Record<string, unknown>
}

export class AuditService {
  async log(entry: AuditEntry) {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: entry.adminId,
          action: entry.action,
          module: entry.module,
          resourceId: entry.resourceId,
          oldValue: entry.oldValue ? JSON.parse(JSON.stringify(entry.oldValue)) : undefined,
          newValue: entry.newValue ? JSON.parse(JSON.stringify(entry.newValue)) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          country: entry.country,
          sessionId: entry.sessionId,
          reason: entry.reason,
          success: entry.success ?? true,
          severity: entry.severity || 'INFO',
          metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
        },
      })
    } catch (error) {
      console.error('Failed to write audit log:', error)
    }
  }

  async search(params: {
    module?: string
    action?: string
    adminId?: string
    severity?: string
    from?: string
    to?: string
    limit?: number
    offset?: number
  }) {
    const where: Record<string, unknown> = {}
    if (params.module) where.module = params.module
    if (params.action) where.action = params.action
    if (params.adminId) where.adminId = params.adminId
    if (params.severity) where.severity = params.severity
    if (params.from || params.to) {
      const dateFilter: { gte?: Date; lte?: Date } = {}
      if (params.from) dateFilter.gte = new Date(params.from)
      if (params.to) dateFilter.lte = new Date(params.to)
      where.createdAt = dateFilter
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
        include: { admin: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count({ where: where as any }),
    ])

    return { total, logs }
  }
}

export const auditService = new AuditService()
