import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateSupabaseEnv } from '@/lib/supabase/validate-env'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_description = requestUrl.searchParams.get('error_description')

  console.log('🔐 /api/auth/callback called with code:', code ? 'present' : 'missing')
  console.log('🌐 Request URL:', requestUrl.toString())

  // Check for OAuth errors first
  if (error_description) {
    console.error('❌ OAuth error:', error_description)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error_description)}`)
  }

  if (code) {
    try {
      const cookieStore = await cookies()
      const { url, anonKey } = validateSupabaseEnv()

      // First, create a temporary supabase client to exchange the code
      const supabase = createServerClient(url, anonKey, {
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

      // Try to exchange code for session
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

        console.log(`🎯 Redirecting user to: ${redirectPath}`)

        // NOW create the response with the correct redirect path
        const response = NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)

        // Copy over the auth cookies to the response
        const authCookies = cookieStore.getAll()
        authCookies.forEach(cookie => {
          if (cookie.name.includes('supabase')) {
            response.cookies.set(cookie)
          }
        })

        return response
      }

      // If we get here but no user, still redirect to login
      return NextResponse.redirect(`${requestUrl.origin}/login`)
    } catch (error) {
      console.error('❌ Unexpected auth error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}