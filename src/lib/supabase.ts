import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Patrón Singleton estricto para evitar múltiples instancias de GoTrueClient
let globalSupabase: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!globalSupabase) {
    globalSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token',
        flowType: 'pkce'
      }
    })
  }
  return globalSupabase
}

// Exportación por defecto para compatibilidad con el código existente
export const supabase = getSupabaseClient()

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)