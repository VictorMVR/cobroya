// CobroYa POS Constants
// Mobile-first design system constants

export const BREAKPOINTS = {
  xs: 320, // iPhone SE minimum
  sm: 375, // iPhone standard
  md: 768, // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
} as const

export const TOUCH_TARGETS = {
  minimum: 44, // iOS accessibility minimum
  comfortable: 48, // Comfortable touch target
  large: 56, // Large touch target
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const GRID_CONFIGS = {
  mobile: 3, // 3 columns on mobile
  tablet: 4, // 4 columns on tablet
  desktop: 6, // 6 columns on desktop
  iphoneSE: 2, // 2 columns for iPhone SE
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor', 
  CAJERO: 'cajero',
} as const

export const PAYMENT_METHODS = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
} as const

export const SALE_STATUS = {
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
  PENDIENTE: 'pendiente',
} as const

// Currency formatting for Mexican Peso
export const CURRENCY_CONFIG = {
  locale: 'es-MX',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const

// Common bill denominations for quick payment
export const BILL_DENOMINATIONS = [
  20, 50, 100, 200, 500, 1000
] as const

// Keyboard shortcuts for desktop
export const KEYBOARD_SHORTCUTS = {
  NEW_SALE: 'n',
  SEARCH_PRODUCT: '/',
  OPEN_CART: 'c',
  COMPLETE_SALE: 'Enter',
  CANCEL_SALE: 'Escape',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]
export type SaleStatus = typeof SALE_STATUS[keyof typeof SALE_STATUS]