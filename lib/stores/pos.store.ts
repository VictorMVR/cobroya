import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Producto, 
  CartItem, 
  Cart, 
  Cuenta, 
  Cliente, 
  Payment, 
  PaymentSummary 
} from '@/lib/types'
import { Money, calculateTax } from '@/lib/utils/money'

interface POSState {
  // Current cart state
  currentCart: Cart
  
  // Open accounts (cuentas abiertas)
  cuentasAbiertas: Cuenta[]
  
  // Account editing state
  editingAccountId: string | null
  editingAccountOriginal: Cuenta | null
  
  // Product cache for offline functionality
  productos: Producto[]
  lastProductsSync: string | null
  
  // UI state
  selectedCliente: Cliente | null
  
  // Actions - Cart Management
  addProductToCart: (producto: Producto, cantidad?: number) => void
  updateCartItemQuantity: (productoId: string, cantidad: number) => void
  removeCartItem: (productoId: string) => void
  clearCart: () => void
  applyDiscount: (discount: number) => void
  setCartCliente: (cliente: Cliente | null) => void
  setCartNotes: (notes: string) => void
  
  // Actions - Account Management
  saveCartAsAccount: (nombre: string) => void
  loadAccount: (accountId: string) => void
  updateExistingAccount: (nombre: string) => void
  addCartToExistingAccount: (accountId: string) => void
  replaceAccountWithCart: (accountId: string) => void
  cancelAccountEditing: () => void
  deleteAccount: (accountId: string) => void
  
  // Actions - Payment Processing
  processPayment: (payments: Payment[]) => Promise<string> // Returns sale ID
  
  // Actions - Product Management
  setProductos: (productos: Producto[]) => void
  addProducto: (producto: Producto) => void
  updateProducto: (producto: Producto) => void
  
  // Computed values
  getCartTotal: () => Money
  getCartSubtotal: () => Money
  getCartTax: () => Money
  getAccountTotal: (accountId: string) => Money
  
  // Utilities
  recalculateCart: () => void
}

