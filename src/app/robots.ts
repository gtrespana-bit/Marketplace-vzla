import type { MetadataRoute } from 'next'

const BASE_URL = 'https://vendet.online'

// ÚNICA fuente de verdad para robots.txt.
// NO crear otro robots en public/ ni en [locale]/: el archivo en public/
// sobrescribe esta ruta y el de [locale] genera /es/robots.txt y
// /en/robots.txt inútiles con reglas contradictorias.
//
// Nota: /buscar NO se bloquea aquí a propósito — la página lleva meta
// robots "noindex, follow" y Google necesita rastrearla para verlo.
const PRIVATE_SEGMENTS = [
  '/admin',
  '/dashboard',
  '/mi-perfil',
  '/chat',
  '/confirm',
  '/confirmacion',
  '/reset-password',
  '/eliminar-cuenta',
  '/offline',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          // Versiones sin prefijo (es) y con prefijo /en (localePrefix: as-needed)
          ...PRIVATE_SEGMENTS,
          ...PRIVATE_SEGMENTS.map((s) => `/en${s}`),
        ],
      },
      // ── Rastreadores de motores de respuesta (IA) ────────────────────────
      // Regla explícita: el marketplace VIVE de que la gente encuentre sus
      // anuncios. Estos agentes alimentan ChatGPT, Perplexity, Copilot, Claude
      // y los resúmenes de Google AI. No se les bloquea nada público.
      //
      // La lista es explícita a propósito: si algún día hay que bloquear
      // entrenamiento en vez de citación, se hace aquí (por ejemplo quitando
      // `Google-Extended` o `GPTBot` y dejando `OAI-SearchBot`). Documentado en
      // docs/SEO-DIAGNOSTICO-2026-11.md.
      ...[
        'GPTBot',
        'OAI-SearchBot',
        'ChatGPT-User',
        'ClaudeBot',
        'Claude-User',
        'PerplexityBot',
        'Perplexity-User',
        'Google-Extended',
        'Applebot-Extended',
        'CCBot',
        'Bingbot',
      ].map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', ...PRIVATE_SEGMENTS],
      })),
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/sitemap-images.xml`],
    host: BASE_URL,
  }
}
