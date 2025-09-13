'use client'

import { useState, useEffect } from 'react'
import { useUIStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { Filter, X, Loader2 } from 'lucide-react'
import type { Categoria } from '@/lib/types'

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useUIStore()
  const [categories, setCategories] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load categories from API
  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categorias')
      const result = await response.json()
      
      if (response.ok) {
        setCategories(result.data || [])
      } else {
        console.error('Error loading categories:', result.error)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 pb-2">
        <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Categorías:</span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Categorías:</span>
      </div>

      {/* All products button */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={cn(
          'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors tap-feedback',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        Todos
      </button>

      {/* Category buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(
            selectedCategory === category.id ? null : category.id
          )}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors tap-feedback border',
            selectedCategory === category.id
              ? 'text-white border-transparent'
              : 'bg-background text-foreground border-border hover:bg-secondary'
          )}
          style={{
            backgroundColor: selectedCategory === category.id ? (category.color || '#6B7280') : undefined,
          }}
        >
          {category.nombre}
          {selectedCategory === category.id && (
            <X className="h-3 w-3 ml-1 inline" />
          )}
        </button>
      ))}
    </div>
  )
}