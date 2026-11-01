/**
 * Cabeceras de seguridad del sitio, en un módulo aparte para poder probarlas
 * sin cargar `next.config.js` (que arrastra plugins de Next y no se puede
 * `require` desde Jest).
 *
 * Reglas que no deben romperse (hay tests de regresión en
 * `tests/unit/seguridad-csp.test.ts`):
 *
 *  1. `script-src` NO lleva `'unsafe-eval'`. Nada del proyecto lo necesita:
 *     verificado en navegador sobre /, /catalogo, /creditos, /publicar,
 *     /login y /producto sin un solo bloqueo y con la app hidratando.
 *  2. `script-src` conserva `'unsafe-inline'` **a propósito**. Quitarlo exige
 *     nonces, y los nonces obligan a renderizar cada página en cada petición:
 *     la portada, los 38 artículos del blog y las 16 categorías dejarían de ser
 *     ISR/SSG (25 rutas estáticas hoy). No compensa para un hallazgo de
 *     severidad baja, y el riesgo de romper la hidratación de todas las páginas
 *     es alto. Ver REVISION-2026-11.md §2.7.
 *  3. `connect-src` se deriva de `NEXT_PUBLIC_SUPABASE_URL`. Un comodín fijo
 *     `*.supabase.co` deja fuera a un Supabase autoalojado y entonces TODAS las
 *     consultas del cliente fallan con "Refused to connect".
 */

/**
 * Orígenes permitidos para `connect-src` según la URL de Supabase configurada.
 * @param {string | undefined} supabaseUrl
 * @returns {string}
 */
function supabaseOrigins(supabaseUrl) {
  const origenes = new Set(['https://*.supabase.co', 'wss://*.supabase.co'])
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl)
      origenes.add(u.origin)
      origenes.add(`${u.protocol === 'https:' ? 'wss:' : 'ws:'}//${u.host}`)
      if (u.hostname.endsWith('.supabase.co')) {
        const ref = u.hostname.split('.')[0]
        origenes.add(`https://${ref}.supabase.co`)
        origenes.add(`wss://${ref}.supabase.co`)
      }
    } catch {
      // URL inválida: se quedan sólo los comodines por defecto.
    }
  }
  return [...origenes].join(' ')
}

/**
 * Construye la política CSP completa.
 * @param {string | undefined} supabaseUrl
 * @returns {string}
 */
function buildCSP(supabaseUrl) {
  const supabase = supabaseOrigins(supabaseUrl)
  return [
    "default-src 'self'",
    // Google Analytics 4: gtag.js se sirve desde googletagmanager.com. Sin este
    // origen en script-src el navegador bloquea GA en silencio (solo se ve como
    // error de CSP en la consola).
    "script-src 'self' 'unsafe-inline' https://*.vercel-analytics.com https://*.vercel-scripts.com https://va.vercel-scripts.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https: ",
    "media-src 'self' blob: https://*.supabase.co https://*.r2.dev https://*.r2.cloudflarestorage.com",
    // google-analytics.com / analytics.google.com reciben los hits de GA4
    // (incluidos los pings sin cookies cuando analytics_storage='denied').
    `connect-src 'self' ${supabase} https://*.r2.dev https://pub-d212837165c545e3956251da001fa37a.r2.dev https://*.r2.cloudflarestorage.com https://*.vercel-analytics.com https://*.vercel-scripts.com https://va.vercel-scripts.com https://*.sentry.io https://*.ingest.sentry.io https://api.telegram.org https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ')
}

module.exports = { buildCSP, supabaseOrigins }
