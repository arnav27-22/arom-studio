import fs from 'fs'
import path from 'path'

const useBlob = !!(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN)

const DATA_DIR = process.env.VERCEL ? '/tmp/arom_data' : path.resolve(process.cwd(), 'data')

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

let blobImpl = null

async function getBlob() {
  if (blobImpl) return blobImpl
  const mod = await import('@vercel/blob')
  blobImpl = mod
  return mod
}

async function blobRead(name) {
  try {
    const { list, get } = await getBlob()
    const { blobs } = await list({ prefix: `arom-data/${name}.json` })
    if (blobs.length === 0) return []
    const response = await get(blobs[0].url)
    return JSON.parse(await response.text())
  } catch {
    return []
  }
}

async function blobWrite(name, data) {
  const { put } = await getBlob()
  await put(`arom-data/${name}.json`, JSON.stringify(data), {
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
