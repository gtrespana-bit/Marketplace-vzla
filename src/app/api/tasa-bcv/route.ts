// API: GET /api/tasa-bcv
// Devuelve la tasa USD→Bs. Cacheada en el CDN (15 min) y en memoria (15 min).
import { NextResponse } from 'next/server'
import { getTasaBCV } from '@/lib/tasaBCV'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const revalidate = 3600

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const limit = await checkRateLimit('tasa-bcv', ip, { ip })
  if (!limit.ok) return rateLimitResponse(limit.resetIn)
  const tasa = await getTasaBCV()
  // La tasa cambia como mucho una vez al día (BCV). Con esto el CDN de Vercel
  // sirve la respuesta y las visitas ni siquiera llegan a la función, así que
  // el límite por IP deja de ser el que decide si el usuario ve la tasa.
  // `stale-while-revalidate` evita que un fallo puntual del origen deje la
  // tasa en blanco.
  return NextResponse.json(tasa, {
    headers: {
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
    },
  })
}
