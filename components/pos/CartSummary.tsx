'use client'

import { useState } from 'react'
import { usePOSStore, useToast } from '@/lib/stores'
import { formatCurrency } from '@/lib/utils/money'
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SaveAccountModal } from './SaveAccountModal'
import { CheckoutModal } from './CheckoutModal'
import { SelectExistingAccountModal } from './SelectExistingAccountModal'

export function CartSummary() {
  const { 
    currentCart, 
    updateCartItemQuantity, 
    removeCartItem, 
    clearCart 
  } = usePOSStore()
  const toast = useToast()
  
  const [showSaveAccount, setShowSaveAccount] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSelectAccount, setShowSelectAccount] = useState(false)

  const isEmpty = currentCart.items.length === 0

  const handleSaveAccountSuccess = () => {
    // Show success feedback
    toast.success('¡Cuenta guardada exitosamente!')
    clearCart()
  }

  const handlePaymentSuccess = () => {
    // Payment success is handled in CheckoutModal
    // Cart is already cleared there
  }

  const handleSelectAccountSuccess = () => {
    // Account selection success feedback
    toast.success('¡Productos agregados a la cuenta existente!')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito
          </h2>
          {!isEmpty && (
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {currentCart.items.length} producto{currentCart.items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Carrito vacío
            </h3>
            <p className="text-muted-foreground text-sm">
              Agrega productos para comenzar una venta
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {currentCart.items.map((item) => (
              <CartItem
                key={item.producto.id}
                item={item}
                onUpdateQuantity={(quantity) => 
                  updateCartItemQuantity(item.producto.id, quantity)
                }
                onRemove={() => removeCartItem(item.producto.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {!isEmpty && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(currentCart.subtotal)}</span>
            </div>
            
            {currentCart.descuento > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Descuento:</span>
                <span>-{formatCurrency(currentCart.descuento)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Impuestos:</span>
              <span>{formatCurrency(currentCart.impuestos)}</span>
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(currentCart.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button 
              onClick={() => setShowCheckout(true)}
              className="w-full btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                         rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Procesar Pago
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowSaveAccount(true)}
                className="btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                           rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                Nueva Cuenta
              </button>
              
              <button 
                onClick={() => setShowSelectAccount(true)}
                disabled={currentCart.items.length === 0}
                className="btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                           rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                Cuenta Existente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SaveAccountModal
        isOpen={showSaveAccount}
        onClose={() => setShowSaveAccount(false)}
        onSuccess={handleSaveAccountSuccess}
      />

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={handlePaymentSuccess}
      />

      <SelectExistingAccountModal
        isOpen={showSelectAccount}
        onClose={() => setShowSelectAccount(false)}
        onSuccess={handleSelectAccountSuccess}
      />
    </div>
  )
}

interface CartItemProps {
  item: any // CartItem type
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const producto = item.producto

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">
          {producto.nombre}
        </h3>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(producto.precio)} c/u
        </p>
        <p className="text-sm font-medium text-primary mt-1">
          {formatCurrency(item.subtotal)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.cantidad - 1))}
          className="p-1 hover:bg-secondary rounded transition-colors"
          disabled={item.cantidad <= 1}
        >
          <Minus className="h-3 w-3" />
        </button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.cantidad}
        </span>
        
        <button
          onClick={() => onUpdateQuantity(item.cantidad + 1)}
          className="p-1 hover:bg-secondary rounded transition-colors"
          disabled={item.cantidad >= producto.stock}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}