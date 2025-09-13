import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cliente } from '@/lib/types'

interface ClienteState {
  // State
  clientes: Cliente[]
  searchQuery: string
  selectedCliente: Cliente | null
  isLoading: boolean
  
  // Actions - CRUD Operations
  loadClientes: () => Promise<void>
  createCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void
  updateCliente: (id: string, updates: Partial<Cliente>) => void
  deleteCliente: (id: string) => void
  setClientes: (clientes: Cliente[]) => void
  
  // Actions - Selection and Search
  setSelectedCliente: (cliente: Cliente | null) => void
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  
  // Actions - Utilities
  findClienteById: (id: string) => Cliente | undefined
  findClientesByName: (name: string) => Cliente[]
  findClienteByPhone: (phone: string) => Cliente | undefined
  getActiveClientes: () => Cliente[]
  
  // Actions - Metrics
  getTotalClientes: () => number
  getActiveClientesCount: () => number
  getInactiveClientesCount: () => number
}

// No longer using demo data - all data comes from API

export const useClienteStore = create<ClienteState>()(
  persist(
    (set, get) => ({
      // Initial state
      clientes: [],
      searchQuery: '',
      selectedCliente: null,
      isLoading: false,

      // CRUD Operations
      loadClientes: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/clientes')
          const result = await response.json()
          
          if (response.ok) {
            set({ clientes: result.data || [] })
          } else {
            console.error('Error loading clientes:', result.error)
          }
        } catch (error) {
          console.error('Error loading clientes:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      createCliente: (clienteData) => {
        const newCliente: Cliente = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...clienteData,
        }
        
        set((state) => ({
          clientes: [...state.clientes, newCliente]
        }))
      },

      updateCliente: (id, updates) => {
        set((state) => ({
          clientes: state.clientes.map(cliente => 
            cliente.id === id 
              ? { ...cliente, ...updates, updated_at: new Date().toISOString() }
              : cliente
          )
        }))
      },

      deleteCliente: (id) => {
        set((state) => ({
          clientes: state.clientes.filter(cliente => cliente.id !== id),
          selectedCliente: state.selectedCliente?.id === id ? null : state.selectedCliente
        }))
      },

      setClientes: (clientes) => {
        set({ clientes })
      },

      // Selection and Search
      setSelectedCliente: (cliente) => {
        set({ selectedCliente: cliente })
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      clearSearch: () => {
        set({ searchQuery: '' })
      },

      // Utilities
      findClienteById: (id) => {
        return get().clientes.find(cliente => cliente.id === id)
      },

      findClientesByName: (name) => {
        const query = name.toLowerCase()
        return get().clientes.filter(cliente => 
          cliente.nombre.toLowerCase().includes(query)
        )
      },

      findClienteByPhone: (phone) => {
        return get().clientes.find(cliente => 
          cliente.telefono === phone
        )
      },

      getActiveClientes: () => {
        return get().clientes
      },

      // Metrics
      getTotalClientes: () => {
        return get().clientes.length
      },

      getActiveClientesCount: () => {
        return get().clientes.length
      },

      getInactiveClientesCount: () => {
        return 0
      },
    }),
    {
      name: 'cobroya-clientes',
      partialize: (state) => ({
        clientes: state.clientes,
        selectedCliente: state.selectedCliente,
      }),
    }
  )
)

// Helper hooks for common operations
export const useActiveClientes = () => {
  const { clientes, getActiveClientes } = useClienteStore()
  return getActiveClientes()
}
export const useClienteSearch = () => useClienteStore((state) => state.searchQuery)
export const useSelectedCliente = () => useClienteStore((state) => state.selectedCliente)
export const useClienteMetrics = () => useClienteStore((state) => ({
  total: state.getTotalClientes(),
  active: state.getActiveClientesCount(),
  inactive: state.getInactiveClientesCount(),
}))