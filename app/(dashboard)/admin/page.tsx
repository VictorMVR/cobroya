'use client'

import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  Calendar,
  Clock,
  Receipt
} from 'lucide-react'
import Link from 'next/link'

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  return (
    <div className="card-mobile p-4 tap-feedback hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm ${
            changeType === 'positive' ? 'text-success' : 
            changeType === 'negative' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {change}
          </p>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'secondary'
}

function QuickAction({ title, description, href, icon: Icon, color }: QuickActionProps) {
  const colorClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  }

  return (
    <Link href={href}>
      <div className="card-mobile p-4 tap-feedback hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color]} 
                         group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{today}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Resumen del Día</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Ventas Hoy"
            value="$2,450"
            change="+12% vs ayer"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Transacciones"
            value="48"
            change="+8% vs ayer"
            changeType="positive"
            icon={ShoppingCart}
          />
          <MetricCard
            title="Clientes"
            value="32"
            change="+5% vs ayer"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Productos"
            value="156"
            change="2 con stock bajo"
            changeType="neutral"
            icon={Package}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="Nueva Venta"
            description="Abrir punto de venta"
            href="/pos"
            icon={ShoppingCart}
            color="success"
          />
          <QuickAction
            title="Ver Cuentas"
            description="3 cuentas abiertas"
            href="/cuentas"
            icon={Receipt}
            color="warning"
          />
          <QuickAction
            title="Productos"
            description="Gestionar inventario"
            href="/productos"
            icon={Package}
            color="primary"
          />
          <QuickAction
            title="Reportes"
            description="Ver estadísticas"
            href="/reportes"
            icon={TrendingUp}
            color="secondary"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
        <div className="card-mobile">
          <div className="p-4 space-y-4">
            {[
              { time: '14:32', action: 'Venta completada', amount: '$125.50', customer: 'Cliente General' },
              { time: '14:15', action: 'Producto agregado', amount: '', customer: 'Coca Cola 600ml' },
              { time: '13:58', action: 'Venta completada', amount: '$89.00', customer: 'María González' },
              { time: '13:45', action: 'Cuenta abierta', amount: '$234.00', customer: 'Juan Pérez' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                  {activity.amount && (
                    <p className="font-medium text-success">{activity.amount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ventas de la Semana</h2>
        <div className="card-mobile p-6">
          <div className="h-48 bg-secondary/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Gráfico de ventas próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}