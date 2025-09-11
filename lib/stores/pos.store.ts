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
      
      cuentasAbiertas: [
        {
          id: 'cuenta-1',
          nombre: 'Mesa 5',
          items: [
            {
              producto: {
                id: '1',
                nombre: 'Coca-Cola 600ml',
                codigo: 'COCA-600',
                precio: 25.00,
                categoria: 'bebidas',
                activo: true,
                cantidad_stock: 50,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              cantidad: 2,
              precio_unitario: 25.00,
              subtotal: 50.00,
            },
            {
              producto: {
                id: '2',
                nombre: 'Sabritas Original 45g',
                codigo: 'SAB-ORIG-45',
                precio: 18.00,
                categoria: 'snacks',
                activo: true,
                cantidad_stock: 30,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              cantidad: 1,
              precio_unitario: 18.00,
              subtotal: 18.00,
            }
          ],
          subtotal: 68.00,
          descuento: 0,
          impuestos: 10.88,
          total: 78.88,
          estado: 'abierta',
          cliente: {
            id: 'cliente-1',
            nombre: 'Juan Pérez',
            telefono: '555-1234',
            email: 'juan@example.com',
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cuenta-2',
          nombre: 'Fiado - María García',
          items: [
            {
              producto: {
                id: '3',
                nombre: 'Leche Lala 1L',
                codigo: 'LALA-1L',
                precio: 32.00,
                categoria: 'lacteos',
                activo: true,
                cantidad_stock: 20,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              cantidad: 3,
              precio_unitario: 32.00,
              subtotal: 96.00,
            },
            {
              producto: {
                id: '4',
                nombre: 'Pan Bimbo Blanco',
                codigo: 'BIMBO-BLANCO',
                precio: 35.00,
                categoria: 'panaderia',
                activo: true,
                cantidad_stock: 15,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              cantidad: 2,
              precio_unitario: 35.00,
              subtotal: 70.00,
            }
          ],
          subtotal: 166.00,
          descuento: 10.00,
          impuestos: 24.96,
          total: 180.96,
          estado: 'abierta',
          cliente: {
            id: 'cliente-2',
            nombre: 'María García',
            telefono: '555-5678',
            email: 'maria@example.com',
          },
          created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago (old account)
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cuenta-3',
          nombre: 'Mesa 12 - Cumpleaños',
          items: [
            {
              producto: {
                id: '5',
                nombre: 'Cerveza Corona 355ml',
                codigo: 'CORONA-355',
                precio: 45.00,
                categoria: 'bebidas',
                activo: true,
                cantidad_stock: 24,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              cantidad: 6,
              precio_unitario: 45.00,
              subtotal: 270.00,
            },
            {
              producto: {
                id: '6',
                nombre: 'Nachos con Queso',
                codigo: 'NACHOS-QUESO',
                precio: 65.00,
                categoria: 'snacks',
                activo: true,
                cantidad_stock: 12,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              cantidad: 2,
              precio_unitario: 65.00,
              subtotal: 130.00,
            }
          ],
          subtotal: 400.00,
          descuento: 0,
          impuestos: 64.00,
          total: 464.00,
          estado: 'abierta',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          updated_at: new Date().toISOString(),
        }
      ],
      editingAccountId: null,
      editingAccountOriginal: null,
      productos: [
        {
          id: '1',
          nombre: 'Coca-Cola 600ml',
          codigo: 'COCA-600',
          descripcion: 'Refresco de cola 600ml',
          precio: 25.00,
          categoria: 'bebidas',
          categoria_id: 'bebidas',
          activo: true,
          stock: 50,
          cantidad_stock: 50,
          costo: 18.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          nombre: 'Sabritas Original 45g',
          codigo: 'SAB-ORIG-45',
          descripcion: 'Papas fritas sabor original',
          precio: 18.00,
          categoria: 'snacks',
          categoria_id: 'snacks',
          activo: true,
          stock: 30,
          cantidad_stock: 30,
          costo: 12.50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          nombre: 'Leche Lala 1L',
          codigo: 'LALA-1L',
          descripcion: 'Leche entera 1 litro',
          precio: 32.00,
          categoria: 'lacteos',
          categoria_id: 'lacteos',
          activo: true,
          stock: 20,
          cantidad_stock: 20,
          costo: 24.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          nombre: 'Pan Bimbo Blanco',
          codigo: 'BIMBO-BLANCO',
          descripcion: 'Pan de caja blanco grande',
          precio: 35.00,
          categoria: 'panaderia',
          categoria_id: 'panaderia',
          activo: true,
          stock: 15,
          cantidad_stock: 15,
          costo: 28.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '5',
          nombre: 'Cerveza Corona 355ml',
          codigo: 'CORONA-355',
          descripcion: 'Cerveza clara 355ml',
          precio: 45.00,
          categoria: 'bebidas',
          categoria_id: 'bebidas',
          activo: true,
          stock: 24,
          cantidad_stock: 24,
          costo: 32.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '6',
          nombre: 'Galletas Oreo',
          codigo: 'OREO-ORIGINAL',
          descripcion: 'Galletas Oreo paquete familiar',
          precio: 28.00,
          categoria: 'snacks',
          categoria_id: 'snacks',
          activo: true,
          stock: 18,
          cantidad_stock: 18,
          costo: 20.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '7',
          nombre: 'Agua Bonafont 1.5L',
          codigo: 'BONAFONT-1.5L',
          descripcion: 'Agua purificada 1.5 litros',
          precio: 15.00,
          categoria: 'bebidas',
          categoria_id: 'bebidas',
          activo: true,
          stock: 40,
          cantidad_stock: 40,
          costo: 8.50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '8',
          nombre: 'Yogurt Danone Fresa',
          codigo: 'DANONE-FRESA',
          descripcion: 'Yogurt bebible sabor fresa 1L',
          precio: 38.00,
          categoria: 'lacteos',
          categoria_id: 'lacteos',
          activo: true,
          stock: 12,
          cantidad_stock: 12,
          costo: 28.50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '9',
          nombre: 'Aceite Capullo 1L',
          codigo: 'CAPULLO-1L',
          descripcion: 'Aceite vegetal comestible 1L',
          precio: 48.00,
          categoria: 'despensa',
          categoria_id: 'despensa',
          activo: true,
          stock: 8,
          cantidad_stock: 8,
          costo: 38.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '10',
          nombre: 'Huevos San Juan 12 pzas',
          codigo: 'HUEVO-12',
          descripcion: 'Huevos frescos carton de 12',
          precio: 42.00,
          categoria: 'despensa',
          categoria_id: 'despensa',
          activo: true,
          stock: 25,
          cantidad_stock: 25,
          costo: 32.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
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
                  subtotal: (item.cantidad + cantidad) * item.precio_unitario
                }
              : item
          )
        } else {
          // Add new item
          const newItem: CartItem = {
            producto,
            cantidad,
            precio_unitario: producto.precio,
            subtotal: cantidad * producto.precio,
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
                subtotal: cantidad * item.precio_unitario
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
      saveCartAsAccount: (nombre: string) => {
        const { currentCart, cuentasAbiertas } = get()
        
        if (currentCart.items.length === 0) return
        
        const newAccount: Cuenta = {
          id: crypto.randomUUID(),
          nombre,
          cliente: currentCart.cliente,
          items: [...currentCart.items],
          subtotal: currentCart.subtotal,
          descuento: currentCart.descuento,
          impuestos: currentCart.impuestos,
          total: currentCart.total,
          created_at: new Date().toISOString(),
          estado: 'abierta',
        }
        
        set({ 
          cuentasAbiertas: [...cuentasAbiertas, newAccount] 
        })
        
        // Clear cart after saving
        get().clearCart()
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
        const { currentCart } = get()
        
        if (currentCart.items.length === 0) {
          throw new Error('El carrito está vacío')
        }
        
        const totalPaid = payments.reduce((sum, payment) => sum + payment.cantidad, 0)
        const cartTotal = get().getCartTotal().toNumber()
        
        if (totalPaid < cartTotal) {
          throw new Error('El pago es insuficiente')
        }
        
        try {
          // TODO: Implement actual payment processing with Supabase
          console.log('Processing payment:', { 
            cart: currentCart, 
            payments, 
            totalPaid, 
            cartTotal 
          })
          
          // Mock successful payment
          const saleId = crypto.randomUUID()
          
          // Clear cart after successful payment
          get().clearCart()
          
          return saleId
        } catch (error) {
          console.error('Payment processing error:', error)
          throw new Error('Error al procesar el pago')
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
          (sum, item) => sum + item.subtotal, 
          0
        )
        return new Money(subtotal)
      },

      getCartTax: () => {
        const subtotal = get().getCartSubtotal()
        const discount = new Money(get().currentCart.descuento)
        const taxableAmount = subtotal.subtract(discount)
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

// Initialize with sample products for development
if (typeof window !== 'undefined') {
  const sampleProducts: Producto[] = [
    {
      id: '1',
      tenant_id: 'demo',
      codigo: 'COC001',
      nombre: 'Coca-Cola 600ml',
      descripcion: 'Refresco de cola 600ml',
      precio: 18.50,
      stock: 48,
      categoria_id: '1',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      tenant_id: 'demo',
      codigo: 'SAB001',
      nombre: 'Sabritas Clásicas',
      descripcion: 'Papas fritas sabor natural 45g',
      precio: 15.00,
      stock: 36,
      categoria_id: '2',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      tenant_id: 'demo',
      codigo: 'CHI001',
      nombre: 'Chicles Trident',
      descripcion: 'Chicles sabor menta 12 piezas',
      precio: 8.50,
      stock: 24,
      categoria_id: '3',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      tenant_id: 'demo',
      codigo: 'MAR001',
      nombre: 'Marlboro Rojos',
      descripcion: 'Cigarrillos Marlboro cajetilla',
      precio: 75.00,
      stock: 12,
      categoria_id: '4',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      tenant_id: 'demo',
      codigo: 'PEP001',
      nombre: 'Pepsi 600ml',
      descripcion: 'Refresco de cola Pepsi 600ml',
      precio: 17.00,
      stock: 32,
      categoria_id: '1',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      tenant_id: 'demo',
      codigo: 'DOR001',
      nombre: 'Doritos Nacho',
      descripcion: 'Tortillas de maíz sabor nacho 62g',
      precio: 19.50,
      stock: 28,
      categoria_id: '2',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '7',
      tenant_id: 'demo',
      codigo: 'GAT001',
      nombre: 'Gatorade Azul',
      descripcion: 'Bebida deportiva sabor azul 500ml',
      precio: 22.00,
      stock: 20,
      categoria_id: '1',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '8',
      tenant_id: 'demo',
      codigo: 'CAR001',
      nombre: 'Carlos V',
      descripcion: 'Chocolate con cacahuate 40g',
      precio: 12.00,
      stock: 45,
      categoria_id: '3',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '9',
      tenant_id: 'demo',
      codigo: 'AGU001',
      nombre: 'Agua Ciel 600ml',
      descripcion: 'Agua purificada 600ml',
      precio: 12.50,
      stock: 60,
      categoria_id: '1',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10',
      tenant_id: 'demo',
      codigo: 'CHE001',
      nombre: 'Cheetos Poffs',
      descripcion: 'Fritura de maíz con queso 42g',
      precio: 16.00,
      stock: 22,
      categoria_id: '2',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Initialize products if store is empty
  setTimeout(() => {
    const currentProducts = usePOSStore.getState().productos
    if (currentProducts.length === 0) {
      usePOSStore.getState().setProductos(sampleProducts)
    }
  }, 100)
}