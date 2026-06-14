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
// Usamos `as any` para evitar errores de tipos estrictos en RPCs no tipados
export const supabase = getSupabaseClient() as any

export const isSupabaseConfigured = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}