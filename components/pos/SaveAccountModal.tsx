'use client'

import { useState, useEffect } from 'react'
import { X, User, Receipt, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import { usePOSStore, useToast } from '@/lib/stores'
import type { Cliente } from '@/lib/types'
import { ClienteSelector } from '@/components/clientes/ClienteSelector'
import { ClienteForm } from '@/components/clientes/ClienteForm'

interface SaveAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SaveAccountModal({ isOpen, onClose, onSuccess }: SaveAccountModalProps) {
  const { currentCart, saveCartAsAccount, updateExistingAccount, editingAccountId, editingAccountOriginal } = usePOSStore()
  const [accountName, setAccountName] = useState('')
  
  // Determine if we're in edit mode
  const isEditMode = !!editingAccountId
  const defaultAccountName = isEditMode ? (editingAccountOriginal?.nombre || '') : ''
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [showClienteForm, setShowClienteForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSave = async () => {
    if (!accountName.trim()) return

    setIsLoading(true)
    try {
      // Update cart with selected cliente if provided
      if (selectedCliente) {
        currentCart.cliente = selectedCliente
      }

      // Save or update the account based on mode
      if (isEditMode) {
        await updateExistingAccount(accountName.trim())
      } else {
        await saveCartAsAccount(accountName.trim())
      }

      // Show success and close
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error saving account:', error)
      // Show error message to user
      toast.error(error instanceof Error ? error.message : 'Error al guardar la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAccountName('')
    setSelectedCliente(null)
    setShowClienteForm(false)
    setIsLoading(false)
    onClose()
  }

  const handleCreateNewCliente = () => {
    setShowClienteForm(true)
  }

  const handleClienteFormSuccess = (message: string) => {
    setShowClienteForm(false)
    toast.success(message)
  }

  const handleClienteFormCancel = () => {
    setShowClienteForm(false)
  }

  // Set default values when modal opens in edit mode
  useEffect(() => {
    if (isOpen && isEditMode) {
      setAccountName(defaultAccountName)
      if (editingAccountOriginal?.cliente) {
        setSelectedCliente(editingAccountOriginal.cliente)
      }
    } else if (isOpen && !isEditMode) {
      // Reset for new account mode
      setAccountName('')
      setSelectedCliente(null)
    }
  }, [isOpen, isEditMode, defaultAccountName, editingAccountOriginal])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {isEditMode ? 'Actualizar Cuenta' : 'Guardar como Cuenta'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? 'Actualizar la cuenta existente con los nuevos productos'
                : 'Crear una cuenta abierta para pagar después'
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cart Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(currentCart.total)}</div>
              <div className="text-sm text-muted-foreground">
                {currentCart.items.length} producto{currentCart.items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Nombre de la Cuenta *
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="input-no-zoom w-full px-3 py-2 border border-border rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                         placeholder:text-muted-foreground"
              placeholder="Mesa 5, Fiado Juan Pérez, etc."
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Cliente Info (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Información del Cliente (Opcional)
              </h3>
            </div>
            
            <ClienteSelector
              value={selectedCliente}
              onChange={setSelectedCliente}
              placeholder="Seleccionar cliente..."
              disabled={isLoading}
              onCreateNew={handleCreateNewCliente}
            />

            {/* Show selected client details */}
            {selectedCliente && (
              <div className="bg-secondary/30 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{selectedCliente.nombre}</span>
                </div>
                {selectedCliente.telefono && (
                  <div className="text-sm text-muted-foreground">
                    📞 {selectedCliente.telefono}
                  </div>
                )}
                {selectedCliente.email && (
                  <div className="text-sm text-muted-foreground">
                    ✉️ {selectedCliente.email}
                  </div>
                )}
              </div>
            )}
          </div>
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
          
          <button
            onClick={handleSave}
            disabled={!accountName.trim() || isLoading}
            className={cn(
              'btn-touch px-6 py-2 rounded-lg flex items-center gap-2 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              accountName.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ClienteForm Modal */}
      {showClienteForm && (
        <ClienteForm
          onSuccess={handleClienteFormSuccess}
          onCancel={handleClienteFormCancel}
        />
      )}
    </div>
  )
}