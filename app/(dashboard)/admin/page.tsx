'use client'

import { useUser } from '@/lib/hooks/useUser'
import Link from 'next/link'
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Settings,
  Store,
  TrendingUp,
  Calendar,
  UserPlus
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, loading, signOut } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Middleware should redirect
  }

  const quickActions = [
    { 
      title: 'Punto de Venta', 
      description: 'Realizar ventas',
      icon: ShoppingCart,
      href: '/pos',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'Productos', 
      description: 'Gestionar inventario',
      icon: Package,
      href: '/productos',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Clientes', 
      description: 'Base de clientes',
      icon: Users,
      href: '/clientes',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      title: 'Cuentas Pendientes', 
      description: 'Créditos y pagos',
      icon: CreditCard,
      href: '/cuentas',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const stats = [
    { title: 'Ventas de Hoy', value: '$0', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Productos', value: '0', icon: Package, color: 'text-blue-600' },
    { title: 'Clientes', value: '0', icon: Users, color: 'text-purple-600' },
    { title: 'Cuentas Pendientes', value: '$0', icon: CreditCard, color: 'text-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">CobroYa Admin</h1>
                <p className="text-sm text-gray-500">Panel de Control</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nombre_completo}</p>
                <p className="text-xs text-gray-500">{user.rol}</p>
              </div>
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Hola, {user.nombre_completo?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Bienvenido a tu panel de administración. Aquí puedes gestionar todo tu negocio.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`${action.color} text-white p-6 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6" />
                    <div>
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Gestión del Negocio
            </h3>
            <div className="space-y-3">
              <Link href="/categorias" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Categorías</h4>
                    <p className="text-sm text-gray-600">Organizar productos</p>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
              
              <div className="block p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-500">Configuración</h4>
                    <p className="text-sm text-gray-400">Próximamente</p>
                  </div>
                  <Settings className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-gray-600" />
              Equipo de Trabajo
            </h3>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Plan Gratuito</span>
                  <span className="text-sm text-green-600">Activo</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">1 / 2</div>
                <p className="text-sm text-gray-600">Usuarios utilizados</p>
              </div>
              
              <button 
                disabled
                className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 transition-colors disabled:cursor-not-allowed"
              >
                <UserPlus className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Invitar Cajero (Próximamente)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Primeros Pasos</h3>
          <p className="text-blue-800 mb-4">Para empezar a usar CobroYa, te recomendamos:</p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Agregar tus primeros productos en <Link href="/productos" className="underline font-medium">Productos</Link></li>
            <li>Configurar categorías en <Link href="/categorias" className="underline font-medium">Categorías</Link></li>
            <li>Realizar tu primera venta en <Link href="/pos" className="underline font-medium">Punto de Venta</Link></li>
          </ol>
        </div>
      </main>
    </div>
  )
}