'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { X, Clock, User, Edit, CreditCard, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import type { Cuenta } from '@/lib/types'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CuentaDetailModalProps {
  cuenta: Cuenta
  onClose: () => void
  onContinueEditing: () => void
  onPayAccount: () => void
}

export function CuentaDetailModal({ 
  cuenta, 
  onClose, 
  onContinueEditing, 
  onPayAccount 
}: CuentaDetailModalProps) {
  const itemCount = (cuenta as any).items?.reduce((sum: any, item: any) => sum + item.cantidad, 0) || 0
  const createdDate = new Date(cuenta.created_at)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              Detalles de Cuenta
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {(cuenta as any).cliente_nombre || 'Sin cliente'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre de la Cuenta</label>
                  <p className="text-foreground font-medium">{cuenta.nombre}</p>
                </div>

                {cuenta.cliente && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Cliente
                    </label>
                    <p className="text-foreground font-medium">{cuenta.cliente.nombre}</p>
                    {cuenta.cliente.telefono && (
                      <p className="text-sm text-muted-foreground">{cuenta.cliente.telefono}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <span className={cn(
                    'inline-block px-2 py-1 rounded text-xs font-medium mt-1',
                    cuenta.estado === 'abierta' && 'bg-warning/10 text-warning border border-warning/20',
                    cuenta.estado === 'pagada' && 'bg-success/10 text-success border border-success/20',
                    cuenta.estado === 'cancelada' && 'bg-destructive/10 text-destructive border border-destructive/20'
                  )}>
                    {cuenta.estado === 'abierta' && 'Abierta'}
                    {cuenta.estado === 'pagada' && 'Pagada'}
                    {cuenta.estado === 'cancelada' && 'Cancelada'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Fecha de Creación
                  </label>
                  <p className="text-foreground font-medium">
                    {format(createdDate, 'PPP', { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(createdDate, 'p', { locale: es })} • {' '}
                    {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total de Productos</label>
                  <p className="text-foreground font-medium">
                    {itemCount} producto{itemCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total a Pagar</label>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(cuenta.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos en la Cuenta
              </h3>
              
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-6">Producto</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-right">Precio Unit.</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>
                
                <div className="divide-y divide-border">
                  {cuenta.items.map((item, index) => (
                    <div key={index} className="px-4 py-3 grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-6">
                        <p className="font-medium text-foreground">{item.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">{item.producto.codigo}</p>
                      </div>
                      <div className="col-span-2 text-center font-medium">
                        {item.cantidad}
                      </div>
                      <div className="col-span-2 text-right text-muted-foreground">
                        {formatCurrency(item.precio_unitario)}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-3">Resumen</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground">{formatCurrency(cuenta.subtotal)}</span>
                </div>
                
                {cuenta.descuento > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Descuento:</span>
                    <span>-{formatCurrency(cuenta.descuento)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos (16%):</span>
                  <span className="text-foreground">{formatCurrency(cuenta.impuestos)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span className="text-foreground">Total:</span>
                  <span className="text-primary">{formatCurrency(cuenta.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cerrar
          </button>
          
          <button
            onClick={onContinueEditing}
            className="btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                       px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Continuar Editando
          </button>
          
          <button
            onClick={onPayAccount}
            className="btn-touch bg-success text-success-foreground hover:bg-success/90 
                       px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Procesar Pago
          </button>
        </div>
      </div>
    </div>
  )
}