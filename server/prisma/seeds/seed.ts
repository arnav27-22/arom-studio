import { PrismaClient } from '../../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('Admin@123', 12)

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@aromstudio.com' },
    update: {},
    create: {
      email: 'admin@aromstudio.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      passwordHash,
      isActive: true,
    },
  })
  console.log('Admin created:', admin.id)

  const notifications = [
    { type: 'WELCOME' as const, title: 'Welcome to AROM STUDIO', message: 'System is ready', read: false },
    { type: 'INQUIRY' as const, title: 'Test Notification', message: 'This is a test notification', read: true },
  ]
  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }
  console.log('Notifications seeded')

  const settings = [
    { key: 'site_name', value: 'AROM STUDIO' },
    { key: 'admin_email', value: 'admin@aromstudio.com' },
    { key: 'session_timeout', value: '28800000' },
  ]
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('Settings seeded')

  console.log('Seeding complete')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
