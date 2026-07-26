import { Request, Response, NextFunction } from 'express'
import { blogService } from '../services/BlogService'

export class BlogController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const category = req.query.category as string | undefined
      const tag = req.query.tag as string | undefined
      const published = req.query.published !== undefined ? req.query.published === 'true' : undefined

      const result = await blogService.list({ page, limit, category, tag, published })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await blogService.getById(req.params.id as string)
      res.json(blog)
    } catch (err) {
      next(err)
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await blogService.getBySlug(req.params.slug as string)
      res.json(blog)
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await blogService.create(req.body)
      res.status(201).json(blog)
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await blogService.update(req.params.id as string, req.body)
      res.json(blog)
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await blogService.delete(req.params.id as string)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

export const blogController = new BlogController()