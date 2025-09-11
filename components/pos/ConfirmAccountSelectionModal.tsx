'use client'

import { CheckCircle, X, ShoppingCart, Plus, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import type { Cuenta, Cart } from '@/lib/types'

interface ConfirmAccountSelectionModalProps {
  isOpen: boolean
  selectedAccount: Cuenta | null
  currentCart: Cart
  isEditMode: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmAccountSelectionModal({ 
  isOpen, 
  selectedAccount, 
  currentCart, 
  isEditMode,
  onConfirm, 
  onCancel 
}: ConfirmAccountSelectionModalProps) {
  if (!isOpen || !selectedAccount) return null

  const cartTotal = currentCart.total
  const accountTotal = selectedAccount.total
  const newTotal = isEditMode ? cartTotal : accountTotal + cartTotal

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              isEditMode ? "bg-warning/20" : "bg-primary/20"
            )}>
              {isEditMode ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isEditMode ? 'Actualizar Cuenta' : 'Agregar a Cuenta'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Se reemplazará el contenido' : 'Se sumarán los productos'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Account Info */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {selectedAccount.nombre}
            </h3>
            {selectedAccount.cliente && (
              <p className="text-sm text-muted-foreground mb-2">
                Cliente: {selectedAccount.cliente.nombre}
              </p>
            )}
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total actual:</span>
                <span className="font-medium">{formatCurrency(accountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos actuales:</span>
                <span className="font-medium">{selectedAccount.items.length}</span>
              </div>
            </div>
          </div>

          {/* Cart Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">
              Productos en el carrito:
            </h4>
            <div className="text-sm space-y-1 mb-3">
              {currentCart.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.cantidad}x {item.producto.nombre}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-primary/20 pt-2">
              <div className="flex justify-between font-medium">
                <span>Total del carrito:</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Preview */}
          <div className={cn(
            "rounded-lg p-4 border",
            isEditMode 
              ? "bg-warning/5 border-warning/20" 
              : "bg-success/5 border-success/20"
          )}>
            <h4 className={cn(
              "font-medium mb-2",
              isEditMode ? "text-warning" : "text-success"
            )}>
              {isEditMode ? '⚠️ Cuenta se actualizará' : '✅ Resultado final'}
            </h4>
            <div className="text-sm space-y-1">
              {isEditMode ? (
                <div>
                  <p className="text-muted-foreground mb-2">
                    Los productos actuales se reemplazarán completamente con los del carrito.
                  </p>
                  <div className="flex justify-between font-bold">
                    <span>Nuevo total:</span>
                    <span className="text-warning">{formatCurrency(newTotal)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total anterior:</span>
                    <span>{formatCurrency(accountTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">+ Carrito:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="border-t border-success/20 pt-1 mt-1">
                    <div className="flex justify-between font-bold">
                      <span>Total final:</span>
                      <span className="text-success">{formatCurrency(newTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onCancel}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            className={cn(
              "btn-touch px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium",
              isEditMode
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : "bg-success text-success-foreground hover:bg-success/90"
            )}
          >
            <CheckCircle className="h-4 w-4" />
            {isEditMode ? 'Actualizar Cuenta' : 'Agregar a Cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}