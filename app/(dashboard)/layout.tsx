'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { MobileNav, useMobileNavHeight } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

// Note: Metadata must be exported from a Server Component
// This is handled by a separate metadata file or parent layout

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const mobileNavHeight = useMobileNavHeight()

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarCollapse}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          onMenuClick={handleSidebarToggle}
          showMenuButton={true}
        />

        {/* Main content */}
        <main className={cn(
          'flex-1 overflow-y-auto',
          mobileNavHeight, // Add padding for mobile navigation
          'lg:pb-0' // Remove padding on desktop
        )}>
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  )
}