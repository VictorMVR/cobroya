import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login']

  // Skip middleware for API routes entirely
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check if route is public first (before creating Supabase client)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Only create response and Supabase client for protected routes
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Use getSession instead of getUser for better performance
    const { data: { session }, error } = await supabase.auth.getSession()

    // Routes that require specific roles
    const adminRoutes = ['/admin', '/productos', '/clientes', '/cuentas', '/categorias']
    const superAdminRoutes = ['/super-admin']

    // If user is not authenticated, redirect to login
    if (error || !session?.user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const user = session.user

    // Get user metadata
    const metadata = user.user_metadata || {}
    const rol = user.email === 'verdugorubio@gmail.com'
      ? 'SUPER_ADMIN'
      : (metadata.rol || 'ADMIN')

    // Handle super admin routes
    if (superAdminRoutes.some(route => pathname.startsWith(route))) {
      if (rol !== 'SUPER_ADMIN') {
        url.pathname = '/admin' // Redirect non-super-admins to admin
        return NextResponse.redirect(url)
      }
      return response
    }

    // Handle admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (rol === 'CAJERO') {
        url.pathname = '/pos' // Redirect cashiers to POS
        return NextResponse.redirect(url)
      }
      return response
    }

    // Handle POS route
    if (pathname.startsWith('/pos')) {
      // All authenticated users can access POS
      return response
    }

    // Handle onboarding
    if (pathname.startsWith('/onboarding')) {
      // Only allow users without proper setup
      if (rol && metadata.tenant_id) {
        // User is already set up, redirect based on role
        if (rol === 'SUPER_ADMIN') {
          url.pathname = '/super-admin'
        } else if (rol === 'ADMIN') {
          url.pathname = '/admin'
        } else {
          url.pathname = '/pos'
        }
        return NextResponse.redirect(url)
      }
      return response
    }

    // For any other authenticated route, allow access
    return response
  } catch (error) {
    // On any error, redirect to login
    console.error('Middleware error:', error)
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}