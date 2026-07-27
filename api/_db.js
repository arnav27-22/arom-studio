import pkg from 'pg'
import crypto from 'crypto'
const { Pool } = pkg

const DATABASE_URL = process.env.DATABASE_URL
let pool
let initialized = false

async function init() {
  if (initialized) return
  initialized = true
  if (!DATABASE_URL) return
  try {
    pool = new Pool({ connectionString: DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 5000 })
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "DataStore" (
        id TEXT PRIMARY KEY,
        collection TEXT NOT NULL,
        data JSONB NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_datastore_collection ON "DataStore"(collection);
      CREATE INDEX IF NOT EXISTS idx_datastore_collection_created ON "DataStore"(collection, "createdAt" DESC);
    `)
  } catch { pool = null }
}

function isAvailable() {
  return !!pool
}

export async function read(name) {
  await init()
  if (!isAvailable()) return []
  try {
    const { rows } = await pool.query(
      'SELECT data FROM "DataStore" WHERE collection = $1 ORDER BY "createdAt" DESC',
      [name]
    )
    return rows.map(r => r.data)
  } catch { return [] }
}

export async function write(name, data) {
  await init()
  if (!isAvailable()) return
  if (!Array.isArray(data)) return
  const client = await pool.connect().catch(() => null)
  if (!client) return
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM "DataStore" WHERE collection = $1', [name])
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const id = item.id || `${name}_${Date.now()}_${i}`
      await client.query(
        'INSERT INTO "DataStore" (id, collection, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data = $3',
        [id, name, JSON.stringify(item)]
      )
    }
    await client.query('COMMIT')
  } catch {
    await client.query('ROLLBACK').catch(() => {})
  } finally {
    client.release()
  }
}

export async function append(name, item) {
  await init()
  if (!isAvailable()) return
  try {
    const id = item.id || `${name}_${Date.now()}_${crypto.randomUUID()}`
    await pool.query(
      'INSERT INTO "DataStore" (id, collection, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data = $3',
      [id, name, JSON.stringify(item)]
    )
  } catch {}
}

export const db = { read, write, append }
