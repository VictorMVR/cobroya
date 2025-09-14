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
        detectSessionInUrl: false, // We handle this manually in callback
        persistSession: true,
        autoRefreshToken: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key)
            }
            return null
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value)
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key)
            }
          }
        }
      }
    }
  )
}