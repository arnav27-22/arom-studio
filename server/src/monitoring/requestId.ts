import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      correlationId?: string
      startTime: number
    }
  }
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = req.headers['x-request-id'] as string || randomUUID()
  req.correlationId = req.headers['x-correlation-id'] as string || req.requestId
  req.startTime = Date.now()
  next()
}

export function responseTimingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const originalEnd = res.end
  res.end = function (this: Response, ...args: any[]) {
    const duration = Date.now() - req.startTime
    res.setHeader('x-response-time', `${duration}ms`)
    res.setHeader('x-request-id', req.requestId)
    return originalEnd.apply(this, args as any)
  } as typeof res.end
  next()
}
