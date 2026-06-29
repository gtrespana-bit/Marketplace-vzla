'use client'

import { useEffect } from 'react'

/**
 * Registers the Service Worker ONLY after the page is fully loaded and interactive.
 * This prevents the SW install from blocking initial page render (363ms long task).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const registerSW = () => {
      // Use requestIdleCallback to register during idle time
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
      
      idleCallback(() => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('[SW] Registration failed:', err)
        })
      }, { timeout: 5000 })
    }

    // Wait for page to be fully loaded first
    if (document.readyState === 'complete') {
      // Already loaded, register after a delay to avoid competing with hydration
      setTimeout(registerSW, 3000)
    } else {
      window.addEventListener('load', () => {
        // Wait 3 seconds after load to ensure hydration is done
        setTimeout(registerSW, 3000)
      })
    }
  }, [])

  return null
}
