import crypto from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { CONFIG } from '../config'
import { logger } from '../utils/logger'

export interface StoredPDF {
  buffer: Buffer
  sha256Hash: string
  fileSize: number
  fileSizeKb: number
  pageCount: number
  storageUrl: string
  storageProvider: string
  fileName: string
}

function countPages(buffer: Buffer): number {
  const text = buffer.toString('latin1')
  const matches = text.match(/\/Type\s*\/Page[^s]/g)
  return matches ? matches.length : 0
}

function computeSHA256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function generateFileName(clientName: string, pdfType: string): string {
  const date = new Date().toISOString().split('T')[0]
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  return `${safe(pdfType)}_${safe(clientName)}_${date}.pdf`
}

function generateReferenceNumber(): string {
  const prefix = 'PDF'
  const ts = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomUUID().slice(0, 4).toUpperCase()
  return `${prefix}-${ts}-${rand}`
}

export async function storePDF(
  buffer: Buffer,
  clientName: string,
  pdfType: string,
  additional?: { title?: string; clientEmail?: string; company?: string; phone?: string; agreementId?: string; visitorId?: string; sessionId?: string }
): Promise<StoredPDF> {
  const sha256Hash = computeSHA256(buffer)
  const pageCount = countPages(buffer)
  const fileSize = buffer.length
  const fileSizeKb = Math.round(fileSize / 1024)
  const fileName = additional?.title || generateFileName(clientName, pdfType)
  const safeName = generateFileName(clientName, pdfType)

  const storageDir = path.resolve(CONFIG.STORAGE_LOCAL_PATH || path.join(process.cwd(), 'server', 'storage', 'pdfs'))
  await fs.mkdir(storageDir, { recursive: true })
  const storageKey = `pdfs/${crypto.randomUUID()}-${safeName}`
  const filePath = path.join(storageDir, path.basename(storageKey))

  await fs.writeFile(filePath, buffer)

  const storageUrl = `/storage/pdfs/${path.basename(storageKey)}`
  const storageProvider = 'filesystem'

  logger.info('PDF stored', { sha256Hash, pageCount, fileSizeKb, storageUrl })

  return { buffer, sha256Hash, fileSize, fileSizeKb, pageCount, storageUrl, storageProvider, fileName }
}

export async function retrievePDF(storageUrl: string): Promise<Buffer | null> {
  try {
    const storageDir = path.resolve(CONFIG.STORAGE_LOCAL_PATH || path.join(process.cwd(), 'server', 'storage', 'pdfs'))
    const fileName = path.basename(storageUrl)
    const filePath = path.join(storageDir, fileName)
    const buffer = await fs.readFile(filePath)
    return buffer
  } catch (err) {
    logger.error('Failed to retrieve PDF', { storageUrl, error: (err as Error).message })
    return null
  }
}

export async function deleteStoredPDF(storageUrl: string): Promise<boolean> {
  try {
    const storageDir = path.resolve(CONFIG.STORAGE_LOCAL_PATH || path.join(process.cwd(), 'server', 'storage', 'pdfs'))
    const fileName = path.basename(storageUrl)
    const filePath = path.join(storageDir, fileName)
    await fs.unlink(filePath)
    return true
  } catch (err) {
    logger.error('Failed to delete PDF', { storageUrl, error: (err as Error).message })
    return false
  }
}

export function verifyPDFIntegrity(buffer: Buffer, expectedHash: string): boolean {
  const actualHash = computeSHA256(buffer)
  return actualHash === expectedHash
}

export { computeSHA256, countPages, generateFileName, generateReferenceNumber }
