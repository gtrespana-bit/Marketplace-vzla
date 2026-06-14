import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'
import { type NextRequest } from 'next/server'

const nextIntlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // 1. Refresh Supabase auth session (sets/updates cookies)
  const supabaseResponse = await updateSession(request)

  // 2. Apply next-intl routing on top of the response with fresh cookies
  return nextIntlMiddleware(request)
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
