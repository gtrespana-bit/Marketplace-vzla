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
  // ✅ HYDRATION-SAFE AUTH: Use server user on first render, defer all updates
  // until after hydration completes to prevent React #425/#422.
  // Root cause: After multiple locale switches, localStorage session can be
  // stale vs cookies. getSession() returns different user → hydration mismatch.
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)
  const initialized = useRef(false)
  const hydrated = useRef(false)
  const pendingRef = useRef<(() => void) | null>(null)

  // Defer a state update until after hydration completes
  const safeUpdate = (fn: () => void) => {
    if (hydrated.current) {
      fn()
    } else {
      pendingRef.current = fn
    }
  }

  // Mark hydrated AFTER first paint (hydration completes before paint)
  useEffect(() => {
    hydrated.current = true
    if (pendingRef.current) {
      pendingRef.current()
      pendingRef.current = null
    }
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder')) {
      setSession(null)
      setUser(null)
      setLoading(false)
      return
    }

    let unsub: (() => void) | null = null
    import('@supabase/supabase-js')
      .then(({ createClient }) => {
        const client = createClient(url, key, {
          auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true },
        })

        // ✅ Defer getSession to avoid hydration mismatch with stale localStorage
        client.auth.getSession()
          .then(({ data, error }) => {
            safeUpdate(() => {
              if (!error) {
                setSession(data.session)
                setUser(data.session?.user ?? null)
              }
              setLoading(false)
            })
          })
          .catch(() => safeUpdate(() => setLoading(false)))

        // ✅ Defer onAuthStateChange updates too
        const { data } = client.auth.onAuthStateChange((_e, s) => {
          safeUpdate(() => {
            setSession(s)
            setUser(s?.user ?? null)
          })
        })
        unsub = data.subscription.unsubscribe
      })
      .catch(() => safeUpdate(() => setLoading(false)))

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
