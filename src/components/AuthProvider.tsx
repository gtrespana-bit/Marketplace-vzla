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
  // ✅ HYDRATION FIX: Use server user on first render so client matches server HTML
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // ✅ FIX: Use the singleton supabase client so login/logout events
    // from other components (login page, dashboard) are received here.
    // Previously this created a SEPARATE client instance that never
    // received onAuthStateChange events from the singleton.
    let unsub: (() => void) | null = null

    const initAuth = async () => {
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
      setLoading(false)

      // Listen for auth changes from the singleton
      // This is the KEY fix: when login page calls supabase.auth.signInWithPassword()
      // or dashboard calls supabase.auth.signOut(), this listener fires.
      const { data } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s)
        setUser(s?.user ?? null)
      })
      unsub = data.subscription.unsubscribe
    }

    initAuth().catch(() => setLoading(false))

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
