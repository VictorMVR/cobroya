'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tag, Plus, Grid, List, Edit, Trash2, Palette, Loader2 } from 'lucide-react'
import { useDeviceInfo } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/pos/SearchBar'
import { CategoriaCard } from '@/components/categorias/CategoriaCard'
import { CategoriaForm } from '@/components/categorias/CategoriaForm'
import { DeleteCategoriaDialog } from '@/components/categorias/DeleteCategoriaDialog'
import type { Categoria } from '@/lib/types'

export default function CategoriasPage() {
  const { isMobile } = useDeviceInfo()
  
  // State for categories management
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load categories from API
  const loadCategorias = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categorias')
      const result = await response.json()
      
      if (response.ok) {
        setCategorias(result.data || [])
      } else {
        console.error('Error loading categorias:', result.error)
      }
    } catch (error) {
      console.error('Error loading categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load categories on component mount
  useEffect(() => {
    loadCategorias()
  }, [])

  // Filter categories based on search
  const filteredCategorias = useMemo(() => {
    let filtered = categorias

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        c => c.nombre.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => (a.orden || 0) - (b.orden || 0))
  }, [categorias, searchQuery])

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setShowForm(true)
  }

  const handleDeleteCategoria = (categoria: Categoria) => {
    setCategoriaToDelete(categoria)
  }

  const handleSaveCategoria = async (categoriaData: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true)
      
      if (editingCategoria) {
        // Update existing categoria
        const response = await fetch(`/api/categorias/${editingCategoria.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoriaData),
        })

        const result = await response.json()
        
        if (response.ok) {
          // Update categoria in local state
          setCategorias(prev => prev.map(c => 
            c.id === editingCategoria.id ? result.data : c
          ))
        } else {
          console.error('Error updating categoria:', result.error)
          alert('Error al actualizar la categoría: ' + result.error)
          return
        }
      } else {
        // Create new categoria
        const response = await fetch('/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoriaData),
        })

        const result = await response.json()
        
        if (response.ok) {
          // Add new categoria to local state
          setCategorias(prev => [...prev, result.data])
        } else {
          console.error('Error creating categoria:', result.error)
          alert('Error al crear la categoría: ' + result.error)
          return
        }
      }

      setShowForm(false)
      setEditingCategoria(null)
    } catch (error) {
      console.error('Error saving categoria:', error)
      alert('Error al guardar la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return

    try {
      const response = await fetch(`/api/categorias/${categoriaToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (response.ok) {
        // Remove categoria from local state
        setCategorias(prev => prev.filter(c => c.id !== categoriaToDelete.id))
        setCategoriaToDelete(null)
      } else {
        console.error('Error deleting categoria:', result.error)
        alert('Error al eliminar la categoría: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting categoria:', error)
      alert('Error al eliminar la categoría')
    }
  }

  const handleNewCategoria = () => {
    setEditingCategoria(null)
    setShowForm(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{categorias.length} categorías totales</span>
            </div>
          </div>
          
          <button
            onClick={handleNewCategoria}
            className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                       rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {!isMobile && 'Nueva Categoría'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar categorías por nombre..."
            />
          </div>
          
          {/* View Mode Toggle (Desktop) */}
          {!isMobile && (
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-l-lg transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-r-lg transition-colors',
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Cargando categorías...
            </h3>
            <p className="text-muted-foreground">
              Por favor espera mientras cargamos las categorías desde la base de datos
            </p>
          </div>
        ) : filteredCategorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Tag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No se encontraron categorías' : 'No hay categorías'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Comienza agregando tu primera categoría para organizar productos'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleNewCategoria}
                className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                           rounded-lg px-6 py-2 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Primera Categoría
              </button>
            )}
          </div>
        ) : (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}>
            {filteredCategorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                viewMode={viewMode}
                onEdit={() => handleEditCategoria(categoria)}
                onDelete={() => handleDeleteCategoria(categoria)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Categoria Form Modal */}
      {showForm && (
        <CategoriaForm
          categoria={editingCategoria}
          onSave={handleSaveCategoria}
          onCancel={() => {
            setShowForm(false)
            setEditingCategoria(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {categoriaToDelete && (
        <DeleteCategoriaDialog
          categoria={categoriaToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setCategoriaToDelete(null)}
        />
      )}
    </div>
  )
}