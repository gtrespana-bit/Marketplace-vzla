'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
})

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
  // ✅ PERF FIX: If no initialUser (unauthenticated), skip Supabase entirely.
  // This means the Supabase chunk (~60KB compressed) NEVER loads for anonymous users.
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(false) // No loading state for anonymous users
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // ✅ CRITICAL: Only load Supabase if the server detected an authenticated user.
    // For 95%+ of traffic (anonymous visitors), this entire block is skipped,
    // meaning the Supabase chunk is never downloaded or executed.
    if (!initialUser) {
      return
    }

    let unsub: (() => void) | null = null

    const initAuth = async () => {
      try {
        const { isSupabaseConfigured } = await import('@/lib/supabase')
        if (!isSupabaseConfigured()) {
          setSession(null)
          setUser(null)
          return
        }

        const { supabase } = await import('@/lib/supabase')

        // Get current session from the singleton
        try {
          const { data, error } = await supabase.auth.getSession()
          if (!error && data.session) {
            setSession(data.session)
            setUser(data.session.user)
          }
        } catch {
          // Ignore errors
        }

        // Listen for auth changes from the singleton
        const { data } = supabase.auth.onAuthStateChange((_e, s) => {
          setSession(s)
          setUser(s?.user ?? null)
        })
        unsub = data.subscription.unsubscribe
      } catch {
        // Ignore errors
      }
    }

    initAuth()

    return () => unsub?.()
  }, [initialUser])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
