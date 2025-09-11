'use client'

import { useState, useMemo } from 'react'
import { Search, Receipt, Clock, DollarSign, AlertCircle, Eye, CreditCard, X, Plus } from 'lucide-react'
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

  // Filter accounts based on search
  const filteredCuentas = useMemo(() => {
    let filtered = cuentasAbiertas

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cuenta => 
        cuenta.nombre.toLowerCase().includes(query) ||
        cuenta.cliente?.nombre.toLowerCase().includes(query) ||
        cuenta.id.toLowerCase().includes(query)
      )
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [cuentasAbiertas, searchQuery])

  // Calculate metrics
  const totalCuentas = cuentasAbiertas.length
  const montoTotal = cuentasAbiertas.reduce((sum, cuenta) => sum + cuenta.total, 0)
  const cuentasViejas = cuentasAbiertas.filter(cuenta => {
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

  const handleCancelAccount = (cuenta: Cuenta) => {
    if (confirm(`¿Estás seguro de que deseas cancelar la cuenta "${cuenta.nombre}"?`)) {
      deleteAccount(cuenta.id)
    }
  }

  const handlePaymentComplete = (cuenta: Cuenta) => {
    // Remove the account from open accounts after payment
    deleteAccount(cuenta.id)
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
        {filteredCuentas.length === 0 ? (
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