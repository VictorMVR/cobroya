'use client'

import { useState, useMemo } from 'react'
import { Users, Plus, Search, UserCheck, UserX, Clock } from 'lucide-react'
import { useClienteStore, useDeviceInfo, useToast } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/pos/SearchBar'
import { ClienteCard } from '@/components/clientes/ClienteCard'
import { ClienteForm } from '@/components/clientes/ClienteForm'
import type { Cliente } from '@/lib/types'

export default function ClientesPage() {
  const { isMobile } = useDeviceInfo()
  const toast = useToast()
  const { 
    clientes, 
    searchQuery, 
    setSearchQuery,
    deleteCliente,
    updateCliente,
    getTotalClientes,
    getActiveClientesCount,
    getInactiveClientesCount 
  } = useClienteStore()
  
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter clients based on search and status
  const filteredClientes = useMemo(() => {
    let filtered = clientes

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cliente => 
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.telefono?.toLowerCase().includes(query) ||
        cliente.email?.toLowerCase().includes(query) ||
        cliente.rfc?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(cliente => 
        filterStatus === 'active' ? cliente.activo : !cliente.activo
      )
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [clientes, searchQuery, filterStatus])

  // Calculate metrics
  const totalClientes = getTotalClientes()
  const activeCount = getActiveClientesCount()
  const inactiveCount = getInactiveClientesCount()

  const handleCreateCliente = () => {
    setEditingCliente(null)
    setShowForm(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleDeleteCliente = (cliente: Cliente) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${cliente.nombre}?`)) {
      deleteCliente(cliente.id)
      toast.success('Cliente eliminado correctamente')
    }
  }

  const handleToggleStatus = (cliente: Cliente) => {
    updateCliente(cliente.id, { activo: !cliente.activo })
    toast.success(
      cliente.activo 
        ? 'Cliente desactivado' 
        : 'Cliente reactivado'
    )
  }

  const handleFormSuccess = (message: string) => {
    setShowForm(false)
    setEditingCliente(null)
    toast.success(message)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCliente(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6" />
              Clientes
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{totalClientes} clientes total</span>
              <span className="text-success font-medium">{activeCount} activos</span>
              {inactiveCount > 0 && (
                <span className="text-muted-foreground">{inactiveCount} inactivos</span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleCreateCliente}
            className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                       rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {isMobile ? 'Nuevo' : 'Nuevo Cliente'}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div>
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por nombre, teléfono, email..."
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
                filterStatus === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
              <Users className="h-4 w-4" />
              Todos ({totalClientes})
            </button>
            
            <button
              onClick={() => setFilterStatus('active')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
                filterStatus === 'active'
                  ? 'bg-success text-success-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
              <UserCheck className="h-4 w-4" />
              Activos ({activeCount})
            </button>
            
            {inactiveCount > 0 && (
              <button
                onClick={() => setFilterStatus('inactive')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
                  filterStatus === 'inactive'
                    ? 'bg-muted-foreground text-muted-foreground-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                <UserX className="h-4 w-4" />
                Inactivos ({inactiveCount})
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {totalClientes > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="text-primary text-2xl font-bold">{totalClientes}</div>
              <div className="text-primary/80 text-sm">Total Clientes</div>
            </div>
            
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="text-success text-2xl font-bold">{activeCount}</div>
              <div className="text-success/80 text-sm">Clientes Activos</div>
            </div>
            
            <div className="bg-secondary border border-border rounded-lg p-3">
              <div className="text-foreground text-2xl font-bold">
                {clientes.filter(c => {
                  const daysSinceCreated = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  return daysSinceCreated <= 7 && c.activo
                }).length}
              </div>
              <div className="text-muted-foreground text-sm">Nuevos (7 días)</div>
            </div>
            
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="text-warning text-2xl font-bold">
                {clientes.filter(c => {
                  const daysSinceUpdate = (Date.now() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24)
                  return daysSinceUpdate > 30 && c.activo
                }).length}
              </div>
              <div className="text-warning/80 text-sm">Sin Actividad (30+ días)</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredClientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || filterStatus !== 'all' 
                ? 'No se encontraron clientes' 
                : 'No hay clientes registrados'
              }
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchQuery || filterStatus !== 'all'
                ? 'Intenta cambiar los filtros o términos de búsqueda'
                : 'Comienza agregando tu primer cliente para llevar un mejor control de tus ventas'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={handleCreateCliente}
                className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                           rounded-lg px-6 py-2 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Crear Primer Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredClientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onEdit={() => handleEditCliente(cliente)}
                onDelete={() => handleDeleteCliente(cliente)}
                onToggleStatus={() => handleToggleStatus(cliente)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}