'use client'

import { Menu, Search, User, Bell } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuClick, showMenuButton = true }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="safe-top sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu and title */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="btn-touch p-2 rounded-lg hover:bg-secondary tap-feedback lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              CobroYa
            </h1>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              • Mi Tiendita
            </span>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-no-zoom w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-input 
                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                       placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right side - Actions and user */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile */}
          <button className="btn-touch p-2 rounded-lg hover:bg-secondary tap-feedback md:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="btn-touch p-2 rounded-lg hover:bg-secondary tap-feedback relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground 
                           text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {/* User menu */}
          <div className="flex items-center gap-2 ml-2">
            <button className="btn-touch flex items-center gap-2 p-2 rounded-lg hover:bg-secondary tap-feedback">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground 
                            flex items-center justify-center text-sm font-medium">
                U
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">Usuario</p>
                <p className="text-xs text-muted-foreground">Vendedor</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-no-zoom w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input 
                     focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                     placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </header>
  )
}