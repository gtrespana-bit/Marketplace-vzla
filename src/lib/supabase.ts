// ============================================================
// Supabase — SSR-safe client factory
// Uses @supabase/ssr which guards window.location access
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

// Browser client (for 'use client' components)
let _browserClient: ReturnType<typeof import('@supabase/ssr').createBrowserClient> | null = null

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('Cannot use browser client on the server. Use getServerClient() instead.')
  }
  if (!_browserClient) {
    const { createBrowserClient } = require('@supabase/ssr')
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _browserClient
}

// Server client (for Server Components — no cookie persistence for anon key)
let _serverClient: ReturnType<typeof import('@supabase/ssr').createServerClient> | null = null

export function getServerClient() {
  if (!_serverClient) {
    const { createServerClient } = require('@supabase/ssr')
    _serverClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    })
  }
  return _serverClient
}
