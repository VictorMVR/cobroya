'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, Plus, Edit, X, CheckCircle } from 'lucide-react'
import { usePOSStore, useUIStore, useDeviceInfo } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartSummary } from '@/components/pos/CartSummary'
import { SearchBar } from '@/components/pos/SearchBar'
import { CategoryFilter } from '@/components/pos/CategoryFilter'
import { CartSheet } from '@/components/pos/CartSheet'

export default function POSPage() {
  const { isMobile } = useDeviceInfo()
  const { selectedCategory } = useUIStore()
  const { productos, currentCart, editingAccountId, editingAccountOriginal, cancelAccountEditing, cuentasAbiertas } = usePOSStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

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

    // Only show active products
    return filtered.filter(p => p.activo && p.stock > 0)
  }, [productos, searchQuery, selectedCategory])

  // Get the account being edited
  const editingAccount = editingAccountId 
    ? cuentasAbiertas.find(cuenta => cuenta.id === editingAccountId) || editingAccountOriginal
    : null

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main POS Area */}
      <div className="flex-1 flex flex-col">
        {/* Account Editing Banner */}
        {editingAccount && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-warning/20 rounded-lg">
                  <Edit className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">
                    Editando Cuenta: {editingAccount.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Los cambios se guardarán automáticamente al procesar pago o guardar cuenta
                  </p>
                </div>
              </div>
              <button
                onClick={cancelAccountEditing}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Cancelar edición"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Header with Search and Controls */}
        <div className="border-b border-border bg-card p-4 space-y-4">
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

        {/* Product Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          <ProductGrid 
            products={filteredProducts}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      {!isMobile && (
        <div className="w-80 border-l border-border bg-card">
          <CartSummary />
        </div>
      )}

      {/* Mobile Cart Sheet */}
      {isMobile && <CartSheet />}
    </div>
  )
}