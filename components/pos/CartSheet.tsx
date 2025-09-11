'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePOSStore, useSheet, useToast } from '@/lib/stores'
import { formatCurrency } from '@/lib/utils/money'
import { X, ShoppingCart, CreditCard, Minus, Plus, Trash2, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SaveAccountModal } from './SaveAccountModal'
import { CheckoutModal } from './CheckoutModal'
import { SelectExistingAccountModal } from './SelectExistingAccountModal'

export function CartSheet() {
  const { activeSheet, close } = useSheet()
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

  const isOpen = activeSheet === 'cart'
  const isEmpty = currentCart.items.length === 0

  const handleSaveAccountSuccess = () => {
    // Show success feedback
    toast.success('¡Cuenta guardada exitosamente!')
    clearCart()
    close()
  }

  const handlePaymentSuccess = () => {
    // Payment success is handled in CheckoutModal
    close()
  }

  const handleSelectAccountSuccess = () => {
    // Account selection success feedback
    toast.success('¡Productos agregados a la cuenta existente!')
    close()
  }

  // Close sheet when pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-xl 
                       shadow-xl border-t border-border max-h-[85vh] lg:hidden
                       safe-bottom"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">
                  Carrito ({currentCart.items.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!isEmpty && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={close}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col max-h-[calc(85vh-140px)]">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Carrito vacío
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Agrega productos para comenzar una venta
                  </p>
                  <button
                    onClick={close}
                    className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                             rounded-lg px-6 py-2 transition-colors"
                  >
                    Continuar comprando
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="flex-1 overflow-auto p-4 space-y-3">
                    {currentCart.items.map((item, index) => (
                      <motion.div
                        key={item.producto.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CartSheetItem
                          item={item}
                          onUpdateQuantity={(quantity) => 
                            updateCartItemQuantity(item.producto.id, quantity)
                          }
                          onRemove={() => removeCartItem(item.producto.id)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary and Actions */}
                  <div className="border-t border-border p-4 space-y-4 bg-card">
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
                      
                      <div className="flex justify-between text-xl font-bold border-t border-border pt-2">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(currentCart.total)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowCheckout(true)}
                        className="w-full btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                                 rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Procesar Pago
                      </button>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowSaveAccount(true)}
                          className="flex-1 btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                                   rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Receipt className="h-4 w-4" />
                          Nueva
                        </button>
                        
                        <button 
                          onClick={() => setShowSelectAccount(true)}
                          disabled={currentCart.items.length === 0}
                          className="flex-1 btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                                   rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Existente
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
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
    </AnimatePresence>
  )
}

interface CartSheetItemProps {
  item: any // CartItem type
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

function CartSheetItem({ item, onUpdateQuantity, onRemove }: CartSheetItemProps) {
  const producto = item.producto

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">
          {producto.nombre}
        </h3>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(producto.precio)} c/u
        </p>
        <p className="text-sm font-bold text-primary mt-1">
          {formatCurrency(item.subtotal)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.cantidad - 1))}
          className="btn-touch p-2 hover:bg-secondary rounded-lg transition-colors"
          disabled={item.cantidad <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="w-8 text-center text-sm font-bold">
          {item.cantidad}
        </span>
        
        <button
          onClick={() => onUpdateQuantity(item.cantidad + 1)}
          className="btn-touch p-2 hover:bg-secondary rounded-lg transition-colors"
          disabled={item.cantidad >= producto.stock}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="btn-touch p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}