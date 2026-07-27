import fs from 'fs'
import path from 'path'

const LOCAL_DIR = path.resolve(process.cwd(), 'data')
const BLOB_PREFIX = 'arom-data/'
const useBlob = !!(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN)

function localPath(name) {
  if (process.env.VERCEL) {
    return path.join('/tmp', `arom_${name}.json`)
  }
  try {
    if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true })
  } catch {}
  return path.join(LOCAL_DIR, `${name}.json`)
}

function localRead(name) {
  try {
    const p = localPath(name)
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'))
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {}
  return []
}

function localWrite(name, data) {
  try {
    const p = localPath(name)
    fs.writeFileSync(p, JSON.stringify(data))
  } catch {}
}

// Memory cache for active lambda execution context
const cache = {}

function cachedRead(name) {
  if (Array.isArray(cache[name])) return cache[name]
  const data = localRead(name)
  const safe = Array.isArray(data) ? data : []
  cache[name] = safe
  return safe
}

function cachedWrite(name, data) {
  const safe = Array.isArray(data) ? data : []
  cache[name] = safe
  localWrite(name, safe)
}

let blobModule = null
async function getBlob() {
  if (!blobModule) blobModule = await import('@vercel/blob')
  return blobModule
}

async function blobRead(name) {
  if (!useBlob) return cachedRead(name)
  try {
    const { list, get } = await getBlob()
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}${name}.json` })
    if (!blobs.length) return cachedRead(name)
    const res = await get(blobs[0].url)
    const json = JSON.parse(await res.text())
    if (Array.isArray(json)) {
      cache[name] = json
      return json
    }
    return cachedRead(name)
  } catch {
    return cachedRead(name)
  }
}

async function blobWrite(name, data) {
  const safe = Array.isArray(data) ? data : []
  cachedWrite(name, safe)

  if (useBlob) {
    try {
      const { put, list, del } = await getBlob()
      const json = JSON.stringify(safe)
      try {
        const { blobs } = await list({ prefix: `${BLOB_PREFIX}${name}.json` })
        for (const b of blobs) await del(b.url)
      } catch {}
      await put(`${BLOB_PREFIX}${name}.json`, json, { access: 'public', addRandomSuffix: false })
    } catch {
      // Vercel Blob store suspended or failed - cached write handles persistence
    }
  }
}

export async function read(name) {
  return blobRead(name)
}

export async function write(name, data) {
  await blobWrite(name, data)
}

export async function append(name, item) {
  const existing = await read(name)
  const safeList = Array.isArray(existing) ? existing : []
  safeList.unshift(item)
  await write(name, safeList)
}

export const db = { read, write, append }
