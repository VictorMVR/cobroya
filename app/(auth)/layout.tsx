import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - CobroYa',
  description: 'Accede a tu punto de venta CobroYa',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple layout without navigation - focused on authentication */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}