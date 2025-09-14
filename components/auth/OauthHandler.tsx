'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Smart redirect function based on user role
async function redirectUserBasedOnRole(user: User, router: AppRouterInstance) {
  const metadata = user.user_metadata || {}
  const isSuperAdmin = user.email === 'verdugorubio@gmail.com'
  const rol = metadata.rol
  const hasTenant = metadata.tenant_id

  // Super admin always goes to super admin dashboard
  if (isSuperAdmin) {
    router.push('/super-admin')
    return
  }

  // If user has role and tenant, redirect based on role
  if (rol && hasTenant) {
    switch (rol) {
      case 'ADMIN':
        router.push('/admin')
        break
      case 'CAJERO':
        router.push('/pos')
        break
      default:
        router.push('/admin')
    }
    return
  }

  // New user or incomplete setup - go to onboarding
  router.push('/onboarding')
}

export default function OauthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const authSuccess = searchParams.get('auth_success')

    if (code) {
      console.log('OAuth code detected on landing page, redirecting to callback...')
      // Redirect to auth callback with the code to process authentication
      router.push(`/api/auth/callback?code=${code}`)
    } else if (error) {
      console.error('OAuth error detected:', error)
      // Redirect to login with error
      router.push(`/login?error=${error}`)
    } else if (authSuccess) {
      console.log('Auth success detected on landing page, checking session...')
      // Clear the auth_success parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          console.log('User session found, redirecting based on role...')
          redirectUserBasedOnRole(user, router)
        } else {
          console.log('No user session found after auth success, redirecting to login.')
          router.push('/login')
        }
      })
    }
  }, [searchParams, router, supabase])

  return null
}