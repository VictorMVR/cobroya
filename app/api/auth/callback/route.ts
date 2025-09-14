import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('🔐 Auth callback called with code:', code ? 'present' : 'missing')
  console.log('🌐 Request URL:', requestUrl.toString())

  if (code) {
    const cookieStore = await cookies()
    
    // Clean and validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables')
      return NextResponse.redirect(`${requestUrl.origin}/login?error=config_error`)
    }
    
    console.log('🔑 API Supabase URL length:', supabaseUrl.length)
    console.log('🔑 API Anon key length:', supabaseAnonKey.length)
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
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
      }
    )
    
    try {
      console.log('📡 Attempting to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth callback error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.status,
          name: error.name
        })
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error&details=${encodeURIComponent(error.message)}`)
      }

      console.log('✅ Session exchange successful, user:', data.user?.email)

      if (data.user) {
        const metadata = data.user.user_metadata || {}
        const isSuperAdmin = data.user.email === 'verdugorubio@gmail.com'
        const rol = metadata.rol
        const hasTenant = metadata.tenant_id

        // Smart redirect based on user state
        let redirectPath = '/onboarding' // Default for new users

        if (isSuperAdmin) {
          redirectPath = '/super-admin'
        } else if (rol && hasTenant) {
          switch (rol) {
            case 'ADMIN':
              redirectPath = '/admin'
              break
            case 'CAJERO':
              redirectPath = '/pos'
              break
            default:
              redirectPath = '/admin'
          }
        }

        return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
      }
    } catch (error) {
      console.error('Unexpected auth error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}