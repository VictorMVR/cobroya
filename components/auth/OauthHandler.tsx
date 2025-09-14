'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OauthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (code) {
      console.log('OAuth code detected on landing page, redirecting to callback...')
      // Redirect to auth callback with the code to process authentication
      router.push(`/api/auth/callback?code=${code}`)
    } else if (error) {
      console.error('OAuth error detected:', error)
      // Redirect to login with error
      router.push(`/login?error=${error}`)
    }
  }, [searchParams, router])

  return null
}
