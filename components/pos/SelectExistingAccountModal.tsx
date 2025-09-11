'use client'

import { useState } from 'react'
import { X, Search, Clock, User, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import { usePOSStore } from '@/lib/stores'
import type { Cuenta } from '@/lib/types'
import { ConfirmAccountSelectionModal } from './ConfirmAccountSelectionModal'

interface SelectExistingAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SelectExistingAccountModal({ isOpen, onClose, onSuccess }: SelectExistingAccountModalProps) {
  const { cuentasAbiertas, currentCart, addCartToExistingAccount, replaceAccountWithCart, editingAccountId } = usePOSStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Cuenta | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // Determine if we're in edit mode
  const isEditMode = !!editingAccountId

  const filteredAccounts = cuentasAbiertas.filter(cuenta => 
    cuenta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cuenta.cliente?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAccount = (account: Cuenta) => {
    if (currentCart.items.length === 0) {
      return // No items to add
    }
    
    setSelectedAccount(account)
    setShowConfirm(true)
  }
  
  const handleConfirmSelection = async () => {
    if (!selectedAccount) return
    
    setIsLoading(true)
    try {
      if (isEditMode) {
        // Replace account content when editing
        replaceAccountWithCart(selectedAccount.id)
      } else {
        // Add/merge items when not editing
        addCartToExistingAccount(selectedAccount.id)
      }
      
      // Show success and close
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error updating account:', error)
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
      setSelectedAccount(null)
    }
  }
  
  const handleCancelConfirmation = () => {
    setShowConfirm(false)
    setSelectedAccount(null)
  }

  const handleClose = () => {
    setSearchTerm('')
    setIsLoading(false)
    setShowConfirm(false)
    setSelectedAccount(null)
    onClose()
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora'
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {isEditMode ? 'Actualizar Cuenta Existente' : 'Agregar a Cuenta Existente'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? 'Selecciona la cuenta a actualizar (se reemplazará el contenido)'
                : 'Selecciona una cuenta para agregar los productos del carrito'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-no-zoom w-full pl-10 pr-4 py-2 border border-border rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                         placeholder:text-muted-foreground"
              placeholder="Buscar por nombre de cuenta o cliente..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Current Cart Summary */}
        {currentCart.items.length > 0 && (
          <div className="p-4 bg-primary/5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Productos en el carrito:
                </span>
              </div>
              <div className="text-sm font-bold text-primary">
                {formatCurrency(currentCart.total)} ({currentCart.items.length} productos)
              </div>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="flex-1 overflow-auto max-h-[calc(85vh-280px)]">
          {currentCart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Carrito vacío
              </h3>
              <p className="text-muted-foreground text-sm">
                Agrega productos al carrito para poder asignarlos a una cuenta existente
              </p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No se encontraron cuentas' : 'No hay cuentas abiertas'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Crea una nueva cuenta o espera a que se abran cuentas'
                }
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  disabled={isLoading}
                  className="w-full text-left p-4 border border-border rounded-lg hover:bg-secondary/50 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {account.nombre}
                        </h3>
                        {account.cliente && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{account.cliente.nombre}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(account.created_at)}</span>
                        </div>
                        <span>{account.items.length} producto{account.items.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(account.total)}
                      </div>
                      {account.descuento > 0 && (
                        <div className="text-xs text-success">
                          -{formatCurrency(account.descuento)} desc.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Preview of account items */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                      {account.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate flex-1">
                            {item.cantidad}x {item.producto.nombre}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                      {account.items.length > 3 && (
                        <div className="text-center text-muted-foreground/70">
                          +{account.items.length - 3} productos más...
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={handleClose}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmAccountSelectionModal
        isOpen={showConfirm}
        selectedAccount={selectedAccount}
        currentCart={currentCart}
        isEditMode={isEditMode}
        onConfirm={handleConfirmSelection}
        onCancel={handleCancelConfirmation}
      />
    </div>
  )
}