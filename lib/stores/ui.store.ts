import { create } from 'zustand'
import type { Notification } from '@/lib/types'

interface UIState {
  // Sidebar state (desktop)
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Active bottom sheet (mobile)
  activeSheet: 'cart' | 'payment' | 'customer' | 'product-details' | null
  
  // Global loading state
  loading: boolean
  
  // Search functionality
  searchQuery: string
  searchResults: any[]
  
  // Category filter
  selectedCategory: string | null
  
  // Notifications
  notifications: Notification[]
  
  // Modal state
  activeModal: string | null
  modalData: any
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Device info (updated from useEffect)
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Actions - Sidebar
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapse: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Actions - Bottom Sheets
  openSheet: (sheet: UIState['activeSheet']) => void
  closeSheet: () => void
  
  // Actions - Loading
  setLoading: (loading: boolean) => void
  
  // Actions - Search
  setSearchQuery: (query: string) => void
  setSearchResults: (results: any[]) => void
  clearSearch: () => void
  
  // Actions - Category
  setSelectedCategory: (category: string | null) => void
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Actions - Modal
  openModal: (modalId: string, data?: any) => void
  closeModal: () => void
  
  // Actions - Theme
  setTheme: (theme: UIState['theme']) => void
  
  // Actions - Device
  setDeviceInfo: (info: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  sidebarOpen: false,
  sidebarCollapsed: false,
  activeSheet: null,
  loading: false,
  searchQuery: '',
  searchResults: [],
  selectedCategory: null,
  notifications: [],
  activeModal: null,
  modalData: null,
  theme: 'system',
  isMobile: false,
  isTablet: false,
  isDesktop: true,

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },

  toggleSidebarCollapse: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed })
  },

  // Bottom sheet actions
  openSheet: (sheet: UIState['activeSheet']) => {
    set({ activeSheet: sheet })
  },

  closeSheet: () => {
    set({ activeSheet: null })
  },

  // Loading actions
  setLoading: (loading: boolean) => {
    set({ loading })
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setSearchResults: (results: any[]) => {
    set({ searchResults: results })
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [] })
  },

  // Category actions
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category })
  },

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))

    // Auto remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id)
      }, duration)
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Modal actions
  openModal: (modalId: string, data?: any) => {
    set({ activeModal: modalId, modalData: data })
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null })
  },

  // Theme actions
  setTheme: (theme: UIState['theme']) => {
    set({ theme })
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        // System theme - check OS preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }
  },

  // Device actions
  setDeviceInfo: (info: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }) => {
    set({
      isMobile: info.isMobile,
      isTablet: info.isTablet,
      isDesktop: info.isDesktop,
    })
  },
}))

// Helper hooks for common UI patterns
export const useSidebar = () => {
  const isOpen = useUIStore((state) => state.sidebarOpen)
  const isCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggle = useUIStore((state) => state.toggleSidebar)
  const setOpen = useUIStore((state) => state.setSidebarOpen)
  const toggleCollapse = useUIStore((state) => state.toggleSidebarCollapse)
  const setCollapsed = useUIStore((state) => state.setSidebarCollapsed)
  
  return { isOpen, isCollapsed, toggle, setOpen, toggleCollapse, setCollapsed }
}

export const useSheet = () => {
  const activeSheet = useUIStore((state) => state.activeSheet)
  const open = useUIStore((state) => state.openSheet)
  const close = useUIStore((state) => state.closeSheet)
  
  return { activeSheet, open, close }
}

export const useSearch = () => {
  const query = useUIStore((state) => state.searchQuery)
  const results = useUIStore((state) => state.searchResults)
  const setQuery = useUIStore((state) => state.setSearchQuery)
  const setResults = useUIStore((state) => state.setSearchResults)
  const clear = useUIStore((state) => state.clearSearch)
  
  return { query, results, setQuery, setResults, clear }
}

export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications)
  const add = useUIStore((state) => state.addNotification)
  const remove = useUIStore((state) => state.removeNotification)
  const clear = useUIStore((state) => state.clearNotifications)
  
  return { notifications, add, remove, clear }
}

export const useModal = () => {
  const activeModal = useUIStore((state) => state.activeModal)
  const modalData = useUIStore((state) => state.modalData)
  const open = useUIStore((state) => state.openModal)
  const close = useUIStore((state) => state.closeModal)
  
  return { activeModal, modalData, open, close }
}

export const useDeviceInfo = () => {
  const isMobile = useUIStore((state) => state.isMobile)
  const isTablet = useUIStore((state) => state.isTablet)
  const isDesktop = useUIStore((state) => state.isDesktop)
  
  return { isMobile, isTablet, isDesktop }
}

// Notification helpers
export const useNotify = () => {
  const addNotification = useUIStore((state) => state.addNotification)
  
  return {
    success: (title: string, message: string) => 
      addNotification({ type: 'success', title, message }),
    
    error: (title: string, message: string) => 
      addNotification({ type: 'error', title, message }),
    
    warning: (title: string, message: string) => 
      addNotification({ type: 'warning', title, message }),
    
    info: (title: string, message: string) => 
      addNotification({ type: 'info', title, message }),
  }
}

// Global loading helpers
export const useGlobalLoading = () => {
  const loading = useUIStore((state) => state.loading)
  const setLoading = useUIStore((state) => state.setLoading)
  
  return { loading, setLoading }
}