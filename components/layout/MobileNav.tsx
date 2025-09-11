'use client'

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Users,
  MoreHorizontal 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useCartItems, useSheet } from '@/lib/stores'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    icon: LayoutDashboard,
    label: 'Inicio',
  },
  {
    href: '/pos',
    icon: ShoppingCart,
    label: 'Venta',
  },
  {
    href: '/cuentas',
    icon: Receipt,
    label: 'Cuentas',
    badge: 3, // Example: 3 open accounts
  },
  {
    href: '/productos',
    icon: Package,
    label: 'Productos',
  },
  {
    href: '/menu',
    icon: MoreHorizontal,
    label: 'Más',
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const cartItems = useCartItems()
  const { open } = useSheet()

  const showCartButton = pathname === '/pos'
  const cartItemCount = cartItems.length

  return (
    <>
      <nav className="nav-thumb fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'btn-touch flex flex-col items-center justify-center py-2 px-1 relative',
                  'tap-feedback transition-colors rounded-lg mx-1 my-1',
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive text-destructive-foreground 
                                   text-xs rounded-full flex items-center justify-center min-w-[16px]">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-xs mt-1 text-center leading-tight',
                  isActive ? 'font-medium' : 'font-normal'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Floating Cart Button (only on POS page) */}
      {showCartButton && (
        <button
          onClick={() => open('cart')}
          className={cn(
            'fixed bottom-20 right-4 z-50 btn-touch',
            'bg-primary text-primary-foreground shadow-lg rounded-full',
            'w-14 h-14 flex items-center justify-center',
            'tap-feedback transition-all duration-200',
            'border-4 border-background lg:hidden',
            cartItemCount > 0 
              ? 'scale-100 opacity-100' 
              : 'scale-90 opacity-75'
          )}
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-success text-success-foreground 
                             text-xs rounded-full flex items-center justify-center min-w-[20px] font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
        </button>
      )}
    </>
  )
}

// Hook to get navigation height for content padding
export function useMobileNavHeight() {
  return 'pb-20 lg:pb-0'
}