import fs from 'fs'
import path from 'path'

const LOCAL_DIR = path.resolve(process.cwd(), 'data')
const TMP_DIR = '/tmp/arom_data'
const BLOB_PREFIX = 'arom-data/'
const useBlob = !!(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN)

function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
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
  try {
    fs.writeFileSync(localPath(name), JSON.stringify(data))
  } catch {
    /* write error in serverless environment */
  }
}

// In-memory cache to share data across requests within the same instance
const cache = {}

function cachedRead(name) {
  if (Array.isArray(cache[name])) return cache[name]
  const data = localRead(name)
  const safeData = Array.isArray(data) ? data : []
  cache[name] = safeData
  return safeData
}

function cachedWrite(name, data) {
  cache[name] = Array.isArray(data) ? data : []
  localWrite(name, cache[name])
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
    if (!blobs.length) return cachedRead(name)
    const res = await get(blobs[0].url)
    const json = JSON.parse(await res.text())
    return Array.isArray(json) ? json : cachedRead(name)
  } catch {
    return cachedRead(name)
  }
}

async function blobWrite(name, data) {
  try {
    const { put, list, del } = await getBlob()
    const json = JSON.stringify(data)
    try {
      const { blobs } = await list({ prefix: `${BLOB_PREFIX}${name}.json` })
      for (const b of blobs) await del(b.url)
    } catch {}
    await put(`${BLOB_PREFIX}${name}.json`, json, { access: 'public', addRandomSuffix: false })
  } catch {
    cachedWrite(name, data)
  }
}

// Exported functions — use Blob when available, otherwise local /tmp
async function read(name) {
  if (useBlob) return blobRead(name)
  return cachedRead(name)
}

async function write(name, data) {
  if (useBlob) await blobWrite(name, data)
  else cachedWrite(name, data)
}

async function append(name, item) {
  if (useBlob) {
    const existing = await blobRead(name)
    const safeList = Array.isArray(existing) ? existing : []
    safeList.push(item)
    await blobWrite(name, safeList)
    return
  }
  const all = cachedRead(name)
  const safeList = Array.isArray(all) ? all : []
  safeList.push(item)
  cachedWrite(name, safeList)
}

export const db = { read, write, append }
