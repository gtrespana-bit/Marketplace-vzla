'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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

// Lazy init — solo carga Supabase si está configurado
const isConfig = typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfig) {
      setLoading(false)
      return
    }

    import('@supabase/supabase-js').then(async ({ createClient }) => {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: true, detectSessionInUrl: true } }
      )

      try {
        const { data } = await client.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user ?? null)
      } catch {
        // noop
      }
      setLoading(false)

      const { data: { subscription } } = client.auth.onAuthStateChange((_e, s) => {
        setSession(s)
        setUser(s?.user ?? null)
      })

      return () => subscription.unsubscribe()
    }).catch(() => setLoading(false))
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
