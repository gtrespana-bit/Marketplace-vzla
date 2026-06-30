import { cookies } from 'next/headers'

/**
 * ✅ HYDRATION FIX: Parse JWT directly from cookies (NO network call).
 *
 * Root cause: `getUser()` makes a network call to Supabase that can fail
 * silently in production, returning null even when the user is logged in.
 * Server renders "Sign In" but client has valid session → hydration mismatch.
 *
 * Fix: Parse the JWT token directly from the Supabase auth cookie.
 * This is synchronous, reliable, and always matches the client's session
 * because both read from the same cookie.
 */
export async function getServerUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Supabase stores auth token in cookie named 'sb-{projectRef}-auth-token'
    // Also check for legacy format 'sb-auth-token'
    const authCookie = allCookies.find(c =>
      c.name.includes('auth-token')
    )

    if (!authCookie?.value) return null

    let parsed: any
    try {
      parsed = JSON.parse(authCookie.value)
    } catch {
      // Cookie value might not be JSON, try URL-decoding first
      try {
        parsed = JSON.parse(decodeURIComponent(authCookie.value))
      } catch {
        return null
      }
    }

    // Supabase cookie structure: { access_token, refresh_token, user, ... }
    const accessToken = parsed?.access_token
    if (!accessToken) return null

    // Parse JWT payload (base64url encoded)
    const parts = accessToken.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )

    // Return user object matching Supabase's User interface
    return {
      id: payload.sub,
      email: payload.email,
      user_metadata: payload.user_metadata || {},
      app_metadata: payload.app_metadata || {},
      aud: payload.aud || 'authenticated',
      role: payload.role || 'authenticated',
      created_at: payload.created_at || '',
    }
  } catch {
    return null
  }
}
