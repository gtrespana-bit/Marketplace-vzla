import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'
import { type NextRequest } from 'next/server'

const nextIntlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // 1. Detect locale from URL pathname FIRST
  const pathnameLocale = request.nextUrl.pathname.split('/')[1]
  const locale = routing.locales.includes(pathnameLocale as any)
    ? pathnameLocale
    : routing.defaultLocale

  // 2. Inject locale header directly on NextRequest
  // This is the proper way to add headers in middleware
  request.headers.set('x-detected-locale', locale)

  // 3. Apply next-intl routing first
  const intlResponse = nextIntlMiddleware(request)

  // 4. Refresh Supabase auth session on the intl response
  const supabaseResponse = await updateSession(request, intlResponse)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
