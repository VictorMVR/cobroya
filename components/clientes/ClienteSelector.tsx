'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, User, Phone, Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClienteStore } from '@/lib/stores'
import type { Cliente } from '@/lib/types'

interface ClienteSelectorProps {
  value: Cliente | null
  onChange: (cliente: Cliente | null) => void
  placeholder?: string
  disabled?: boolean
  onCreateNew?: () => void
  className?: string
}

export function ClienteSelector({
  value,
  onChange,
  placeholder = "Buscar cliente...",
  disabled = false,
  onCreateNew,
  className
}: ClienteSelectorProps) {
  const { clientes, loadClientes, getActiveClientes, isLoading } = useClienteStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load clientes when component mounts
  useEffect(() => {
    if (clientes.length === 0) {
      loadClientes()
    }
  }, [clientes.length, loadClientes])

  const activeClientes = useMemo(() => getActiveClientes(), [clientes])

  // Filter clients based on search
  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return activeClientes

    const query = searchQuery.toLowerCase()
    return activeClientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(query) ||
      cliente.telefono?.toLowerCase().includes(query) ||
      cliente.email?.toLowerCase().includes(query)
    )
  }, [activeClientes, searchQuery])

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectClient = (cliente: Cliente) => {
    onChange(cliente)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClearSelection = () => {
    onChange(null)
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const displayValue = value 
    ? `${value.nombre}${value.telefono ? ` (${value.telefono})` : ''}`
    : ''

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'input-no-zoom w-full pl-10 pr-12 py-2 border border-border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'placeholder:text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-secondary rounded"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          {/* Results */}
          <div className="max-h-48 overflow-y-auto">
            {filteredClientes.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-3">
                  {searchQuery ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
                </div>
                {onCreateNew && searchQuery && (
                  <button
                    onClick={() => {
                      onCreateNew()
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className="btn-touch bg-primary text-primary-foreground hover:bg-primary/90 
                             rounded-lg px-4 py-2 flex items-center gap-2 transition-colors text-sm mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Cliente
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredClientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => handleSelectClient(cliente)}
                    className="w-full text-left p-3 hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>

                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {cliente.nombre}
                      </div>
                      {cliente.telefono && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {cliente.telefono}
                        </div>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {value?.id === cliente.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Create new client option */}
          {onCreateNew && filteredClientes.length > 0 && (
            <>
              <div className="border-t border-border" />
              <button
                onClick={() => {
                  onCreateNew()
                  setIsOpen(false)
                  setSearchQuery('')
                }}
                className="w-full text-left p-3 hover:bg-secondary transition-colors flex items-center gap-3 text-primary"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium">
                  Crear nuevo cliente
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}