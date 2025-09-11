import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Tenant, UserRole } from '@/lib/types'

interface AuthState {
  // State
  user: User | null
  tenant: Tenant | null
  sucursal?: string
  isAuthenticated: boolean
  loading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  clearError: () => void
  
  // Role helpers
  hasRole: (role: UserRole) => boolean
  canAccessAdmin: () => boolean
  canManageInventory: () => boolean
  canProcessSales: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tenant: null,
      sucursal: undefined,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Authentication actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          // TODO: Implement Supabase authentication
          console.log('Login attempt:', { email, password })
          
          // Mock successful login for development
          const mockUser: User = {
            id: '1',
            tenant_id: '1',
            email,
            nombre: 'Usuario Demo',
            rol: 'admin',
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const mockTenant: Tenant = {
            id: '1',
            nombre: 'Mi Tiendita',
            descripcion: 'Tienda de conveniencia local',
            dominio: 'cobroya.mx',
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          set({ 
            user: mockUser, 
            tenant: mockTenant,
            isAuthenticated: true, 
            loading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error de autenticación',
            loading: false 
          })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null, 
          tenant: null, 
          isAuthenticated: false, 
          error: null 
        })
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        })
      },

      setTenant: (tenant: Tenant | null) => {
        set({ tenant })
      },

      clearError: () => {
        set({ error: null })
      },

      // Role-based access control
      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.rol === role
      },

      canAccessAdmin: () => {
        const { user } = get()
        return user?.rol === 'admin'
      },

      canManageInventory: () => {
        const { user } = get()
        return user?.rol === 'admin' || user?.rol === 'vendedor'
      },

      canProcessSales: () => {
        const { user } = get()
        return user?.rol === 'admin' || user?.rol === 'vendedor' || user?.rol === 'cajero'
      },
    }),
    {
      name: 'cobroya-auth', // Unique name for localStorage
      partialize: (state) => ({ 
        user: state.user, 
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Helper hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user)
export const useTenant = () => useAuthStore((state) => state.tenant)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useUserRole = () => useAuthStore((state) => state.user?.rol)

// Role-based hooks
export const useCanAccessAdmin = () => useAuthStore((state) => state.canAccessAdmin())
export const useCanManageInventory = () => useAuthStore((state) => state.canManageInventory())
export const useCanProcessSales = () => useAuthStore((state) => state.canProcessSales())