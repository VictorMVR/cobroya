import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Safe server client that uses anon key instead of service role for auth operations
export async function createSafeServerClient() {
  const cookieStore = await cookies()
  
  // Use ANON key for auth operations, not service role
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  // Clean the anon key of any whitespace
  const cleanAnonKey = anonKey.replace(/[\r\n\t\s]/g, '').trim()
  
  console.log('🔧 Server client - URL:', url)
  console.log('🔧 Server client - Key length:', cleanAnonKey.length)
  console.log('🔧 Server client - Key valid JWT:', cleanAnonKey.startsWith('eyJ') && cleanAnonKey.split('.').length === 3)
  
  return createServerClient(url, cleanAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}