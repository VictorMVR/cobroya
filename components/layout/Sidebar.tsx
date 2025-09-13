'use client'

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Users,
  ShoppingBag,
  Truck,
  Settings,
  BarChart3,
  X,
  ChevronLeft,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
  description?: string
}

const navigationSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      {
        href: '/admin',
        icon: LayoutDashboard,
        label: 'Dashboard',
        description: 'Vista general del negocio',
      },
      {
        href: '/pos',
        icon: ShoppingCart,
        label: 'Punto de Venta',
        description: 'Registrar ventas',
      },
    ],
  },
  {
    title: 'Ventas',
    items: [
      {
        href: '/cuentas',
        icon: Receipt,
        label: 'Cuentas',
        badge: 3,
        description: 'Cuentas abiertas y pagadas',
      },
      {
        href: '/clientes',
        icon: Users,
        label: 'Clientes',
        description: 'Gestionar clientes',
      },
    ],
  },
  {
    title: 'Inventario',
    items: [
      {
        href: '/productos',
        icon: Package,
        label: 'Productos',
        description: 'Catálogo de productos',
      },
      {
        href: '/categorias',
        icon: Tag,
        label: 'Categorías',
        description: 'Gestionar categorías',
      },
      {
        href: '/inventario',
        icon: BarChart3,
        label: 'Inventario',
        description: 'Control de stock',
      },
      {
        href: '/compras',
        icon: ShoppingBag,
        label: 'Compras',
        description: 'Compras a proveedores',
      },
      {
        href: '/proveedores',
        icon: Truck,
        label: 'Proveedores',
        description: 'Gestionar proveedores',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        href: '/configuracion',
        icon: Settings,
        label: 'Configuración',
        description: 'Ajustes del sistema',
      },
    ],
  },
]

export function Sidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-transform duration-200',
        'lg:relative lg:translate-x-0',
        collapsed ? 'w-16' : 'w-72',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-primary">CobroYa</h2>
                <span className="text-sm text-muted-foreground">POS</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:flex btn-touch p-2 rounded-lg hover:bg-secondary tap-feedback"
                  aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                >
                  <ChevronLeft className={cn(
                    'h-4 w-4 transition-transform',
                    collapsed ? 'rotate-180' : ''
                  )} />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="btn-touch p-2 rounded-lg hover:bg-secondary tap-feedback lg:hidden"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  {!collapsed && (
                    <h3 className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                  )}
                  
                  <div className="space-y-1 px-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || 
                        (item.href !== '/admin' && pathname.startsWith(item.href))
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            // Close mobile sidebar on navigation
                            if (window.innerWidth < 1024) {
                              onClose()
                            }
                          }}
                          className={cn(
                            'btn-touch flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            'tap-feedback relative group',
                            isActive 
                              ? 'bg-primary text-primary-foreground font-medium' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          
                          {!collapsed && (
                            <>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{item.label}</span>
                                  {item.badge && item.badge > 0 && (
                                    <span className={cn(
                                      'ml-2 px-2 py-0.5 text-xs rounded-full font-medium',
                                      isActive 
                                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                                        : 'bg-destructive text-destructive-foreground'
                                    )}>
                                      {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-current/70 truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </>
                          )}

                          {/* Tooltip for collapsed state */}
                          {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground 
                                          text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 
                                          transition-opacity pointer-events-none z-50 whitespace-nowrap">
                              {item.label}
                              {item.badge && item.badge > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-destructive text-destructive-foreground 
                                               text-xs rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!collapsed ? (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Mi Tiendita • v1.0.0
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="h-2 w-2 rounded-full bg-success"></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}