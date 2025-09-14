'use server'

import { createSafeServerClient } from '@/lib/supabase/server-safe'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createSafeServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    return redirect('/login?error=oauth_error')
  }

  if (data.url) {
    redirect(data.url) // Redirect the user to the Google authentication page
  }
}
