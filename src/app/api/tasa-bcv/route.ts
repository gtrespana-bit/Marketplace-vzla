// API: GET /api/tasa-bcv
// Devuelve la tasa USD→Bs. con cache de 1 hora.
import { NextResponse } from 'next/server'
import { getTasaBCV } from '@/lib/tasaBCV'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export const revalidate = 3600

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const limit = await checkRateLimit('tasa-bcv', ip, { ip })
  if (!limit.ok) return rateLimitResponse(limit.resetIn)
  const tasa = await getTasaBCV()
  return NextResponse.json(tasa)
}
