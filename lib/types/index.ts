// CobroYa POS TypeScript Definitions
import type { UserRole, PaymentMethod, SaleStatus } from '../utils/constants'

// Base entity types
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// User and authentication types
export interface User extends BaseEntity {
  tenant_id: string
  email: string
  nombre: string
  rol: UserRole
  activo: boolean
}

export interface Tenant extends BaseEntity {
  nombre: string
  descripcion?: string
  dominio?: string
  activo: boolean
}

// Product and inventory types
export interface Producto extends BaseEntity {
  tenant_id: string
  codigo: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  categoria_id?: string
  imagen_url?: string
  activo: boolean
}

export interface Categoria extends BaseEntity {
  tenant_id: string
  nombre: string
  descripcion?: string
  color?: string
  activo: boolean
}

// Sales and transaction types
export interface Venta extends BaseEntity {
  tenant_id: string
  usuario_id: string
  cliente_id?: string
  total: number
  subtotal: number
  impuestos: number
  descuento: number
  estado: SaleStatus
  metodo_pago: PaymentMethod
  notas?: string
}

export interface VentaDetalle extends BaseEntity {
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  descuento?: number
}

export interface Cliente extends BaseEntity {
  tenant_id: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  rfc?: string
  activo: boolean
}

// Cart and POS types
export interface CartItem {
  producto: Producto
  cantidad: number
  precio_unitario: number
  subtotal: number
  descuento?: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  descuento: number
  impuestos: number
  total: number
  cliente?: Cliente
  notas?: string
}

export interface Cuenta {
  id: string
  nombre: string
  cliente?: Cliente
  items: CartItem[]
  subtotal: number
  descuento: number
  impuestos: number
  total: number
  created_at: string
  estado: 'abierta' | 'pagada' | 'cancelada'
}

// Payment types
export interface Payment {
  metodo: PaymentMethod
  cantidad: number
  referencia?: string
}

export interface PaymentSummary {
  subtotal: number
  descuento: number
  impuestos: number
  total: number
  pagado: number
  cambio: number
  pagos: Payment[]
}

// UI State types
export interface UIState {
  sidebarOpen: boolean
  activeSheet: 'cart' | 'payment' | 'customer' | null
  loading: boolean
  searchQuery: string
  selectedCategory?: string
}

// Form types
export interface ProductSearchFilters {
  query?: string
  categoria_id?: string
  activo?: boolean
  stock_minimo?: number
}

export interface SalesFilters {
  fecha_inicio?: string
  fecha_fin?: string
  usuario_id?: string
  cliente_id?: string
  metodo_pago?: PaymentMethod
  estado?: SaleStatus
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// Dashboard and analytics types
export interface DashboardStats {
  ventas_hoy: {
    total: number
    cantidad: number
    promedio: number
  }
  ventas_semana: {
    total: number
    cantidad: number
    crecimiento: number
  }
  productos_vendidos: number
  cuentas_abiertas: number
  efectivo_caja: number
}

export interface VentasByHour {
  hora: number
  cantidad: number
  total: number
}

export interface ProductoMasVendido {
  producto: Producto
  cantidad_vendida: number
  total_vendido: number
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: string
}

// Settings and configuration types
export interface TenantSettings {
  tenant_id: string
  impuesto_porcentaje: number
  redondeo_centavos: boolean
  imprimir_recibo: boolean
  solicitar_cliente: boolean
  mostrar_stock: boolean
  permitir_venta_sin_stock: boolean
  moneda: string
  zona_horaria: string
}

// Responsive design types
export type BreakpointSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  breakpoint: BreakpointSize
  touchSupported: boolean
}

// Export all types for easier imports
export * from '../utils/constants'