'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Filter, Grid, List, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { usePOSStore, useUIStore, useDeviceInfo } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductForm } from '@/components/products/ProductForm'
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog'
import { SearchBar } from '@/components/pos/SearchBar'
import { CategoryFilter } from '@/components/pos/CategoryFilter'
import type { Producto } from '@/lib/types'

export default function ProductosPage() {
  const { isMobile } = useDeviceInfo()
  const { selectedCategory } = useUIStore()
  const { productos, addProducto, updateProducto, setProductos } = usePOSStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = productos

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        p => 
          p.nombre.toLowerCase().includes(query) ||
          p.codigo.toLowerCase().includes(query) ||
          p.descripcion?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoria_id === selectedCategory)
    }

    return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [productos, searchQuery, selectedCategory])

  const handleEditProduct = (product: Producto) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = (product: Producto) => {
    setProductToDelete(product)
  }

  const handleSaveProduct = (productData: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      // Update existing product
      const updatedProduct: Producto = {
        ...editingProduct,
        ...productData,
        updated_at: new Date().toISOString(),
      }
      updateProducto(updatedProduct)
    } else {
      // Add new product
      const newProduct: Producto = {
        ...productData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addProducto(newProduct)
    }

    setShowForm(false)
    setEditingProduct(null)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      const updatedProducts = productos.filter(p => p.id !== productToDelete.id)
      setProductos(updatedProducts)
      setProductToDelete(null)
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const lowStockCount = productos.filter(p => p.stock <= 5 && p.activo).length
  const inactiveCount = productos.filter(p => !p.activo).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{productos.length} productos totales</span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {lowStockCount} con stock bajo
                </span>
              )}
              {inactiveCount > 0 && (
                <span className="text-muted-foreground">
                  {inactiveCount} inactivos
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleNewProduct}
            className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                       rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {!isMobile && 'Nuevo Producto'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar productos por nombre, código..."
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

        {/* Category Filter */}
        <CategoryFilter />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || selectedCategory ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto al inventario'
              }
            </p>
            {!searchQuery && !selectedCategory && (
              <button
                onClick={handleNewProduct}
                className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                           rounded-lg px-6 py-2 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Primer Producto
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
            {filteredProducts.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                viewMode={viewMode}
                onEdit={() => handleEditProduct(producto)}
                onDelete={() => handleDeleteProduct(producto)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <DeleteProductDialog
          product={productToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </div>
  )
}