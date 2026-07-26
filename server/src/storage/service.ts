import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import { CONFIG } from '../config'
import { logger } from '../utils/logger'
import { prisma } from '../database/prisma'

type StorageProvider = 'local' | 'vercel-blob' | 'aws-s3' | 'cloudflare-r2'

interface UploadResult {
  url: string
  key: string
  size: number
  mimeType: string
}

interface SignedUrlResult {
  url: string
  expiresAt: Date
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
  'text/csv',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024

const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'image/svg+xml': [[0x3C, 0x73, 0x76, 0x67], [0x3C, 0x3F, 0x78, 0x6D]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/zip': [[0x50, 0x4B, 0x03, 0x04]],
}

function matchesMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const patterns = MAGIC_BYTES[mimeType]
  if (!patterns) return true
  return patterns.some((bytes) =>
    bytes.every((b, i) => buffer[i] === b)
  )
}

function validateFile(mimeType: string, buffer: Buffer): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed`)
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size ${buffer.length} exceeds maximum of ${MAX_FILE_SIZE} bytes`)
  }
  if (!matchesMagicBytes(buffer, mimeType)) {
    throw new Error(`File content does not match claimed type ${mimeType}`)
  }
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  module?: string,
  resourceId?: string
): Promise<UploadResult> {
  validateFile(mimeType, buffer)

  const provider = CONFIG.STORAGE_PROVIDER as StorageProvider
  const safeModule = (module || 'general').replace(/[^a-zA-Z0-9_-]/g, '')
  const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, '')
  const key = `${safeModule}/${randomUUID()}${ext}`

  let result: UploadResult

  switch (provider) {
    case 'vercel-blob':
      result = await uploadToVercelBlob(buffer, key, mimeType)
      break
    case 'aws-s3':
      result = await uploadToS3(buffer, key, mimeType)
      break
    case 'cloudflare-r2':
      result = await uploadToR2(buffer, key, mimeType)
      break
    default:
      result = await uploadToLocal(buffer, key, mimeType)
  }

  await prisma.file.create({
    data: {
      originalName,
      mimeType,
      size: buffer.length,
      storageUrl: result.url,
      uploadedBy: module || undefined,
      module: module || undefined,
      resourceId: resourceId || undefined,
    },
  })

  logger.info('File uploaded', { key, size: buffer.length, mimeType })
  return result
}

async function uploadToLocal(buffer: Buffer, key: string, _mimeType: string): Promise<UploadResult> {
  const filePath = path.join(CONFIG.STORAGE_LOCAL_PATH, key)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, buffer)
  return {
    url: `/uploads/${key}`,
    key,
    size: buffer.length,
    mimeType: _mimeType,
  }
}

async function uploadToVercelBlob(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
  if (!CONFIG.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Vercel Blob token not configured')
  }
  const { put } = await import('@vercel/blob')
  const blob = await put(key, buffer, {
    access: 'public',
    contentType: mimeType,
    token: CONFIG.BLOB_READ_WRITE_TOKEN,
  })
  return { url: blob.url, key, size: buffer.length, mimeType }
}

async function uploadToS3(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region: CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
    },
  })
  await client.send(new PutObjectCommand({
    Bucket: CONFIG.AWS_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }))
  return {
    url: `https://${CONFIG.AWS_BUCKET}.s3.${CONFIG.AWS_REGION}.amazonaws.com/${key}`,
    key,
    size: buffer.length,
    mimeType,
  }
}

async function uploadToR2(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
    },
  })
  await client.send(new PutObjectCommand({
    Bucket: CONFIG.R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }))
  const publicUrl = CONFIG.R2_PUBLIC_URL || `https://${CONFIG.R2_BUCKET}.${CONFIG.R2_ACCOUNT_ID}.r2.dev`
  return { url: `${publicUrl}/${key}`, key, size: buffer.length, mimeType }
}

export async function deleteFile(key: string): Promise<void> {
  const provider = CONFIG.STORAGE_PROVIDER as StorageProvider

  switch (provider) {
    case 'local': {
      const filePath = path.join(CONFIG.STORAGE_LOCAL_PATH, key)
      await fs.unlink(filePath).catch(() => {})
      break
    }
    case 'vercel-blob': {
      const { del } = await import('@vercel/blob')
      await del(key, { token: CONFIG.BLOB_READ_WRITE_TOKEN })
      break
    }
    case 'aws-s3': {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      const client = new S3Client({
        region: CONFIG.AWS_REGION,
        credentials: {
          accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
          secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
        },
      })
      await client.send(new DeleteObjectCommand({ Bucket: CONFIG.AWS_BUCKET, Key: key }))
      break
    }
    case 'cloudflare-r2': {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
          secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
        },
      })
      await client.send(new DeleteObjectCommand({ Bucket: CONFIG.R2_BUCKET, Key: key }))
      break
    }
  }
}

export async function getSignedUrl(key: string, expiresIn = 3600): Promise<SignedUrlResult> {
  const provider = CONFIG.STORAGE_PROVIDER as StorageProvider
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  switch (provider) {
    case 'aws-s3': {
      const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3')
      const { getSignedUrl: s3SignedUrl } = await import('@aws-sdk/s3-request-presigner')
      const client = new S3Client({
        region: CONFIG.AWS_REGION,
        credentials: {
          accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
          secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
        },
      })
      const url = await s3SignedUrl(client, new GetObjectCommand({
        Bucket: CONFIG.AWS_BUCKET, Key: key,
      }), { expiresIn })
      return { url, expiresAt }
    }
    case 'cloudflare-r2': {
      const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3')
      const { getSignedUrl: s3SignedUrl } = await import('@aws-sdk/s3-request-presigner')
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
          secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
        },
      })
      const url = await s3SignedUrl(client, new GetObjectCommand({
        Bucket: CONFIG.R2_BUCKET, Key: key,
      }), { expiresIn })
      return { url, expiresAt }
    }
    default: {
      return { url: `/uploads/${key}`, expiresAt }
    }
  }
}

export async function getFileMetadata(id: string): Promise<UploadResult | null> {
  const file = await prisma.file.findUnique({ where: { id } })
  if (!file) return null
  return {
    url: file.storageUrl,
    key: file.storageUrl.split('/').pop() || file.id,
    size: file.size,
    mimeType: file.mimeType,
  }
}
