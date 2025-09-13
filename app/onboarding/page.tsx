'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Store, Building, Smartphone, ArrowRight, CheckCircle } from 'lucide-react'

export default function OnboardingPage() {
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [tipoNegocio, setTipoNegocio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, updateUserMetadata } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const tiposNegocio = [
    { id: 'abarrotes', nombre: 'Abarrotes / Tienda', icon: Store },
    { id: 'farmacia', nombre: 'Farmacia', icon: Building },
    { id: 'boutique', nombre: 'Boutique / Ropa', icon: Building },
    { id: 'restaurant', nombre: 'Restaurante / Café', icon: Building },
    { id: 'ferreteria', nombre: 'Ferretería', icon: Building },
    { id: 'estetica', nombre: 'Estética / Spa', icon: Building },
    { id: 'otro', nombre: 'Otro', icon: Building }
  ]

  const handleSetupBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !nombreNegocio || !tipoNegocio) return

    setLoading(true)
    setError('')

    try {
      // Create tenant for this business
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([
          {
            nombre: nombreNegocio,
            activo: true,
            // propietario_email will be added when we migrate the table properly
          }
        ])
        .select()
        .single()

      if (tenantError) {
        throw new Error('Error creando el negocio: ' + tenantError.message)
      }

      // Update user metadata with role and tenant
      const success = await updateUserMetadata({
        rol: 'ADMIN',
        tenant_id: tenant.id,
        nombre_completo: user.nombre_completo,
      })

      if (!success) {
        throw new Error('Error configurando el usuario')
      }

      // Redirect to admin dashboard
      router.push('/admin')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error configurando el negocio')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a CobroYa! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Configuremos tu negocio en unos simples pasos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
              1
            </div>
            <div className="text-blue-600 font-medium">Configurar Negocio</div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
              2
            </div>
            <div className="text-gray-600">¡Empezar a vender!</div>
          </div>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSetupBusiness} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Business Name */}
            <div>
              <label htmlFor="nombreNegocio" className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cómo se llama tu negocio?
              </label>
              <input
                id="nombreNegocio"
                type="text"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ejemplo: Mi Tienda, Farmacia San José, etc."
                required
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Qué tipo de negocio tienes?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tiposNegocio.map((tipo) => {
                  const IconComponent = tipo.icon
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setTipoNegocio(tipo.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        tipoNegocio === tipo.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`w-5 h-5 ${
                          tipoNegocio === tipo.id ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className="font-medium">{tipo.nombre}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tu plan gratuito incluye:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Punto de venta completo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Hasta 2 usuarios (tú + 1 cajero)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Gestión de productos e inventario</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Reportes básicos de ventas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Soporte por WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !nombreNegocio || !tipoNegocio}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Configurando...
                </>
              ) : (
                <>
                  Crear mi negocio
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@cobroya.mx" className="text-blue-600 hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}