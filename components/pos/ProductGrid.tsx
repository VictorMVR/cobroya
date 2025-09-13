'use client'

import { usePOSStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import { Plus, Package } from 'lucide-react'
import type { Producto } from '@/lib/types'
import Image from 'next/image'

interface ProductGridProps {
  products: Producto[]
  viewMode?: 'grid' | 'list'
}

export function ProductGrid({ products, viewMode = 'grid' }: ProductGridProps) {
  const { addProductToCart } = usePOSStore()

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No hay productos disponibles
        </h3>
        <p className="text-muted-foreground">
          No se encontraron productos que coincidan con tu búsqueda
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {products.map((producto) => (
          <ProductListItem 
            key={producto.id} 
            producto={producto}
            onAdd={() => addProductToCart(producto, 1)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((producto) => (
        <ProductCard 
          key={producto.id} 
          producto={producto}
          onAdd={() => addProductToCart(producto, 1)}
        />
      ))}
    </div>
  )
}

interface ProductCardProps {
  producto: Producto
  onAdd: () => void
}

function ProductCard({ producto, onAdd }: ProductCardProps) {
  return (
    <div className="card-mobile group relative overflow-hidden">
      {/* Product Image */}
      <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {/* Stock indicator */}
        {producto.stock <= 5 && (
          <div className="absolute top-2 left-2 bg-warning text-warning-foreground text-xs px-2 py-1 rounded">
            Stock: {producto.stock}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-medium text-sm line-clamp-2 text-foreground">
            {producto.nombre}
          </h3>
          <p className="text-xs text-muted-foreground">
            {producto.codigo}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            {formatCurrency(producto.precio_venta)}
          </div>
          
          <button
            onClick={onAdd}
            className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                       rounded-full p-2 tap-feedback transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={producto.stock === 0}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductListItem({ producto, onAdd }: ProductCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors">
      {/* Product Image */}
      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">
          {producto.nombre}
        </h3>
        <p className="text-sm text-muted-foreground">
          {producto.codigo} • Stock: {producto.stock}
        </p>
        <div className="text-lg font-bold text-primary mt-1">
          {formatCurrency(producto.precio_venta)}
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={onAdd}
        className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                   rounded-full p-3 tap-feedback transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        disabled={producto.stock === 0}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}