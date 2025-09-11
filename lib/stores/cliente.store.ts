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

// Demo data with common Mexican names and info
const demoClientes: Cliente[] = [
  {
    id: '1',
    tenant_id: 'demo',
    nombre: 'María González',
    email: 'maria.gonzalez@email.com',
    telefono: '555-1234',
    direccion: 'Av. Revolución 123, Col. Centro',
    rfc: 'GOGM850101ABC',
    activo: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    tenant_id: 'demo',
    nombre: 'Juan Carlos Pérez',
    email: 'juan.perez@gmail.com',
    telefono: '555-5678',
    direccion: 'Calle Morelos 456, Col. Juárez',
    rfc: 'PEJC750215DEF',
    activo: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    tenant_id: 'demo',
    nombre: 'Ana Sofia Rodríguez',
    email: 'ana.rodriguez@outlook.com',
    telefono: '555-9012',
    direccion: 'Blvd. Independencia 789, Fracc. Las Flores',
    activo: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    tenant_id: 'demo',
    nombre: 'Roberto Martínez',
    telefono: '555-3456',
    direccion: 'Calle Hidalgo 321, Col. Centro',
    rfc: 'MARC850920GHI',
    activo: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    tenant_id: 'demo',
    nombre: 'Carmen López',
    email: 'carmen.lopez@yahoo.com',
    telefono: '555-7890',
    activo: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    tenant_id: 'demo',
    nombre: 'Luis Fernando Vargas',
    telefono: '555-2468',
    direccion: 'Av. Universidad 567, Col. Del Valle',
    rfc: 'VARL800512JKL',
    activo: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    tenant_id: 'demo',
    nombre: 'Patricia Hernández',
    email: 'patricia.hernandez@hotmail.com',
    telefono: '555-1357',
    direccion: 'Calle Zaragoza 890, Col. San José',
    activo: false, // Inactive client
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: '8',
    tenant_id: 'demo',
    nombre: 'Miguel Ángel Torres',
    telefono: '555-8642',
    rfc: 'TORM770830MNO',
    activo: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updated_at: new Date().toISOString(),
  }
]

export const useClienteStore = create<ClienteState>()(
  persist(
    (set, get) => ({
      // Initial state
      clientes: demoClientes,
      searchQuery: '',
      selectedCliente: null,
      isLoading: false,

      // CRUD Operations
      createCliente: (clienteData) => {
        const newCliente: Cliente = {
          id: crypto.randomUUID(),
          tenant_id: 'demo',
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
          cliente.nombre.toLowerCase().includes(query) && cliente.activo
        )
      },

      findClienteByPhone: (phone) => {
        return get().clientes.find(cliente => 
          cliente.telefono === phone && cliente.activo
        )
      },

      getActiveClientes: () => {
        return get().clientes.filter(cliente => cliente.activo)
      },

      // Metrics
      getTotalClientes: () => {
        return get().clientes.length
      },

      getActiveClientesCount: () => {
        return get().clientes.filter(cliente => cliente.activo).length
      },

      getInactiveClientesCount: () => {
        return get().clientes.filter(cliente => !cliente.activo).length
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
export const useActiveClientes = () => useClienteStore((state) => state.getActiveClientes())
export const useClienteSearch = () => useClienteStore((state) => state.searchQuery)
export const useSelectedCliente = () => useClienteStore((state) => state.selectedCliente)
export const useClienteMetrics = () => useClienteStore((state) => ({
  total: state.getTotalClientes(),
  active: state.getActiveClientesCount(),
  inactive: state.getInactiveClientesCount(),
}))