import { defineRouting } from 'next-intl/routing'

/**
 * Configuración de internacionalización.
 *
 * ⚠️ DECISIÓN SEO (importante, no revertir sin medir):
 * El mercado es Venezuela y el contenido (productos, blog, descripciones de
 * vendedores) está escrito en español. Servir ese mismo texto bajo URLs /en
 * generaba un duplicado casi completo del sitio con señal de idioma
 * contradictoria: 2.883 URLs en el sitemap frente a ~1.200 con contenido
 * propio. Google puede rastrear, pero no confía en un dominio donde la mitad
 * de las URLs declaran un idioma que su contenido no tiene.
 *
 * Por eso `en` se mantiene como interfaz disponible (dev), pero no se
 * enlaza, no se anuncia con hreflang y no entra al sitemap.
 * Ver `docs/SEO-DIAGNOSTICO-2026-11.md`.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  localeDetection: false,
  // Evita que next-intl anuncie automáticamente hreflang="en" en el header
  // HTTP; las páginas SEO declaran solo es-VE y x-default.
  alternateLinks: false,
})

/**
 * ¿Esta página debe ofrecerse en inglés?
 *
 * Solo las páginas cuya INTERFAZ está realmente traducida y que no dependen
 * de contenido de terceros en español (productos, perfiles, blog). Las demás
 * (landings de ciudad/categoría, producto, vendedor, blog) son español por
 * definición: enlazarlas a /en crea duplicados y, en el header, enlaces
 * rotos a /en/es/...
 */
export function esPaginaConVersionIngles(pathname: string): boolean {
  const base = pathname.replace(/^\/en(?=\/|$)/, '') || '/'

  if (base === '/' || base === '/catalogo') return true

  const INFORMATIVAS = new Set([
    '/como-funciona',
    '/faq',
    '/sobre-nosotros',
    '/contacto',
    '/terminos-y-condiciones',
    '/politica-de-privacidad',
    '/creditos',
  ])
  if (INFORMATIVAS.has(base)) return true

  // El resto (producto, vendedor, blog, ciudad, ciudad/categoría, buscar…)
  // muestra datos en español: no se enlaza la versión inglesa.
  return false
}
