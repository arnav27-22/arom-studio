import fs from 'fs'
import path from 'path'

const DATA_DIR = process.env.VERCEL ? '/tmp/arom_data' : path.resolve(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function filePath(name) {
  ensureDir()
  return path.join(DATA_DIR, `${name}.json`)
}

function read(name) {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), 'utf-8'))
  } catch {
    return []
  }
}

function write(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data))
}

function append(name, item) {
  const all = read(name)
  all.push(item)
  write(name, all)
}

export const db = { read, write, append }
