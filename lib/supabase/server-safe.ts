import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateSupabaseEnv } from './validate-env'

// Safe server client that handles large tokens via cookies instead of headers
export async function createSafeServerClient() {
  const cookieStore = await cookies()
  
  const { url, anonKey } = validateSupabaseEnv()
  
  console.log('🔧 Creating server client with cookie-based auth')
  
  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ 
          name, 
          value, 
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      },
      remove(name: string, options: any) {
        cookieStore.set({ 
          name, 
          value: '', 
          ...options,
          expires: new Date(0)
        })
      },
    }
  })
}
