'use client'

import { Clock, User, DollarSign, Eye, Edit, CreditCard, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import type { Cuenta } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface CuentaCardProps {
  cuenta: Cuenta
  onViewDetails: () => void
  onContinueEditing: () => void
  onPayAccount: () => void
  onCancelAccount: () => void
}

export function CuentaCard({ 
  cuenta, 
  onViewDetails, 
  onContinueEditing, 
  onPayAccount, 
  onCancelAccount 
}: CuentaCardProps) {
  const hoursSinceCreated = (Date.now() - new Date(cuenta.created_at).getTime()) / (1000 * 60 * 60)
  const isOldAccount = hoursSinceCreated > 24
  const itemCount = (cuenta.items_cuenta || []).reduce((sum, item) => sum + (item.cantidad || 0), 0)

  return (
    <div className={cn(
      'bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200',
      isOldAccount ? 'border-warning/30 bg-warning/5' : 'border-border'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {cuenta.cliente_nombre || `Cuenta ${cuenta.id.slice(-8)}`}
            </h3>
            
            {cuenta.cliente_id && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                <span className="truncate">Cliente: {cuenta.cliente_id}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(cuenta.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
              {isOldAccount && (
                <AlertCircle className="h-3 w-3 text-warning ml-1" />
              )}
            </div>
          </div>

          <div className="text-right ml-3">
            <div className="text-xl font-bold text-primary">
              {formatCurrency(cuenta.total || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {itemCount} producto{itemCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Items Preview */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-muted-foreground">Productos:</h4>
          <div className="space-y-1">
            {(cuenta.items_cuenta || []).slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate flex-1">
                  {item.cantidad || 0}x {item.productos?.nombre || `Producto ${item.producto_id?.slice(-8) || 'N/A'}`}
                </span>
                <span className="text-muted-foreground ml-2">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
            
            {(cuenta.items_cuenta || []).length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{(cuenta.items_cuenta || []).length - 3} producto{(cuenta.items_cuenta || []).length - 3 !== 1 ? 's' : ''} más
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1 text-sm border-t border-border pt-3 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <span>{formatCurrency((cuenta as any).subtotal || cuenta.total)}</span>
          </div>
          
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(cuenta as any).descuento > 0 && (
            <div className="flex justify-between text-success">
              <span>Descuento:</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span>-{formatCurrency((cuenta as any).descuento)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impuestos:</span>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <span>{formatCurrency((cuenta as any).impuestos || 0)}</span>
          </div>
          
          <div className="flex justify-between font-semibold border-t border-border pt-1">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(cuenta.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onViewDetails}
            className="btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                       rounded-lg py-2 px-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </button>
          
          <button
            onClick={onContinueEditing}
            className="btn-touch bg-primary/10 text-primary hover:bg-primary/20 
                       rounded-lg py-2 px-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Continuar
          </button>
          
          <button
            onClick={onPayAccount}
            className="btn-touch bg-success text-success-foreground hover:bg-success/90 
                       rounded-lg py-2 px-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Cobrar
          </button>
          
          <button
            onClick={onCancelAccount}
            className="btn-touch bg-destructive/10 text-destructive hover:bg-destructive/20 
                       rounded-lg py-2 px-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        </div>

        {/* Age Warning */}
        {isOldAccount && (
          <div className="mt-3 bg-warning/10 border border-warning/20 rounded-lg p-2">
            <div className="flex items-center gap-2 text-warning text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>Cuenta antigua - considera contactar al cliente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}