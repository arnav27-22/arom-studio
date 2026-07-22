import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const LOCAL_DIR = path.resolve(process.cwd(), 'data')
const TMP_DIR = '/tmp/arom_data'
const BLOB_PREFIX = 'arom-data/'
const useBlob = !!(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN)

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function localPath(name) {
  const dir = process.env.VERCEL ? TMP_DIR : LOCAL_DIR
  ensureDir(dir)
  return path.join(dir, `${name}.json`)
}

function localRead(name) {
  try { return JSON.parse(fs.readFileSync(localPath(name), 'utf-8')) } catch { return [] }
}

function localWrite(name, data) {
  fs.writeFileSync(localPath(name), JSON.stringify(data))
}

// In-memory cache to share data across requests within the same instance
const cache = {}

function cachedRead(name) {
  if (cache[name]) return cache[name]
  const data = localRead(name)
  cache[name] = data
  return data
}

function cachedWrite(name, data) {
  cache[name] = data
  localWrite(name, data)
}

// Blob-based persistent storage (shared across all instances)
let blobModule = null
async function getBlob() {
  if (!blobModule) blobModule = await import('@vercel/blob')
  return blobModule
}

async function blobRead(name) {
  try {
    const { list, get } = await getBlob()
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${name}.json` })
    if (!blobs.length) return []
    const res = await get(blobs[0].url)
    return JSON.parse(await res.text())
  } catch { return [] }
}

async function blobWrite(name, data) {
  const { put, list, del } = await getBlob()
  const json = JSON.stringify(data)
  // Delete old blob first to avoid accumulation
  try {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${name}.json` })
    for (const b of blobs) await del(b.url)
  } catch {}
  await put(`${BLOB_PREFIX}${name}.json`, json, { access: 'public', addRandomSuffix: false })
}

// Exported functions — use Blob when available, otherwise local /tmp
export async function read(name) {
  if (useBlob) return blobRead(name)
  return cachedRead(name)
}

export async function write(name, data) {
  if (useBlob) await blobWrite(name, data)
  else cachedWrite(name, data)
}

export async function append(name, item) {
  if (useBlob) {
    const existing = await blobRead(name)
    existing.push(item)
    await blobWrite(name, existing)
    return
  }
  const all = cachedRead(name)
  all.push(item)
  cachedWrite(name, all)
}
