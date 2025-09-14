import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { validateSupabaseEnv } from './validate-env'

export function createClient() {
  const { url, anonKey } = validateSupabaseEnv()

  return createBrowserClient<Database>(
    url,
    anonKey,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true
      }
    }
  )
}