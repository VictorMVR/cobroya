// CobroYa POS Stores
// Central export file for all Zustand stores

// Auth store exports
export {
  useAuthStore,
  useUser,
  useTenant,
  useIsAuthenticated,
  useUserRole,
  useCanAccessAdmin,
  useCanManageInventory,
  useCanProcessSales,
} from './auth.store'

// POS store exports
export {
  usePOSStore,
  useCart,
  useCartItems,
  useCartTotal,
  useCuentasAbiertas,
  useProductos,
} from './pos.store'

// UI store exports
export {
  useUIStore,
  useSidebar,
  useSheet,
  useSearch,
  useNotifications,
  useModal,
  useDeviceInfo,
  useNotify,
  useGlobalLoading,
} from './ui.store'

// Toast store exports
export {
  useToastStore,
  useToast,
} from './toast.store'

// Re-export types for convenience
export type * from '@/lib/types'