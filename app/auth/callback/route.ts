import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
      }

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