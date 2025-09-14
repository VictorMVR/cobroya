import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSafeServerClient } from '@/lib/supabase/server-safe'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('🔐 /auth/callback called with code:', code ? 'present' : 'missing')
  console.log('🌐 Request URL:', requestUrl.toString())

  if (code) {
    try {
      console.log('🔑 Creating safe server client...')
      const supabase = await createSafeServerClient()
    
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

        return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
      }
    } catch (configError) {
      console.error('❌ Supabase config error:', configError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=config_error`)
    } catch (error) {
      console.error('❌ Unexpected auth error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}