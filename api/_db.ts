import fs from 'fs'
import path from 'path'

const DATA_DIR = process.env.VERCEL ? '/tmp/arom_data' : path.resolve(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function filePath(name: string): string {
  ensureDir()
  return path.join(DATA_DIR, `${name}.json`)
}

function read<T>(name: string): T[] {
  const fp = filePath(name)
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    return []
  }
}

function write<T>(name: string, data: T[]) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2))
}

function append<T>(name: string, item: T) {
  const all = read<T>(name)
  all.push(item)
  write(name, all)
}

export const db = {
  read,
  write,
  append,
}
