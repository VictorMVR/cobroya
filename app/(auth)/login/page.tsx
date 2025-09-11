'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: Implement Supabase authentication
      console.log('Login attempt:', { email, password })
      
      // Temporary redirect for development
      router.push('/admin')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
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
          <form onSubmit={handleLogin} className="space-y-6">
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
              disabled={loading}
              className="btn-touch w-full bg-primary text-primary-foreground font-medium rounded-lg
                       hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring 
                       focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                       tap-feedback transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>

          {/* Development access buttons */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Acceso rápido (desarrollo)
            </p>
            <div className="space-y-2">
              <Link
                href="/admin"
                className="btn-touch w-full bg-secondary text-secondary-foreground font-medium rounded-lg
                         hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring 
                         tap-feedback transition-colors text-center block py-3"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/pos"
                className="btn-touch w-full bg-success text-success-foreground font-medium rounded-lg
                         hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-ring 
                         tap-feedback transition-colors text-center block py-3"
              >
                Punto de Venta
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ¿Problemas para acceder?{' '}
            <Link 
              href="/help" 
              className="text-primary hover:underline"
            >
              Obtener ayuda
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}