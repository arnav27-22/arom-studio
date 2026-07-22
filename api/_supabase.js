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
