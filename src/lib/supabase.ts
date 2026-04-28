// Supabase client — safe for both SSR and client-side
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImpXVCJ9.placeholder.placeholder'

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
})

export function isSupabaseConfigured(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') === true &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') === true
}
