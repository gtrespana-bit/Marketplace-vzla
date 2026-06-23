import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'
import { type NextRequest } from 'next/server'

const nextIntlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // 1. Apply next-intl routing (reads locale from URL path, sets cookie)
  const intlResponse = nextIntlMiddleware(request)

  // 2. Refresh Supabase auth session on the intl response
  //    so both next-intl and Supabase cookies are preserved
  const supabaseResponse = await updateSession(request, intlResponse)

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes (handled separately)
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - static files (favicon, images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
