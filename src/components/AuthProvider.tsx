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
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser) // Show loading only if we need to check auth
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    let unsub: (() => void) | null = null

    const initAuth = async () => {
      try {
        const { isSupabaseConfigured } = await import('@/lib/supabase')
        if (!isSupabaseConfigured()) {
          setSession(null)
          setUser(null)
          setLoading(false)
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
          setLoading(false)
        })
        unsub = data.subscription.unsubscribe
        
        // Set loading to false after initial check
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    // Always initialize auth to allow login functionality
    initAuth()

    return () => unsub?.()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
