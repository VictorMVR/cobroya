'use client'

import { Edit, Trash2, Package, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import type { Producto } from '@/lib/types'
import Image from 'next/image'

interface ProductCardProps {
  producto: Producto
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onDelete: () => void
}

export function ProductCard({ producto, viewMode, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = producto.stock <= 5
  const isOutOfStock = producto.stock === 0

  if (viewMode === 'list') {
    return (
      <div className={cn(
        'flex items-center gap-4 p-4 bg-card border border-border rounded-lg',
        'hover:bg-secondary/50 transition-colors',
        !producto.activo && 'opacity-60'
      )}>
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
          
          {!producto.activo && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <EyeOff className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-medium truncate',
                !producto.activo && 'text-muted-foreground'
              )}>
                {producto.nombre}
              </h3>
              <p className="text-sm text-muted-foreground">
                {producto.codigo}
              </p>
              {producto.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {producto.descripcion}
                </p>
              )}
            </div>

            <div className="text-right ml-4">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(producto.precio_venta)}
              </div>
              
              <div className={cn(
                'text-sm font-medium',
                isOutOfStock ? 'text-destructive' :
                isLowStock ? 'text-warning' : 'text-muted-foreground'
              )}>
                Stock: {producto.stock}
              </div>

              {!producto.activo && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Inactivo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg overflow-hidden',
      'hover:shadow-md transition-all duration-200',
      !producto.activo && 'opacity-60'
    )}>
      {/* Product Image */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-2 left-2 flex gap-2">
          {isLowStock && (
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              isOutOfStock 
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-warning text-warning-foreground'
            )}>
              {isOutOfStock ? 'Sin stock' : 'Stock bajo'}
            </div>
          )}
          
          {!producto.activo && (
            <div className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
              Inactivo
            </div>
          )}
        </div>

        {/* Actions Overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 bg-background/80 backdrop-blur-sm hover:bg-background rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {!producto.activo && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <EyeOff className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 group">
        <div className="space-y-2">
          <div>
            <h3 className={cn(
              'font-medium line-clamp-2 text-sm',
              !producto.activo && 'text-muted-foreground'
            )}>
              {producto.nombre}
            </h3>
            <p className="text-xs text-muted-foreground">
              {producto.codigo}
            </p>
          </div>

          {producto.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {producto.descripcion}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(producto.precio_venta)}
            </div>
            
            <div className={cn(
              'text-sm font-medium',
              isOutOfStock ? 'text-destructive' :
              isLowStock ? 'text-warning' : 'text-muted-foreground'
            )}>
              {producto.stock}
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex gap-2 mt-3 md:hidden">
          <button
            onClick={onEdit}
            className="flex-1 btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                       rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="btn-touch bg-destructive/10 text-destructive hover:bg-destructive/20 
                       rounded-lg p-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}