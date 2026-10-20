'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  GA_ALLOWED_HOSTS,
  GA_ENABLED,
  GA_FORCE,
  GA_MEASUREMENT_ID,
  GA_TRACK_SPA_PAGEVIEWS,
  trackPageView,
} from '@/lib/analytics'
import { isAdminPath } from '@/lib/admin-path'

/**
 * Google Analytics 4 (gtag.js).
 *
 * Notas de implementación:
 *
 * 1. El script externo se carga con `strategy="afterInteractive"`: no bloquea
 *    el render ni la hidratación (el histórico de este proyecto ya había
 *    eliminado GA por miedo a penalizar Lighthouse; así el impacto es mínimo).
 * 2. El `config` se emite con `send_page_view: true` implícito, de modo que la
 *    primera página se mide aunque el usuario rebote antes de que se ejecute
 *    ningún efecto de React.
 * 3. En el App Router las navegaciones internas NO recargan la página, así que
 *    cada cambio de ruta envía un `page_view` manual. La primera se ignora
 *    porque ya la envió `config`. Si en la propiedad de GA4 se activa
 *    «Cambios de página según eventos del historial del navegador», hay que
 *    poner `NEXT_PUBLIC_GA_SPA_PAGEVIEWS=0` para no duplicar.
 * 4. El panel /admin (y /en/admin) queda fuera de la medición.
 * 5. Los valores de consentimiento por defecto se definen en un script inline
 *    del layout raíz, ANTES de que se cargue gtag.js (Consent Mode v2).
 */
export default function GoogleAnalytics() {
  const pathname = usePathname() || '/'
  const isAdmin = isAdminPath(pathname)
  const lastTrackedPath = useRef<string | null>(null)
  // Arranca en `true` para que el HTML del servidor no dependa del host
  // (evita desajustes de hidratación). En el cliente se corrige al instante.
  const [hostAllowed, setHostAllowed] = useState(true)

  useEffect(() => {
    if (GA_FORCE) return
    setHostAllowed(GA_ALLOWED_HOSTS.includes(window.location.hostname))
  }, [])

  useEffect(() => {
    if (isAdmin || !hostAllowed || !GA_TRACK_SPA_PAGEVIEWS) return

    const current = window.location.pathname + window.location.search

    // Primera pasada: la vista inicial ya la envió gtag('config').
    if (lastTrackedPath.current === null) {
      lastTrackedPath.current = current
      return
    }

    if (lastTrackedPath.current === current) return
    lastTrackedPath.current = current
    trackPageView()
  }, [pathname, isAdmin, hostAllowed])

  // Fuera de producción (dev/preview/localhost/dominios ajenos) no se carga
  // gtag, para no mezclar tráfico de pruebas con el real. El panel interno
  // tampoco se mide.
  if (!GA_ENABLED || !hostAllowed || isAdmin) return null

  return (
    <>
      <Script id="ga-config" strategy="afterInteractive">
        {`window.gtag && window.gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });`}
      </Script>
      <Script
        id="ga-lib"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  )
}
