'use client'

import { useState } from 'react'
import { X, CreditCard, DollarSign, Smartphone, Calculator, Receipt, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/money'
import type { Cuenta, Payment, PaymentMethod } from '@/lib/types'

interface PaymentModalProps {
  cuenta: Cuenta
  onClose: () => void
  onPaymentComplete: () => void
}

const paymentMethods: { method: PaymentMethod; icon: React.ReactNode; label: string }[] = [
  { method: 'efectivo', icon: <DollarSign className="h-5 w-5" />, label: 'Efectivo' },
  { method: 'tarjeta', icon: <CreditCard className="h-5 w-5" />, label: 'Tarjeta' },
  { method: 'transferencia', icon: <Smartphone className="h-5 w-5" />, label: 'Transferencia' },
]

export function PaymentModal({ cuenta, onClose, onPaymentComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('efectivo')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const totalPagado = payments.reduce((sum, payment) => sum + payment.cantidad, 0)
  const restante = cuenta.total - totalPagado
  const cambio = totalPagado > cuenta.total ? totalPagado - cuenta.total : 0

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount)
    if (amount <= 0 || isNaN(amount)) return

    const newPayment: Payment = {
      metodo: selectedMethod,
      cantidad: amount,
      referencia: selectedMethod !== 'efectivo' ? `${selectedMethod.toUpperCase()}-${Date.now()}` : undefined
    }

    setPayments([...payments, newPayment])
    setPaymentAmount('')
  }

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const handleQuickAmount = (amount: number) => {
    setPaymentAmount(amount.toString())
  }

  const handleProcessPayment = async () => {
    if (restante > 0) return

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setShowSuccess(true)
      
      // Complete payment after showing success
      setTimeout(() => {
        onPaymentComplete()
      }, 2000)
    } catch (error) {
      console.error('Payment processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const quickAmounts = [
    { label: 'Exacto', amount: cuenta.total },
    { label: '$50', amount: 50 },
    { label: '$100', amount: 100 },
    { label: '$200', amount: 200 },
    { label: '$500', amount: 500 },
    { label: '$1000', amount: 1000 },
  ]

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">¡Pago Exitoso!</h2>
          <p className="text-muted-foreground mb-4">
            La cuenta "{cuenta.nombre}" ha sido pagada correctamente
          </p>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(cuenta.total)}
          </div>
          {cambio > 0 && (
            <div className="mt-2 text-lg text-muted-foreground">
              Cambio: <span className="font-semibold text-warning">{formatCurrency(cambio)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Procesar Pago</h2>
            <p className="text-sm text-muted-foreground">{cuenta.nombre}</p>
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
            {/* Payment Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(cuenta.total)}</div>
                  <div className="text-sm text-muted-foreground">Total a Pagar</div>
                </div>
                <div>
                  <div className={cn(
                    'text-2xl font-bold',
                    restante > 0 ? 'text-warning' : 'text-success'
                  )}>
                    {formatCurrency(restante)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {restante > 0 ? 'Restante' : 'Pagado'}
                  </div>
                </div>
              </div>
              
              {cambio > 0 && (
                <div className="text-center mt-4 pt-4 border-t border-primary/20">
                  <div className="text-xl font-bold text-warning">{formatCurrency(cambio)}</div>
                  <div className="text-sm text-muted-foreground">Cambio a Entregar</div>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Método de Pago</h3>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map(({ method, icon, label }) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={cn(
                      'p-4 rounded-lg border transition-colors flex flex-col items-center gap-2',
                      selectedMethod === method
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border hover:bg-secondary'
                    )}
                  >
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Cantidad a Pagar</h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-no-zoom flex-1 px-3 py-2 border border-border rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="0.00"
                />
                <button
                  onClick={handleAddPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                           px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map(({ label, amount }) => (
                  <button
                    key={label}
                    onClick={() => handleQuickAmount(amount)}
                    className="btn-touch bg-secondary text-secondary-foreground hover:bg-secondary/80 
                             px-3 py-2 rounded text-sm transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment List */}
            {payments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">Pagos Registrados</h3>
                <div className="space-y-2">
                  {payments.map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {paymentMethods.find(m => m.method === payment.metodo)?.icon}
                        <span className="font-medium capitalize">{payment.metodo}</span>
                        {payment.referencia && (
                          <span className="text-xs text-muted-foreground">
                            {payment.referencia}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatCurrency(payment.cantidad)}</span>
                        <button
                          onClick={() => handleRemovePayment(index)}
                          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="btn-touch px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleProcessPayment}
            disabled={restante > 0 || isProcessing}
            className={cn(
              'btn-touch px-6 py-2 rounded-lg flex items-center gap-2 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              restante > 0
                ? 'bg-muted text-muted-foreground'
                : 'bg-success text-success-foreground hover:bg-success/90'
            )}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                {restante > 0 ? `Faltan ${formatCurrency(restante)}` : 'Completar Pago'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}