import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/src/types/database.generated'
import { supabaseConfig } from '@/app/lib/env'

export function createClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: supabaseConfig.auth,
    realtime: supabaseConfig.realtime,
  })
}
