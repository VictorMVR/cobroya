'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CAJERO'

export interface UserProfile {
  user: User
  rol: UserRole
  tenant_id?: string
  nombre_completo?: string
  email: string
  avatar_url?: string
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setError(error.message)
        return
      }

      if (user) {
        await loadUserProfile(user)
      } else {
        setLoading(false)
      }
    } catch (err) {
      setError('Error loading user')
      setLoading(false)
    }
  }

  const loadUserProfile = async (authUser: User) => {
    try {
      const metadata = authUser.user_metadata || {}
      const rol = metadata.rol as UserRole
      
      // Super admin check by email
      const isSuperAdmin = authUser.email === 'verdugorubio@gmail.com'
      
      const profile: UserProfile = {
        user: authUser,
        rol: isSuperAdmin ? 'SUPER_ADMIN' : (rol || 'ADMIN'), // Default to ADMIN for new users
        tenant_id: metadata.tenant_id,
        nombre_completo: metadata.nombre_completo || authUser.email?.split('@')[0],
        email: authUser.email!,
        avatar_url: metadata.avatar_url || authUser.user_metadata?.avatar_url
      }

      setUser(profile)
      setError(null)
    } catch (err) {
      setError('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const updateUserMetadata = async (updates: {
    rol?: UserRole
    tenant_id?: string
    nombre_completo?: string
  }) => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error

      // Reload user profile
      await getUser()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing out')
    }
  }

  // Helper functions for role checking
  const isSuperAdmin = user?.rol === 'SUPER_ADMIN'
  const isAdmin = user?.rol === 'ADMIN'
  const isCajero = user?.rol === 'CAJERO'
  const isAuthenticated = !!user

  // Permission helpers
  const canManageProducts = isSuperAdmin || isAdmin
  const canManageUsers = isSuperAdmin || isAdmin
  const canViewReports = isSuperAdmin || isAdmin
  const canAccessPOS = isAuthenticated // All authenticated users can access POS
  const canManageTenant = isSuperAdmin || isAdmin

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isCajero,
    canManageProducts,
    canManageUsers,
    canViewReports,
    canAccessPOS,
    canManageTenant,
    updateUserMetadata,
    signOut,
    refresh: getUser
  }
}