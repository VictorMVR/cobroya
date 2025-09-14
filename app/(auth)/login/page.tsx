'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for auth errors in URL parameters
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
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Smart redirect based on user role
        await redirectUserBasedOnRole(data.user, router)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      // Get current origin and normalize it
      let origin = window.location.origin
      
      // Ensure we use the correct redirect URL that's configured in Supabase
      // This handles both cobroya.mx and www.cobroya.mx cases
      const redirectTo = `${origin}/auth/callback`
      
      console.log('OAuth redirect URL:', redirectTo) // For debugging
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        setError(error.message)
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError('Error al conectar con Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            CobroYa
          </h1>
          <p className="text-muted-foreground">
            Punto de Venta Simple y Efectivo
          </p>
        </div>

        {/* Login form */}
        <div className="card-mobile p-6">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-no-zoom w-full rounded-lg border border-border bg-input px-3 py-3 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           placeholder:text-muted-foreground"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-no-zoom w-full rounded-lg border border-border bg-input px-3 py-3 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           placeholder:text-muted-foreground"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar con Email'}
            </button>
          </form>

          {/* New user signup */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta aún?{' '}
              <Link href="/pos" className="text-blue-600 hover:text-blue-700 font-medium">
                Probar gratis
              </Link>
            </p>
          </div>

          {/* Development access - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center mb-3">
                Acceso directo (desarrollo)
              </p>
              <div className="flex gap-2">
                <Link
                  href="/admin"
                  className="flex-1 text-center py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Admin
                </Link>
                <Link
                  href="/pos"
                  className="flex-1 text-center py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  POS
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            ¿Problemas para acceder?{' '}
            <a href="mailto:soporte@cobroya.mx" className="text-blue-600 hover:underline">
              Obtener ayuda
            </a>
          </p>
          <p className="text-xs text-gray-400">
            © 2024 CobroYa. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}