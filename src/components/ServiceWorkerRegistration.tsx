'use client'

import { useEffect } from 'react'

/**
 * Retires the legacy Service Worker rather than registering a new one.
 *
 * The old worker intercepted every same-origin request and introduced its own
 * retry/timeout/cache layer in front of Next.js. That is a global critical-path
 * dependency and is incompatible with a reliable Lighthouse audit. This runs
 * for real users too, so clients that still control an old worker are cleaned
 * up without asking them to clear site data manually.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(
        registrations
          .filter((registration) => {
            // This app has used /sw.js at origin scope. Restrict removal to
            // that scope so an unrelated worker is never touched.
            try {
              return new URL(registration.scope).origin === window.location.origin
            } catch {
              return false
            }
          })
          .map((registration) => registration.unregister())
      ))
      .catch(() => {
        // A failed cleanup must never affect rendering or navigation.
      })
  }, [])

  return null
}
