import fs from 'fs'
import path from 'path'
import { put, get, list } from '@vercel/blob'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const BLOB_PREFIX = 'arom-data/'

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function localPath(name) {
  ensureDir()
  return path.join(DATA_DIR, `${name}.json`)
}

function localRead(name) {
  try {
    return JSON.parse(fs.readFileSync(localPath(name), 'utf-8'))
  } catch {
    return []
  }
}

function localWrite(name, data) {
  fs.writeFileSync(localPath(name), JSON.stringify(data, null, 2))
}

const useBlob = !!(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN)

async function blobRead(name) {
  try {
    const blobUrl = `${BLOB_PREFIX}${name}.json`
    const { blobs } = await list({ prefix: blobUrl })
    if (blobs.length === 0) return []
    const response = await get(blobs[0].url)
    const text = await response.text()
    return JSON.parse(text)
  } catch {
    return []
  }
}

async function blobWrite(name, data) {
  await put(`${BLOB_PREFIX}${name}.json`, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
  })
}

export async function read(name) {
  if (useBlob) return blobRead(name)
  return localRead(name)
}

export async function write(name, data) {
  if (useBlob) { await blobWrite(name, data); return }
  localWrite(name, data)
}

export async function append(name, item) {
  if (useBlob) {
    const existing = await blobRead(name)
    existing.push(item)
    await blobWrite(name, existing)
    return
  }
  const all = localRead(name)
  all.push(item)
  localWrite(name, all)
}
