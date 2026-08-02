/*
 * Service-worker retirement shim — v14
 *
 * IMPORTANT:
 * This file deliberately does NOT install a fetch handler.
 *
 * The previous service worker was a global HTTP proxy: it intercepted every
 * navigation, JavaScript, stylesheet, font, image and API request from this
 * origin. Its retry/timeout/cache logic therefore sat in front of every page
 * Lighthouse tried to load. A timeout in that layer can leave essential
 * chunks pending or aborted and makes the audit hit its 30-second page-load
 * limit. Changing individual timeout values did not remove that architecture.
 *
 * Keep this tiny file temporarily so browsers that already have an older
 * `vendet-*` worker receive an update and unregister it. New visitors do not
 * register a worker at all (see ServiceWorkerRegistration.tsx), so requests
 * go directly from the browser to Vercel/CDN without an application proxy.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Remove all caches created by the retired worker. Do not touch caches
    // owned by other origins/applications.
    const names = await caches.keys()
    await Promise.all(names
      .filter((name) => name.startsWith('vendet-'))
      .map((name) => caches.delete(name)))

    // Unregistering in activate removes control for the next navigation.
    // Existing pages are additionally cleaned up by the client component.
    await self.registration.unregister()
  })())
})
