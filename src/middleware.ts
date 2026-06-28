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

  // 2. Create a new request with locale header
  // This ensures the header propagates to server components via headers()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-detected-locale', locale);
  
  const modifiedRequest = new Request(request, {
    headers: requestHeaders,
  });

  // 3. Apply next-intl routing first and handle both sync/async responses
  let response;
  try {
    const nextResponse = nextIntlMiddleware(modifiedRequest);
    response = nextResponse instanceof Promise ? await nextResponse : nextResponse;
  } catch (error) {
    // If next-intl fails, return a basic response
    response = NextResponse.next({ request });
  }

  // 4. Refresh Supabase auth session on the response
  const supabaseResponse = await updateSession(request, response);

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
