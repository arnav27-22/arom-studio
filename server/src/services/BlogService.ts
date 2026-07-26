import { prisma } from '../database/prisma'
import { NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'

interface ListParams {
  page: number
  limit: number
  category?: string
  tag?: string
  published?: boolean
  includeDeleted?: boolean
}

interface ListResult {
  total: number
  page: number
  blogs: unknown[]
}

export class BlogService {
  async list(params: ListParams): Promise<ListResult> {
    const { page, limit, category, tag, published, includeDeleted } = params

    const where: Record<string, unknown> = {}

    if (!includeDeleted) {
      where.deletedAt = null
    }

    if (category) {
      where.category = category
    }

    if (published !== undefined) {
      where.published = published
    }

    if (tag) {
      where.tags = { array_contains: tag }
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.blog.count({ where: where as any }),
    ])

    return { total, page, blogs }
  }

  async getById(id: string) {
    const blog = await prisma.blog.findUnique({ where: { id } })
    if (!blog || blog.deletedAt) {
      throw new NotFoundError('Blog', id)
    }
    return blog
  }

  async getBySlug(slug: string) {
    const blog = await prisma.blog.findUnique({ where: { slug } })
    if (!blog || blog.deletedAt || !blog.published) {
      throw new NotFoundError('Blog', slug)
    }
    return blog
  }

  async generateUniqueSlug(title: string, existingId?: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100)

    if (!slug) slug = 'post'

    let candidate = slug
    let counter = 1

    while (true) {
      const existing = await prisma.blog.findUnique({ where: { slug: candidate } })
      if (!existing || (existingId && existing.id === existingId)) {
        return candidate
      }
      candidate = `${slug}-${counter}`
      counter++
    }
  }

  async create(data: {
    title: string
    slug?: string
    excerpt?: string
    content?: string
    category?: string
    readTime?: string
    author?: unknown
    date?: string
    tags?: string[]
    coverImage?: string
    published?: boolean
  }) {
    const slug = data.slug || (await this.generateUniqueSlug(data.title))

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content || null,
        category: data.category || null,
        readTime: data.readTime || null,
        author: (data.author as any) || null,
        date: data.date ? new Date(data.date) : null,
        tags: (data.tags as any) || null,
        published: data.published ?? true,
      },
    })

    logger.info('Blog created', { id: blog.id, slug: blog.slug })
    return blog
  }

  async update(
    id: string,
    data: {
      title?: string
      slug?: string
      excerpt?: string
      content?: string
      category?: string
      readTime?: string
      author?: unknown
      date?: string
      tags?: string[]
      coverImage?: string
      published?: boolean
    }
  ) {
    const existing = await prisma.blog.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Blog', id)
    }

    let slug = data.slug
    if (!slug && data.title && data.title !== existing.title) {
      slug = await this.generateUniqueSlug(data.title, id)
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(slug !== undefined && { slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.readTime !== undefined && { readTime: data.readTime }),
        ...(data.author !== undefined && { author: data.author as any }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.tags !== undefined && { tags: data.tags as any }),
        ...(data.published !== undefined && { published: data.published }),
      },
    })

    logger.info('Blog updated', { id: blog.id, slug: blog.slug })
    return blog
  }

  async delete(id: string) {
    const existing = await prisma.blog.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Blog', id)
    }

    await prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    logger.info('Blog soft-deleted', { id })
    return { success: true }
  }
}

export const blogService = new BlogService()