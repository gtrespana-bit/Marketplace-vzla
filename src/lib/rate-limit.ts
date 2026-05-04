/**
 * Rate limiter usando memoria del server (Vercel serverless).
 *
 * Cada función serverless en Vercel es efímera, pero dentro de la misma
 * invocación podemos limitar. Para un rate limit real distribuido necesitarías
 * Redis (Upstash) — este es un primer paso que protege contra bursts locales.
 */

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  // Publicaciones: máximo 30 por hora (empresas pueden subir inventario)
  'producto:create': { max: 30, windowMs: 60 * 60 * 1000 },
  // Mensajes: máximo 60 por hora (chat activo sin spam masivo)
  'mensaje:create': { max: 60, windowMs: 60 * 60 * 1000 },
  // Denuncias: máximo 10 por hora
  'denuncia:create': { max: 10, windowMs: 60 * 60 * 1000 },
  // Login: máximo 10 por 15 minutos (anti brute force)
  'auth:login': { max: 10, windowMs: 15 * 60 * 1000 },
  // Comprar créditos: máximo 20 por hora
  'creditos:comprar': { max: 20, windowMs: 60 * 60 * 1000 },
}

// In-memory store: { key: [{ userId: ..., timestamp: ... }] }
const store: Record<string, { userId: string; ts: number }[]> = {}

export function checkRateLimit(key: string, userId: string): { ok: boolean; remaining: number; resetIn: number } {
  const limit = LIMITS[key]
  if (!limit) return { ok: true, remaining: 999, resetIn: 0 }

  const now = Date.now()
  const windowStart = now - limit.windowMs

  // Limpiar entradas antiguas
  if (!store[key]) store[key] = []
  store[key] = store[key].filter(entry => entry.ts > windowStart)

  const count = store[key].filter(entry => entry.userId === userId).length
  const remaining = Math.max(0, limit.max - count)

  if (count >= limit.max) {
    // Calcular cuándo se resetea
    const oldestInWindow = store[key]
      .filter(entry => entry.userId === userId)
      .sort((a, b) => a.ts - b.ts)[0]
    const resetIn = oldestInWindow ? oldestInWindow.ts + limit.windowMs - now : limit.windowMs

    return { ok: false, remaining: 0, resetIn: Math.max(0, resetIn) }
  }

  // Registrar este intento
  store[key].push({ userId, ts: now })

  return { ok: true, remaining: remaining - 1, resetIn: limit.windowMs }
}

export function getRateLimitHeaders(result: { ok: boolean; remaining: number; resetIn: number }) {
  return {
    'X-RateLimit-Limit': 'limited',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetIn),
  }
}
