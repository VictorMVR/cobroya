'use client'

import { useState, useEffect, useMemo } from 'react'
import { Users, Plus, Loader2 } from 'lucide-react'
import { useDeviceInfo, useToast } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/pos/SearchBar'
import { ClienteCard } from '@/components/clientes/ClienteCard'
import { ClienteForm } from '@/components/clientes/ClienteForm'
import type { Cliente } from '@/lib/types'

export default function ClientesPage() {
  const { isMobile } = useDeviceInfo()
  const toast = useToast()
  
  // State for clients management
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load clients from API
  const loadClientes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clientes')
      const result = await response.json()
      
      if (response.ok) {
        setClientes(result.data || [])
      } else {
        console.error('Error loading clientes:', result.error)
        toast.error('Error al cargar clientes')
      }
    } catch (error) {
      console.error('Error loading clientes:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  // Load clients on component mount
  useEffect(() => {
    loadClientes()
  }, [])

  // Filter clients based on search (removed status filter since we don't have activo field)
  const filteredClientes = useMemo(() => {
    let filtered = clientes

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cliente => 
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.telefono?.toLowerCase().includes(query) ||
        cliente.email?.toLowerCase().includes(query)
      )
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [clientes, searchQuery])

  // Calculate metrics
  const totalClientes = clientes.length
  const activeCount = clientes.length // All clients are considered active since we don't have activo field
  const inactiveCount = 0

  const handleCreateCliente = () => {
    setEditingCliente(null)
    setShowForm(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${cliente.nombre}?`)) {
      try {
        const response = await fetch(`/api/clientes/${cliente.id}`, {
          method: 'DELETE',
        })

        const result = await response.json()
        
        if (response.ok) {
          // Remove cliente from local state
          setClientes(prev => prev.filter(c => c.id !== cliente.id))
          toast.success('Cliente eliminado correctamente')
        } else {
          console.error('Error deleting cliente:', result.error)
          toast.error('Error al eliminar el cliente: ' + result.error)
        }
      } catch (error) {
        console.error('Error deleting cliente:', error)
        toast.error('Error al eliminar el cliente')
      }
    }
  }

  const handleSaveCliente = async (clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true)
      
      if (editingCliente) {
        // Update existing cliente
        const response = await fetch(`/api/clientes/${editingCliente.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clienteData),
        })

        const result = await response.json()
        
        if (response.ok) {
          // Update cliente in local state
          setClientes(prev => prev.map(c => 
            c.id === editingCliente.id ? result.data : c
          ))
          toast.success('Cliente actualizado correctamente')
        } else {
          console.error('Error updating cliente:', result.error)
          toast.error('Error al actualizar el cliente: ' + result.error)
          return
        }
      } else {
        // Create new cliente
        const response = await fetch('/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clienteData),
        })

        const result = await response.json()
        
        if (response.ok) {
          // Add new cliente to local state
          setClientes(prev => [...prev, result.data])
          toast.success('Cliente creado correctamente')
        } else {
          console.error('Error creating cliente:', result.error)
          toast.error('Error al crear el cliente: ' + result.error)
          return
        }
      }

      setShowForm(false)
      setEditingCliente(null)
    } catch (error) {
      console.error('Error saving cliente:', error)
      toast.error('Error al guardar el cliente')
    } finally {
      setIsSubmitting(false)
    }
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
              <span>{totalClientes} clientes registrados</span>
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

        {/* Search */}
        <div>
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre, teléfono, email..."
          />
        </div>

        {/* Quick Stats */}
        {totalClientes > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="text-primary text-2xl font-bold">{totalClientes}</div>
              <div className="text-primary/80 text-sm">Total Clientes</div>
            </div>
            
            <div className="bg-secondary border border-border rounded-lg p-3">
              <div className="text-foreground text-2xl font-bold">
                {clientes.filter(c => {
                  const daysSinceCreated = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  return daysSinceCreated <= 7
                }).length}
              </div>
              <div className="text-muted-foreground text-sm">Nuevos (7 días)</div>
            </div>
            
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="text-success text-2xl font-bold">
                {clientes.filter(c => c.telefono && c.telefono.trim() !== '').length}
              </div>
              <div className="text-success/80 text-sm">Con Teléfono</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Cargando clientes...
            </h3>
            <p className="text-muted-foreground">
              Por favor espera mientras cargamos los clientes desde la base de datos
            </p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery 
                ? 'No se encontraron clientes' 
                : 'No hay clientes registrados'
              }
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchQuery
                ? 'Intenta cambiar los términos de búsqueda'
                : 'Comienza agregando tu primer cliente para llevar un mejor control de tus ventas'
              }
            </p>
            {!searchQuery && (
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onSave={handleSaveCliente}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}