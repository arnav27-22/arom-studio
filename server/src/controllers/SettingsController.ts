import { Request, Response, NextFunction } from 'express'
import { prisma } from '../database/prisma'
import { CONFIG } from '../config'

export class SettingsController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.setting.findMany()
      const settingsMap: Record<string, unknown> = {}
      settings.forEach(s => { settingsMap[s.key] = s.value })

      res.json({
        ...settingsMap,
        envChecks: {
          ADMIN_PASSWORD: !!CONFIG.ADMIN_PASSWORD,
          ADMIN_JWT_SECRET: !!CONFIG.JWT_SECRET,
          DATABASE_URL: !!CONFIG.DATABASE_URL,
        },
        allSet: !!(CONFIG.ADMIN_PASSWORD && CONFIG.JWT_SECRET && CONFIG.DATABASE_URL),
        adminSessionTimeout: '8h',
      })
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body

      await prisma.setting.upsert({
        where: { key },
        update: { value: JSON.parse(JSON.stringify(value)) },
        create: { key, value: JSON.parse(JSON.stringify(value)) },
      })

      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}

export const settingsController = new SettingsController()
