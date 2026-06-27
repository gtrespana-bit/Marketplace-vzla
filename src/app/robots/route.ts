import { NextResponse } from 'next/server'

export function GET() {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://vende-t.com/sitemap.xml

# Disallow admin and auth routes
Disallow: /admin/
Disallow: /dashboard/
Disallow: /login
Disallow: /register
Disallow: /confirm
Disallow: /eliminar-cuenta
`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
