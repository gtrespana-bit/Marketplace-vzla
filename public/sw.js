/* Service Worker - VendeT PWA - v4 hardened */
const CACHE_NAME = 'vendet-v4'
const STATIC_ASSETS = [
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192.webp',
  '/icon-512.webp',
]

// Private routes that must NEVER be cached (plus locale variants /en/...)
const PRIVATE_PATHS = [
  '/dashboard',
  '/chat',
  '/mi-perfil',
  '/admin',
  '/publicar',
  '/creditos',
  '/eliminar-cuenta',
]

// Buckets/paths that contain sensitive data and must NOT be cached
const SENSITIVE_STORAGE_KEYWORDS = [
  'comprobantes',
  'comprobante',
]

function isPrivatePath(pathname) {
  if (!pathname) return false
  // Normalize: check if any private segment appears in pathname
  return PRIVATE_PATHS.some(p => {
    // Exact or segment match to avoid false positives but allow /en/dashboard
    return pathname === p || pathname.startsWith(p + '/') || pathname.includes(p + '/') || pathname.includes(p) && (pathname.split('/').includes(p.slice(1)) || pathname.endsWith(p))
  })
}

// More precise check for dashboard etc
function isPrivatePathPrecise(pathname) {
  const lower = pathname.toLowerCase()
  return PRIVATE_PATHS.some(priv => {
    // matches /dashboard, /es/dashboard, /en/dashboard, /dashboard/xxx
    const regex = new RegExp(`(^|/)${priv.replace(/^\//,'')}(/|$)`, 'i')
    return regex.test(lower)
  })
}

function isApiRoute(pathname) {
  return pathname.startsWith('/api/')
}

function isSensitiveStorage(url) {
  const path = url.pathname.toLowerCase()
  return SENSITIVE_STORAGE_KEYWORDS.some(k => path.includes(k))
}

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll can fail if one asset fails — add individually with catch
      return Promise.allSettled(
        STATIC_ASSETS.map(u => cache.add(u).catch(() => {}))
      )
    })
  )
  self.skipWaiting()
})

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME)
          .map(n => caches.delete(n))
      )
    )
  )
  self.clients.claim()
})

// Message handling: clear private cache on logout, skip waiting
self.addEventListener('message', event => {
  if (!event.data) return
  const type = event.data.type
  if (type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (type === 'CLEAR_PRIVATE_CACHE' || type === 'CLEAR_ALL_CACHES') {
    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.map(k => caches.delete(k)))
      )
    )
  }
})

// Fetch handling
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  // Only handle GET
  if (request.method !== 'GET') return
  // Skip non-HTTP(S)
  if (!url.protocol.startsWith('http')) return

  const pathname = url.pathname

  // ── Never cache API routes — network only ──
  if (isApiRoute(pathname)) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )
    return
  }

  // ── Never cache sensitive storage buckets ──
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/') && isSensitiveStorage(url)) {
    event.respondWith(
      fetch(request).catch(() => new Response(null, { status: 404 }))
    )
    return
  }

  // ── Never cache private routes ──
  if (isPrivatePathPrecise(pathname)) {
    // HTML navigation to private page: network only, fallback offline if fails
    if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
      event.respondWith(
        fetch(request).catch(() => caches.match('/offline'))
      )
    } else {
      // For other assets on private pages, network only (no cache put)
      event.respondWith(
        fetch(request).catch(() => new Response(null, { status: 404 }))
      )
    }
    return
  }

  // ── HTML pages (navigation) — network first, cache fallback, exclude private (already handled) ──
  if (request.mode === 'navigate' ||
      (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Do not cache if response is redirect or auth related
          if (response.ok && response.type !== 'opaqueredirect') {
            const clone = response.clone()
            // Only cache if not private (double check)
            if (!isPrivatePathPrecise(new URL(clone.url).pathname)) {
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(()=>{})
            }
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
    // Public bucket images only (sensitive already excluded)
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request)
        if (cached) {
          const cachedTime = cached.headers.get('sw-fetched-time')
          if (cachedTime) {
            const age = Date.now() - parseInt(cachedTime, 10)
            if (age < 7 * 24 * 60 * 60 * 1000) {
              // Refresh in background
              fetch(request).then(resp => {
                if (resp.ok) {
                  // Clone and add custom header via new Response
                  resp.blob().then(blob => {
                    const newResp = new Response(blob, {
                      status: resp.status,
                      statusText: resp.statusText,
                      headers: {
                        ...Object.fromEntries(resp.headers.entries()),
                        'sw-fetched-time': Date.now().toString()
                      }
                    })
                    cache.put(request, newResp)
                  })
                }
              }).catch(() => {})
              return cached
            }
          }
        }
        // No valid cache or expired: fetch and cache
        return fetch(request).then(response => {
          if (response.ok) {
            response.clone().blob().then(blob => {
              const newResp = new Response(blob, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                  ...Object.fromEntries(response.headers.entries()),
                  'sw-fetched-time': Date.now().toString()
                }
              })
              cache.put(request, newResp).catch(()=>{})
            })
          }
          return response
        }).catch(() => cached || new Response(null, { status: 404 }))
      })
    )
    return
  }

  // ── Static assets (images, styles, scripts, fonts) — stale-while-revalidate ──
  if (['image', 'style', 'script', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
              // Do not cache if private path somehow sneaks in
              if (!isPrivatePathPrecise(pathname)) {
                cache.put(request, response.clone()).catch(()=>{})
              }
            }
            return response
          }).catch(() => cached)
          return cached || fetchPromise
        })
      )
    )
    return
  }

  // ── Everything else (R2 images, etc.) — network first, no cache for private ──
  event.respondWith(
    fetch(request).then(response => {
      // For R2 and other public CDNs, cache if image and not private
      if (response.ok && request.destination === 'image' && !isPrivatePathPrecise(pathname)) {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(c => c.put(request, clone).catch(()=>{}))
      }
      return response
    }).catch(() => {
      // For images, try cache
      if (request.destination === 'image') {
        return caches.match(request).then(c => c || new Response(null, { status: 404 }))
      }
      return new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    })
  )
})

// ═══════════════════════════
// PUSH NOTIFICATIONS
// ═══════════════════════════
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
  event.waitUntil(self.registration.showNotification(data.title || 'VendeT', options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        if (c.url.includes(url)) return c.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
