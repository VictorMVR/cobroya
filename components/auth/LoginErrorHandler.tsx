'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginErrorHandler({ setError }: { setError: (error: string) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlError = searchParams.get('error')
    const errorDetails = searchParams.get('details')
    
    if (urlError === 'auth_error') {
      const message = errorDetails 
        ? `Error de autenticación: ${decodeURIComponent(errorDetails)}`
        : 'Error de autenticación. Por favor, inténtalo de nuevo.'
      setError(message)
      console.error('Auth error from callback:', { urlError, errorDetails })
    }
  }, [searchParams, setError])

  return null
}
