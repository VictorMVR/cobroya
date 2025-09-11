'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [tenantName, setTenantName] = useState<string>('')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    try {
      // Verificar conexión básica con Supabase
      const { data, error } = await supabase
        .from('tenants')
        .select('nombre')
        .limit(1)
      
      if (error) {
        console.error('Database error:', error)
        // Si la tabla no existe, intentamos una conexión más básica
        const { error: authError } = await supabase.auth.getSession()
        if (authError) throw authError
        
        // Conexión establecida pero tabla no existe
        setTenantName('Base de datos conectada - Ejecutar script SQL')
        setConnectionStatus('connected')
        return
      }
      
      // Si hay datos, mostrar el primer tenant
      setTenantName(data?.[0]?.nombre || 'Tenant configurado')
      setConnectionStatus('connected')
    } catch (error) {
      console.error('Error conectando:', error)
      setErrorDetails(error instanceof Error ? error.message : 'Error desconocido')
      setConnectionStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              CobroYa
            </h1>
            <p className="text-xl text-gray-600">
              Punto de Venta Simple y Efectivo
            </p>
          </div>

          {/* Connection Status Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Estado del Sistema
            </h2>
            
            {connectionStatus === 'checking' && (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Verificando conexión con base de datos...</span>
              </div>
            )}
            
            {connectionStatus === 'connected' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Conexión establecida</span>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Tenant activo:</p>
                  <p className="text-lg font-semibold text-gray-900">{tenantName}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">Próximos pasos:</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li>✅ Conexión a Supabase configurada</li>
                    <li>⏳ Sistema de autenticación</li>
                    <li>⏳ Interfaz de punto de venta</li>
                    <li>⏳ Gestión de inventario</li>
                  </ol>
                </div>
                
                {tenantName.includes('Ejecutar script SQL') && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🔧 Configuración requerida</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      La conexión funciona pero falta ejecutar el script SQL.
                    </p>
                    <ol className="text-xs text-blue-700 space-y-1">
                      <li>1. Ve a Supabase Dashboard → SQL Editor</li>
                      <li>2. Copia el contenido de setup-database.sql</li>
                      <li>3. Pégalo y ejecuta el script</li>
                      <li>4. Recarga esta página</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Error de conexión</span>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    No se pudo conectar a la base de datos. Verifica:
                  </p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    <li>Las variables de entorno en .env.local</li>
                    <li>Que el proyecto de Supabase esté activo</li>
                    <li>Que el script SQL se haya ejecutado correctamente</li>
                  </ul>
                  {errorDetails && (
                    <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
                      <strong>Error:</strong> {errorDetails}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={checkConnection}
                  className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition"
                >
                  Reintentar conexión
                </button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Sistema</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Dominio:</dt>
                <dd className="font-medium">cobroya.mx</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Framework:</dt>
                <dd className="font-medium">Next.js 14</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Base de datos:</dt>
                <dd className="font-medium">Supabase (PostgreSQL)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Hosting:</dt>
                <dd className="font-medium">Vercel</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  )
}