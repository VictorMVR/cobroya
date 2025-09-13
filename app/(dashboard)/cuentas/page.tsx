'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Receipt, Clock, DollarSign, AlertCircle, Eye, CreditCard, X, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePOSStore, useDeviceInfo } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import { CuentaCard } from '@/components/cuentas/CuentaCard'
import { CuentaDetailModal } from '@/components/cuentas/CuentaDetailModal'
import { PaymentModal } from '@/components/cuentas/PaymentModal'
import { SearchBar } from '@/components/pos/SearchBar'
import type { Cuenta } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CuentasPage() {
  const router = useRouter()
  const { isMobile } = useDeviceInfo()
  const { cuentasAbiertas, loadAccount, deleteAccount } = usePOSStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [realCuentas, setRealCuentas] = useState<Cuenta[]>([])

  // Load cuentas from API
  const loadCuentas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cuentas')
      const result = await response.json()
      
      if (response.ok) {
        setRealCuentas(result.data || [])
      } else {
        console.error('Error loading cuentas:', result.error)
      }
    } catch (error) {
      console.error('Error loading cuentas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load cuentas on component mount
  useEffect(() => {
    loadCuentas()
  }, [])

  // Filter accounts based on search
  const filteredCuentas = useMemo(() => {
    let filtered = realCuentas

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((cuenta) => 
        cuenta.cliente_nombre?.toLowerCase().includes(query) ||
        cuenta.id.toLowerCase().includes(query)
      )
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )
  }, [realCuentas, searchQuery])

  // Calculate metrics
  const totalCuentas = realCuentas.length
  const montoTotal = realCuentas.reduce((sum: number, cuenta) => sum + (cuenta.total || 0), 0)
  const cuentasViejas = realCuentas.filter((cuenta) => {
    if (!cuenta.created_at) return false
    const hoursSinceCreated = (Date.now() - new Date(cuenta.created_at).getTime()) / (1000 * 60 * 60)
    return hoursSinceCreated > 24
  }).length

  const handleViewDetails = (cuenta: Cuenta) => {
    setSelectedCuenta(cuenta)
    setShowDetail(true)
  }

  const handleContinueEditing = (cuenta: Cuenta) => {
    // Load account for editing
    loadAccount(cuenta.id)
    // Navigate to POS page
    router.push('/pos')
  }

  const handlePayAccount = (cuenta: Cuenta) => {
    setSelectedCuenta(cuenta)
    setShowPayment(true)
  }

  const handleCancelAccount = async (cuenta: Cuenta) => {
    if (confirm(`¿Estás seguro de que deseas cancelar la cuenta "${cuenta.cliente_nombre}"?`)) {
      try {
        const response = await fetch(`/api/cuentas/${cuenta.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove from local state
          setRealCuentas(prev => prev.filter(c => c.id !== cuenta.id))
          // Also remove from POS store if exists
          deleteAccount(cuenta.id)
        } else {
          const errorData = await response.json()
          alert('Error al cancelar la cuenta: ' + (errorData.error || 'Error desconocido'))
        }
      } catch (error) {
        console.error('Error canceling account:', error)
        alert('Error al cancelar la cuenta')
      }
    }
  }

  const handlePaymentComplete = async (cuenta: Cuenta) => {
    // Remove the account from both local state and API
    await handleCancelAccount(cuenta)
    setShowPayment(false)
    setSelectedCuenta(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Cuentas Abiertas
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{totalCuentas} cuentas</span>
              <span className="text-primary font-medium">{formatCurrency(montoTotal)} total</span>
              {cuentasViejas > 0 && (
                <span className="flex items-center gap-1 text-warning">
                  <AlertCircle className="h-4 w-4" />
                  {cuentasViejas} +24hrs
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        {totalCuentas > 0 && (
          <div>
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar cuentas por nombre, cliente..."
            />
          </div>
        )}

        {/* Quick Stats */}
        {totalCuentas > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="text-primary text-2xl font-bold">{totalCuentas}</div>
              <div className="text-primary/80 text-sm">Cuentas Abiertas</div>
            </div>
            
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="text-success text-lg font-bold">{formatCurrency(montoTotal)}</div>
              <div className="text-success/80 text-sm">Total Pendiente</div>
            </div>
            
            <div className="bg-secondary border border-border rounded-lg p-3">
              <div className="text-foreground text-2xl font-bold">
                {cuentasAbiertas.length > 0 ? Math.round(montoTotal / cuentasAbiertas.length) : 0}
              </div>
              <div className="text-muted-foreground text-sm">Promedio por Cuenta</div>
            </div>
            
            {cuentasViejas > 0 && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="text-warning text-2xl font-bold">{cuentasViejas}</div>
                <div className="text-warning/80 text-sm">Cuentas Viejas</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Cargando cuentas...
            </h3>
            <p className="text-muted-foreground">
              Por favor espera mientras cargamos las cuentas desde la base de datos
            </p>
          </div>
        ) : filteredCuentas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No se encontraron cuentas' : 'No hay cuentas abiertas'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Intenta cambiar los términos de búsqueda'
                : 'Las cuentas aparecerán aquí cuando los clientes soliciten fiado o mesas'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/pos')}
                className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                           rounded-lg px-6 py-2 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ir al POS
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCuentas.map((cuenta) => (
              <CuentaCard
                key={cuenta.id}
                cuenta={cuenta}
                onViewDetails={() => handleViewDetails(cuenta)}
                onContinueEditing={() => handleContinueEditing(cuenta)}
                onPayAccount={() => handlePayAccount(cuenta)}
                onCancelAccount={() => handleCancelAccount(cuenta)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetail && selectedCuenta && (
        <CuentaDetailModal
          cuenta={selectedCuenta}
          onClose={() => {
            setShowDetail(false)
            setSelectedCuenta(null)
          }}
          onContinueEditing={() => {
            setShowDetail(false)
            handleContinueEditing(selectedCuenta)
          }}
          onPayAccount={() => {
            setShowDetail(false)
            setShowPayment(true)
          }}
        />
      )}

      {showPayment && selectedCuenta && (
        <PaymentModal
          cuenta={selectedCuenta}
          onClose={() => {
            setShowPayment(false)
            setSelectedCuenta(null)
          }}
          onPaymentComplete={() => handlePaymentComplete(selectedCuenta)}
        />
      )}
    </div>
  )
}