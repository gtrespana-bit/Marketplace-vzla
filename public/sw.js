/* Service Worker — VendeT PWA */
const CACHE_NAME = 'vendet-v3-ga4'
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
]

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  )
  self.clients.claim()
})

// Fetch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  const request = event.request

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip non-HTTP(S)
  if (!url.protocol.startsWith('http')) return

  // ── HTML pages (navigation) ──
  // Network first, fallback to cache, then offline page
  if (request.mode === 'navigate' || 
      (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/offline'))
        })
    )
    return
  }

  // ── Supabase Storage images (stale-while-revalidate with 7-day TTL) ──
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request)
        if (cached) {
          const cachedTime = cached.headers.get('sw-fetched-time')
          if (cachedTime) {
            const age = Date.now() - parseInt(cachedTime)
            if (age < 7 * 24 * 60 * 60 * 1000) {
              // Return cached and refresh in background
              fetch(request).then(response => {
                if (response.ok) {
                  const respClone = response.clone()
                  respClone.headers.set('sw-fetched-time', Date.now().toString())
                  cache.put(request, respClone)
                }
              }).catch(() => {})
              return cached
            }
          }
        }
        return fetch(request).then(response => {
          if (response.ok) {
            const respClone = response.clone()
            respClone.headers.set('sw-fetched-time', Date.now().toString())
            cache.put(request, respClone)
          }
          return response
        }).catch(() => cached || new Response(null, { status: 404 }))
      })
    )
    return
  }

  // ── Static assets (images, styles, scripts, fonts) ──
  // Stale-while-revalidate
  if (['image', 'style', 'script', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => 
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          }).catch(() => cached)
          return cached || fetchPromise
        })
      )
    )
    return
  }

  // ── Everything else (API calls, etc.) ──
  // Network first
  event.respondWith(
    fetch(request).catch(() => {
      // For API calls, return null response
      return new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    })
  )
})

// ═══════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════

self.addEventListener('push', event => {
  if (!event.data) return
  let data
  try { data = event.data.json() } catch { data = { title: 'VendeT', body: event.data.text() } }
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    renotify: !!data.tag,
    actions: data.actions || [],
    data: data.click_url ? { url: data.click_url } : {}
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Find existing tab or open new one
      for (const c of clients) {
        if (c.url.includes(url)) return c.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
