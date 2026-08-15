import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or a public Supabase key')
}

/**
 * Browser / public client — uses anon key.
 * Safe to use in client components.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-only admin client — uses service role key.
 * Bypasses Row Level Security. NEVER expose to the browser.
 * Use only in API routes and server components.
 */
export function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing a server Supabase key — required for server operations')
  }
  return createClient(supabaseUrl!, supabaseServiceKey, {
    auth: { persistSession: false }
  })
}
