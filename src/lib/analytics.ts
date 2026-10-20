/**
 * Utilidades de Google Analytics 4 (GA4) para VendeT.
 *
 * Contexto (importante): el componente `GoogleAnalytics` se eliminó del
 * proyecto el 2026-08-01 por dudas de rendimiento y NUNCA se volvió a montar.
 * Como consecuencia, el sitio no enviaba ni un solo hit a GA4 desde entonces,
 * aunque la propiedad `G-RMMQFHP6EC` siguiera existiendo en Google Analytics.
 *
 * Este módulo centraliza:
 *  - el ID de medición (variable de entorno `NEXT_PUBLIC_GA_ID`, con el ID real
 *    del proyecto como valor por defecto para que funcione sin configuración),
 *  - la lectura/escritura de la decisión de cookies,
 *  - el envío de eventos y pageviews (incluidas las navegaciones SPA).
 *
 * No importa nada de React ni de Next: se puede usar en componentes cliente,
 * en handlers y en tests.
 */

/** Flujo web real de VendeT en Google Analytics 4. */
export const GA_DEFAULT_ID = 'G-RMMQFHP6EC'

/** ID de medición de GA4. Se puede sobreescribir con NEXT_PUBLIC_GA_ID. */
export const GA_MEASUREMENT_ID: string = (() => {
  const fromEnv = (process.env.NEXT_PUBLIC_GA_ID || '').trim()
  // Validación defensiva: solo aceptamos el formato de un flujo web de GA4.
  if (/^G-[A-Z0-9]{4,20}$/i.test(fromEnv)) return fromEnv
  if (fromEnv) {
    // Si hay una variable definida pero con formato raro, avisamos en consola
    // en lugar de romper la carga silenciosamente.
    console.warn(
      `[analytics] NEXT_PUBLIC_GA_ID inválido ("${fromEnv}"). Se usará ${GA_DEFAULT_ID}.`
    )
  }
  return GA_DEFAULT_ID
})()

/**
 * Si vale `1`/`true`, GA4 arranca con `analytics_storage: 'denied'` hasta que
 * el usuario acepte el banner (consentimiento previo estricto, modelo RGPD).
 * Por defecto el consentimiento es implícito (se mide y el usuario puede
 * rechazar), que es el modelo habitual para una audiencia mayoritariamente
 * venezolana. Se puede activar sin tocar código:
 *   NEXT_PUBLIC_GA_REQUIRE_CONSENT=1
 */
export const GA_REQUIRE_CONSENT =
  process.env.NEXT_PUBLIC_GA_REQUIRE_CONSENT === '1' ||
  process.env.NEXT_PUBLIC_GA_REQUIRE_CONSENT === 'true'

/**
 * Activa el envío manual de pageviews en las navegaciones SPA del App Router.
 * Ponlo a `0` si en GA4 tienes activada la medición mejorada
 * «Cambios de página según eventos del historial del navegador», que ya
 * registra esas navegaciones y provocaría pageviews duplicadas.
 */
export const GA_TRACK_SPA_PAGEVIEWS =
  process.env.NEXT_PUBLIC_GA_SPA_PAGEVIEWS !== '0' &&
  process.env.NEXT_PUBLIC_GA_SPA_PAGEVIEWS !== 'false'

/**
 * Solo medimos en producción y en el dominio real.
 *
 * Sin esta guarda, cada `next dev`, cada preview de Vercel y cada `vercel dev`
 * enviaría hits a la propiedad de producción (`vendet.online`), mezclando
 * tráfico de pruebas con el real. En local se puede forzar con
 * `NEXT_PUBLIC_GA_FORCE=1` si hace falta depurar.
 */
export const GA_FORCE = process.env.NEXT_PUBLIC_GA_FORCE === '1'

export const GA_ENABLED =
  GA_FORCE ||
  (process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview')

/** Dominios canónicos donde SÍ se mide. */
export const GA_ALLOWED_HOSTS = ['vendet.online', 'www.vendet.online']

/** Clave de localStorage donde se guarda la decisión del banner. */
export const CONSENT_STORAGE_KEY = 'cookie-consent'

export type ConsentChoice = 'accepted' | 'rejected'

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined
>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Devuelve la decisión guardada del usuario, o `null` si todavía no eligió.
 * Nunca lanza: localStorage puede estar bloqueado (modo privado, políticas).
 */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return value === 'accepted' || value === 'rejected' ? value : null
  } catch {
    return null
  }
}

/**
 * Guarda la decisión y la comunica a GA4 mediante Consent Mode v2.
 * Con `ad_*` siempre en `denied`, no se usa la red de anuncios de Google.
 */
export function setStoredConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice)
  } catch {
    // Sin localStorage seguimos actualizando el consentimiento en memoria.
  }

  window.gtag?.('consent', 'update', {
    analytics_storage: choice === 'rejected' ? 'denied' : 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

/**
 * Envía un evento a GA4. Si el script aún no está cargado, `gtag` encola la
 * llamada en `dataLayer` (lo define el script inline del layout raíz), así que
 * no se pierde ningún evento temprano.
 */
export function trackEvent(
  name: string,
  params: AnalyticsEventParams = {}
): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

/**
 * Registra una vista de página.
 *
 * La primera vista de cada carga la envía `gtag('config')`; esta función se
 * usa para las navegaciones internas del App Router (que no recargan la
 * página) y para cualquier otro pageview puntual.
 */
export function trackPageView(): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return

  const pagePath = window.location.pathname + window.location.search

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: pagePath,
  })
}
