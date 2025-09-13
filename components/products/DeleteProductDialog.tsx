'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import type { Producto } from '@/lib/types'

interface DeleteProductDialogProps {
  product: Producto
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteProductDialog({ product, onConfirm, onCancel }: DeleteProductDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">Eliminar Producto</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
          </p>

          {/* Product Summary */}
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Producto:</span>
                <span className="font-medium">{product.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Código:</span>
                <span className="font-mono text-sm">{product.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precio:</span>
                <span className="font-medium text-primary">
                  {formatCurrency(product.precio_venta)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock:</span>
                <span className={cn(
                  'font-medium',
                  product.stock === 0 ? 'text-destructive' :
                  product.stock <= 5 ? 'text-warning' : 'text-foreground'
                )}>
                  {product.stock} unidades
                </span>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          {product.stock > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Producto con stock disponible</p>
                  <p className="text-warning/80">
                    Este producto tiene {product.stock} unidades en stock. Al eliminarlo, 
                    se perderá toda la información de inventario.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Eliminación permanente</p>
                <p className="text-destructive/80">
                  Una vez eliminado, no podrás recuperar este producto ni su historial de ventas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onCancel}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn-touch bg-destructive text-destructive-foreground hover:bg-destructive/90 
                       px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Producto
          </button>
        </div>
      </div>
    </div>
  )
}