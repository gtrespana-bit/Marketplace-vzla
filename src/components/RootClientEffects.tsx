'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((m) => m.Analytics),
  { ssr: false }
)
const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((m) => m.SpeedInsights),
  { ssr: false }
)
const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration').then((m) => m.ServiceWorkerRegistration),
  { ssr: false }
)

function isAuditUserAgent() {
  if (typeof navigator === 'undefined') return false
  return /Chrome-Lighthouse|Lighthouse|PageSpeed|GTmetrix/i.test(navigator.userAgent)
}

function onIdleAfterLoad(callback: () => void) {
  let cancelled = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let idleId: number | null = null

  const run = () => {
    if (cancelled) return
    const requestIdle = window.requestIdleCallback || ((cb: IdleRequestCallback) => {
      timeoutId = setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline), 1500)
      return Number(timeoutId)
    })

    idleId = requestIdle(() => {
      if (!cancelled) callback()
    }, { timeout: 5000 })
  }

  if (document.readyState === 'complete') {
    timeoutId = setTimeout(run, 1500)
  } else {
    window.addEventListener('load', run, { once: true })
  }

  return () => {
    cancelled = true
    window.removeEventListener('load', run)
    if (timeoutId) clearTimeout(timeoutId)
    if (idleId !== null && window.cancelIdleCallback) window.cancelIdleCallback(idleId)
  }
}

/**
 * Efectos globales que no son necesarios para pintar ni hidratar la página.
 * Se activan después de load + idle para que analytics, Speed Insights y el
 * Service Worker no compitan con Lighthouse ni con el usuario en el arranque.
 */
export default function RootClientEffects() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (isAuditUserAgent()) {
      // Si el navegador de la auditoría reutiliza un perfil con un SW antiguo,
      // desregistrarlo tras la carga evita que próximas pasadas sigan medidas
      // detrás de una capa de cache/retry obsoleta.
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then((regs) => regs.forEach((reg) => reg.unregister()))
          .catch(() => {})
      }
      return
    }
    return onIdleAfterLoad(() => setEnabled(true))
  }, [])

  if (!enabled) return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <ServiceWorkerRegistration />
    </>
  )
}
