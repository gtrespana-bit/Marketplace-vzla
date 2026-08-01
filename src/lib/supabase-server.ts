import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Fase 3 Bloque D — getServerUser seguro
 * 
 * Antes hacía parseo manual JWT (Buffer.from(..., 'base64url')),
 * no validaba expiración ni firma contra Supabase.
 * 
 * Ahora usa `supabase.auth.getUser()` que valida el JWT contra
 * el servidor Supabase (firma + expiración).
 * 
 * Mantiene compatibilidad con el retorno previo pero seguro.
 */
export async function getServerUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // En Server Components las cookies son de solo lectura para escritura.
            // El refresh ocurre en middleware/client. Aquí solo leemos.
          },
        },
      }
    )

    // Valida JWT contra Supabase (verifica firma y expiración)
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    return data.user
  } catch {
    return null
  }
}
