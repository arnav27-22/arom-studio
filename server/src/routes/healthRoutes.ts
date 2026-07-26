import { Router } from 'express'
import { getHealth, getLiveness, getReadiness } from '../health'

const router = Router()

router.get('/health', async (_req, res) => {
  const health = await getHealth()
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503
  res.status(statusCode).json(health)
})

router.get('/live', async (_req, res) => {
  const liveness = await getLiveness()
  res.json(liveness)
})

router.get('/ready', async (_req, res) => {
  const readiness = await getReadiness()
  const statusCode = readiness.status === 'ready' ? 200 : 503
  res.status(statusCode).json(readiness)
})

export default router
