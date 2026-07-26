import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '../utils/errors'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target])
      req[target] = data
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        next(new ValidationError('Validation failed', details))
      } else {
        next(err)
      }
    }
  }
}
