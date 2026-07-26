import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { logger } from '../utils/logger'

export function auditLog(action: string, module: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res)
    let body: unknown

    res.json = function (data: unknown) {
      body = data
      return originalJson(data)
    } as typeof res.json

    res.on('finish', async () => {
      if (res.statusCode < 400) {
        try {
          await prisma.auditLog.create({
            data: {
              adminId: req.admin?.adminId,
              action,
              module,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              success: res.statusCode < 400,
              severity: res.statusCode < 400 ? 'INFO' : 'ERROR',
            },
          })
        } catch (err) {
          logger.error('Failed to write audit log', { error: String(err) })
        }
      }
    })

    next()
  }
}