const TAX_RATE = 0.16 // 16% IVA for Mexico

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCart: {
        items: [],
        subtotal: 0,
        descuento: 0,
        impuestos: 0,
        total: 0,
        cliente: undefined,
        notas: undefined,
      },
      
      cuentasAbiertas: [],
      editingAccountId: null,
      editingAccountOriginal: null,
      productos: [],
      lastProductsSync: null,
      selectedCliente: null,

      // Cart Management
      addProductToCart: (producto: Producto, cantidad = 1) => {
        const { currentCart, recalculateCart } = get()
        
        // Check if product already exists in cart
        const existingItemIndex = currentCart.items.findIndex(
          item => item.producto.id === producto.id
        )
        
        let newItems: CartItem[]
        
        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = currentCart.items.map((item, index) => 
            index === existingItemIndex 
              ? { 
                  ...item, 
                  cantidad: item.cantidad + cantidad,
                  subtotal: (item.cantidad + cantidad) * (item.precio_unitario || 0)
                }
              : item
          )
        } else {
          // Add new item
          const newItem: CartItem = {
            producto,
            cantidad,
            precio_unitario: producto.precio_venta || 0,
            subtotal: cantidad * (producto.precio_venta || 0),
          }
          newItems = [...currentCart.items, newItem]
        }
        
        set({ 
          currentCart: { 
            ...currentCart, 
            items: newItems 
          } 
        })
        
        recalculateCart()
      },

      updateCartItemQuantity: (productoId: string, cantidad: number) => {
        const { currentCart, recalculateCart } = get()
        
        if (cantidad <= 0) {
          // Remove item if quantity is 0 or less
          get().removeCartItem(productoId)
          return
        }
        
        const newItems = currentCart.items.map(item => 
          item.producto.id === productoId 
            ? { 
                ...item, 
                cantidad,
                subtotal: cantidad * (item.precio_unitario || 0)
              }
            : item
        )
        
        set({ 
          currentCart: { 
            ...currentCart, 
            items: newItems 
          } 
        })
        
        recalculateCart()
      },

      removeCartItem: (productoId: string) => {
        const { currentCart, recalculateCart } = get()
        
        const newItems = currentCart.items.filter(
          item => item.producto.id !== productoId
        )
        
        set({ 
          currentCart: { 
            ...currentCart, 
            items: newItems 
          } 
        })
        
        recalculateCart()
      },

      clearCart: () => {
        set({
          currentCart: {
            items: [],
            subtotal: 0,
            descuento: 0,
            impuestos: 0,
            total: 0,
            cliente: undefined,
            notas: undefined,
          }
        })
      },

      applyDiscount: (discount: number) => {
        const { currentCart, recalculateCart } = get()
        
        set({ 
          currentCart: { 
            ...currentCart, 
            descuento: discount 
          } 
        })
        
        recalculateCart()
      },

      setCartCliente: (cliente: Cliente | null) => {
        const { currentCart } = get()
        
        set({ 
          currentCart: { 
            ...currentCart, 
            cliente: cliente || undefined 
          },
          selectedCliente: cliente
        })
      },

      setCartNotes: (notes: string) => {
        const { currentCart } = get()
        
        set({ 
          currentCart: { 
            ...currentCart, 
            notas: notes || undefined 
          } 
        })
      },

      // Account Management
      saveCartAsAccount: async (nombre: string) => {
        const { currentCart } = get()
        
        if (currentCart.items.length === 0) return
        
        try {
          // Create account via API
          const accountData = {
            cliente_id: currentCart.cliente?.id || null,
            cliente_nombre: nombre,
            total: currentCart.total,
          }

          const response = await fetch('/api/cuentas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al crear la cuenta')
          }

          const { data: cuenta } = await response.json()

          // Add items to the account
          const itemsData = {
            items: currentCart.items.map(item => ({
              producto_id: item.producto.id,
              cantidad: item.cantidad,
              precio_unit: item.precio_unitario,
            }))
          }

          await fetch(`/api/cuentas/${cuenta.id}/items`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemsData),
          })

          // Update local state
          set((state) => ({
            cuentasAbiertas: [...state.cuentasAbiertas, {
              id: cuenta.id,
              nombre: cuenta.cliente_nombre,
              cliente: currentCart.cliente,
              items: [...currentCart.items],
              subtotal: currentCart.subtotal,
              descuento: currentCart.descuento,
              impuestos: currentCart.impuestos,
              total: currentCart.total,
              created_at: cuenta.created_at,
              estado: 'abierta',
            }]
          }))
        
          // Clear cart after saving
          get().clearCart()
        } catch (error) {
          console.error('Error saving account:', error)
          throw error
        }
      },

      loadAccount: (accountId: string) => {
        const { cuentasAbiertas } = get()
        
        const account = cuentasAbiertas.find(cuenta => cuenta.id === accountId)
        if (!account) return
        
        // Store original account for potential rollback
        const originalAccount: Cuenta = {
          id: account.id,
          nombre: account.nombre,
          cliente: account.cliente,
          items: [...account.items],
          subtotal: account.subtotal,
          descuento: account.descuento,
          impuestos: account.impuestos,
          total: account.total,
          estado: account.estado,
          created_at: account.created_at,
          updated_at: account.updated_at,
        }
        
        set({
          // Load account into cart for editing
          currentCart: {
            items: [...account.items],
            subtotal: account.subtotal,
            descuento: account.descuento,
            impuestos: account.impuestos,
            total: account.total,
            cliente: account.cliente,
            notas: undefined,
          },
          selectedCliente: account.cliente || null,
          // Set editing state
          editingAccountId: accountId,
          editingAccountOriginal: originalAccount,
        })
        
        // Keep account in list but mark as being edited (we don't remove it anymore)
      },

      updateExistingAccount: (nombre: string) => {
        const { currentCart, editingAccountId, cuentasAbiertas } = get()
        
        if (!editingAccountId) {
          // If not editing, fallback to saving as new account
          get().saveCartAsAccount(nombre)
          return
        }

        // Find and update the existing account
        const updatedCuentas = cuentasAbiertas.map(cuenta => {
          if (cuenta.id === editingAccountId) {
            return {
              ...cuenta,
              nombre,
              items: [...currentCart.items],
              subtotal: currentCart.subtotal,
              descuento: currentCart.descuento,
              impuestos: currentCart.impuestos,
              total: currentCart.total,
              cliente: currentCart.cliente,
              updated_at: new Date().toISOString(),
            }
          }
          return cuenta
        })

        set({
          cuentasAbiertas: updatedCuentas,
          // Clear editing state
          editingAccountId: null,
          editingAccountOriginal: null,
        })

        // Clear cart after updating
        get().clearCart()
      },

      cancelAccountEditing: () => {
        set({
          editingAccountId: null,
          editingAccountOriginal: null,
        })
        // Clear cart to start fresh
        get().clearCart()
      },

      addCartToExistingAccount: (accountId: string) => {
        const { currentCart, cuentasAbiertas, recalculateCart } = get()
        
        if (currentCart.items.length === 0) return
        
        // Find the existing account
        const accountIndex = cuentasAbiertas.findIndex(cuenta => cuenta.id === accountId)
        if (accountIndex === -1) return
        
        const existingAccount = cuentasAbiertas[accountIndex]
        
        // Merge cart items with existing account items
        const mergedItems = [...existingAccount.items]
        
        // Add each item from current cart
        currentCart.items.forEach(cartItem => {
          const existingItemIndex = mergedItems.findIndex(
            item => item.producto.id === cartItem.producto.id
          )
          
          if (existingItemIndex >= 0) {
            // Update quantity if product already exists
            const existingItem = mergedItems[existingItemIndex]
            mergedItems[existingItemIndex] = {
              ...existingItem,
              cantidad: existingItem.cantidad + cartItem.cantidad,
              subtotal: (existingItem.cantidad + cartItem.cantidad) * existingItem.precio_unitario
            }
          } else {
            // Add new item
            mergedItems.push({ ...cartItem })
          }
        })
        
        // Calculate new totals
        const newSubtotal = mergedItems.reduce((sum, item) => sum + item.subtotal, 0)
        const newTax = newSubtotal * 0.16 // 16% IVA
        const newTotal = newSubtotal + newTax - existingAccount.descuento
        
        // Update the account with merged items
        const updatedCuentas = cuentasAbiertas.map((cuenta, index) => 
          index === accountIndex ? {
            ...cuenta,
            items: mergedItems,
            subtotal: newSubtotal,
            impuestos: newTax,
            total: newTotal,
            updated_at: new Date().toISOString(),
          } : cuenta
        )
        
        set({
          cuentasAbiertas: updatedCuentas,
        })
        
        // Clear current cart after adding to account
        get().clearCart()
      },

      replaceAccountWithCart: (accountId: string) => {
        const { currentCart, cuentasAbiertas, editingAccountId } = get()
        
        if (currentCart.items.length === 0) return
        
        // Find the existing account
        const accountIndex = cuentasAbiertas.findIndex(cuenta => cuenta.id === accountId)
        if (accountIndex === -1) return
        
        const existingAccount = cuentasAbiertas[accountIndex]
        
        // Replace account items with current cart items (no merging)
        const newItems = [...currentCart.items]
        
        // Calculate new totals
        const newSubtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0)
        const newTax = newSubtotal * 0.16 // 16% IVA
        const newTotal = newSubtotal + newTax - (currentCart.descuento || 0)
        
        // Update the account by replacing content
        const updatedCuentas = cuentasAbiertas.map((cuenta, index) => 
          index === accountIndex ? {
            ...cuenta,
            items: newItems,
            subtotal: newSubtotal,
            impuestos: newTax,
            total: newTotal,
            descuento: currentCart.descuento || existingAccount.descuento,
            cliente: currentCart.cliente || existingAccount.cliente,
            updated_at: new Date().toISOString(),
          } : cuenta
        )
        
        set({
          cuentasAbiertas: updatedCuentas,
          // Clear editing state since we're updating
          editingAccountId: null,
          editingAccountOriginal: null,
        })
        
        // Clear current cart after replacing account
        get().clearCart()
      },

      deleteAccount: (accountId: string) => {
        const { cuentasAbiertas } = get()
        
        set({
          cuentasAbiertas: cuentasAbiertas.filter(cuenta => cuenta.id !== accountId)
        })
      },

      // Payment Processing
      processPayment: async (payments: Payment[]): Promise<string> => {
        const { currentCart, editingAccountId } = get()
        
        if (currentCart.items.length === 0) {
          throw new Error('El carrito está vacío')
        }
        
        const totalPaid = payments.reduce((sum, payment) => sum + payment.cantidad, 0)
        const cartTotal = get().getCartTotal().toNumber()
        
        if (totalPaid < cartTotal) {
          throw new Error('El pago es insuficiente')
        }
        
        try {
          // Prepare sale data for API
          const saleData = {
            cliente_id: currentCart.cliente?.id || null,
            cuenta_id: editingAccountId || null,
            total: cartTotal,
            items: currentCart.items.map(item => ({
              producto_id: item.producto.id,
              cantidad: item.cantidad,
              precio_unit: item.precio_unitario,
            }))
          }

          // Call API to create sale
          const response = await fetch('/api/ventas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(saleData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al procesar la venta')
          }

          const { data: venta } = await response.json()
          
          // If we were editing an account, close it
          if (editingAccountId) {
            await fetch(`/api/cuentas/${editingAccountId}`, {
              method: 'DELETE',
            })
            
            // Update local state
            set((state) => ({
              cuentasAbiertas: state.cuentasAbiertas.filter(cuenta => cuenta.id !== editingAccountId),
              editingAccountId: null,
              editingAccountOriginal: null,
            }))
          }
          
          // Clear cart after successful payment
          get().clearCart()
          
          return venta.id
        } catch (error) {
          console.error('Payment processing error:', error)
          throw error instanceof Error ? error : new Error('Error al procesar el pago')
        }
      },

      // Product Management
      setProductos: (productos: Producto[]) => {
        set({ 
          productos, 
          lastProductsSync: new Date().toISOString() 
        })
      },

      addProducto: (producto: Producto) => {
        const { productos } = get()
        set({ 
          productos: [...productos, producto] 
        })
      },

      updateProducto: (updatedProducto: Producto) => {
        const { productos } = get()
        set({
          productos: productos.map(p => 
            p.id === updatedProducto.id ? updatedProducto : p
          )
        })
      },

      // Computed values
      getCartSubtotal: () => {
        const { currentCart } = get()
        const subtotal = currentCart.items.reduce(
          (sum, item) => sum + (item.subtotal || 0), 
          0
        )
        return new Money(subtotal || 0)
      },

      getCartTax: () => {
        const { currentCart } = get()
        
        // Calculate tax only on items that apply IVA
        const taxableSubtotal = currentCart.items.reduce((sum, item) => {
          const itemSubtotal = item.subtotal || 0
          const aplicaIVA = item.producto.aplica_iva ?? true // Default true if field doesn't exist
          return sum + (aplicaIVA ? itemSubtotal : 0)
        }, 0)
        
        const discount = new Money(currentCart.descuento)
        const taxableAmount = new Money(taxableSubtotal).subtract(discount)
        return calculateTax(taxableAmount, TAX_RATE * 100)
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal()
        const discount = new Money(get().currentCart.descuento)
        const tax = get().getCartTax()
        return subtotal.subtract(discount).add(tax)
      },

      getAccountTotal: (accountId: string) => {
        const { cuentasAbiertas } = get()
        const account = cuentasAbiertas.find(cuenta => cuenta.id === accountId)
        return account ? new Money(account.total) : new Money(0)
      },

      // Utilities
      recalculateCart: () => {
        const { currentCart } = get()
        const subtotal = get().getCartSubtotal().toNumber()
        const tax = get().getCartTax().toNumber()
        const total = get().getCartTotal().toNumber()
        
        set({
          currentCart: {
            ...currentCart,
            subtotal,
            impuestos: tax,
            total,
          }
        })
      },
    }),
    {
      name: 'cobroya-pos',
      partialize: (state) => ({
        currentCart: state.currentCart,
        cuentasAbiertas: state.cuentasAbiertas,
        productos: state.productos,
        lastProductsSync: state.lastProductsSync,
      }),
    }
  )
)

// Helper hooks
export const useCart = () => usePOSStore((state) => state.currentCart)
export const useCartItems = () => usePOSStore((state) => state.currentCart.items)
export const useCartTotal = () => usePOSStore((state) => state.getCartTotal())
export const useCuentasAbiertas = () => usePOSStore((state) => state.cuentasAbiertas)
export const useProductos = () => usePOSStore((state) => state.productos)

// Products will be loaded from API instead of hardcoded initialization