import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let client = null

export function getSupabase() {
  if (client) return client
  if (!supabaseUrl || !supabaseKey) return null
  client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  return client
}

export function toCamel(row) {
  if (!row || typeof row !== 'object') return row
  if (Array.isArray(row)) return row.map(toCamel)
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}
