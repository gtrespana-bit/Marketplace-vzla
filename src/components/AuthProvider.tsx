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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder')) {
      // No Supabase configured — skip entirely, don't crash
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

        client.auth.getSession()
          .then(({ data, error }) => {
            if (!error) {
              setSession(data.session)
              setUser(data.session?.user ?? null)
            }
            setLoading(false)
          })
          .catch(() => setLoading(false))

        const { data } = client.auth.onAuthStateChange((_e, s) => {
          setSession(s)
          setUser(s?.user ?? null)
        })
        unsub = data.subscription.unsubscribe
      })
      .catch(() => setLoading(false))

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
