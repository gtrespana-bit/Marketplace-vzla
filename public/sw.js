/* Service Worker - VendeT PWA - v7
 *
 * Cambios v7 (fix "The FetchEvent ... resulted in a network error response"):
 * - El fallback offline ahora es por idioma y se cachea en instalación
 *   (/offline, /es/offline y /en/offline). Antes solo se intentaba /offline
 *   y, si no estaba cacheado, la navegación se resolvía con Response.error(),
 *   que llenaba la consola con "network error response" ante cualquier blip
 *   de red (muy común en redes móviles de Venezuela).
 * - El caché sube a vendet-v7 para forzar una instalación limpia que
 *   re-cachee las páginas offline en todos los idiomas.
 *
 * Cambios v6 (fix "Failed to load resource: 503"):
 * - El SW ya NO responde 503 sintéticos: un `503` inventado hacía creer (a la
 *   consola y a quien depura) que el servidor estaba caído. Ahora los fallos
 *   de red se propagan como un error de red real (`Response.error()`), que es
 *   exactamente lo que vería el usuario si no hubiera Service Worker.
 * - Bug corregido en fetchWithRetry: el AbortError del PROPIO timeout de 8s
 *   se confundía con una cancelación de la página y no se reintentaba,
 *   convirtiendo respuestas lentas-pero-sanas en falsos fallos.
 * - Las peticiones RSC/prefetch de Next.js (?_rsc=, headers RSC) no se
 *   interceptan: antes podían cachearse como si fueran documentos HTML.
 * - Las navegaciones reintentan 1 vez antes de caer al fallback offline
 *   (los "blips" de redes móviles son muy comunes en Venezuela).
 */
const CACHE_NAME = 'vendet-v7'
const STATIC_ASSETS = [
  '/offline',
  '/es/offline',
  '/en/offline',
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

// ── Retry ante fallos de red transitorios ──
// Un solo blip de conectividad (muy común en redes móviles) provocaba falsos
// fallos. Se reintenta con backoff corto. Solo se reintentan FALLOS DE RED
// (fetch rechazado), nunca respuestas HTTP reales (4xx/5xx del servidor,
// que deben llegar tal cual al caller).
//
// Importante: se distingue el abort propio del timeout (reintentar) de la
// cancelación hecha por la página (NO reintentar: la página ya no quiere la
// respuesta).
function fetchWithRetry(request, retries = 2, timeoutMs = 10000) {
  const attempt = (n) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    // Si la página cancela su petición original, propagar la cancelación.
    const pageSignal = request.signal
    const onPageAbort = () => controller.abort()
    if (pageSignal) {
      try { pageSignal.addEventListener('abort', onPageAbort, { once: true }) } catch { /* noop */ }
    }
    return fetch(request.clone(), { signal: controller.signal })
      .finally(() => {
        clearTimeout(timer)
        if (pageSignal) {
          try { pageSignal.removeEventListener('abort', onPageAbort) } catch { /* noop */ }
        }
      })
      .catch((err) => {
        // Cancelación iniciada por la página: no reintentar.
        if (pageSignal && pageSignal.aborted) throw err
        if (n < retries) {
          return new Promise((resolve) => setTimeout(resolve, 600 * (n + 1)))
            .then(() => attempt(n + 1))
        }
        throw err
      })
  }
  return attempt(0)
}

// ── Fallback offline por idioma ──
// El sitio usa rutas localizadas (/es/..., /en/...). Cuando la red falla en
// una navegación, buscamos la página offline del idioma detectado y, como
// respaldo, /offline. Así nunca resolvemos la navegación con un
// Response.error() si existe una página offline cacheada en instalación.
async function getOfflineFallback(requestUrl) {
  const cache = await caches.open(CACHE_NAME)
  const segments = (requestUrl.pathname || '').split('/').filter(Boolean)
  const locale = segments.length && ['es', 'en'].includes(segments[0]) ? segments[0] : 'es'
  const candidates = [`/${locale}/offline`, '/offline']
  for (const candidate of candidates) {
    const hit = await cache.match(candidate, { ignoreVary: true })
    if (hit) return hit
  }
  return undefined
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

  // ── No interceptar peticiones internas de Next.js App Router ──
  // (?_rsc= / header RSC son payloads React Server Component, NO documentos.
  // Cachearlos/servirlos como HTML corrompe la navegación del cliente.)
  if (url.searchParams.has('_rsc') ||
      request.headers.get('RSC') === '1' ||
      request.headers.get('Next-Router-Prefetch') === '1' ||
      request.headers.get('Next-Router-State-Tree')) {
    return
  }

  const pathname = url.pathname

  // ── Never cache API routes — network only ──
  if (isApiRoute(pathname)) {
    // Ante fallo de red: propagar un error de red real (como si no hubiera SW).
    // Antes se devolvía un 503 sintético que ensuciaba la consola con
    // "Failed to load resource: 503" y parecía un fallo del servidor.
    event.respondWith(
      fetchWithRetry(request).catch(() => Response.error())
    )
    return
  }

  // ── Never cache sensitive storage buckets ──
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/') && isSensitiveStorage(url)) {
    event.respondWith(
      fetchWithRetry(request).catch(() => Response.error())
    )
    return
  }

  // ── Never cache private routes ──
  if (isPrivatePathPrecise(pathname)) {
    // HTML navigation to private page: network only, fallback offline if fails
    if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
      event.respondWith(
        fetchWithRetry(request, 1, 15000)
          .catch(() => getOfflineFallback(url).then(r => r || Response.error()))
      )
    } else {
      // For other assets on private pages, network only (no cache put)
      event.respondWith(
        fetchWithRetry(request).catch(() => Response.error())
      )
    }
    return
  }

  // ── HTML pages (navigation) — network first, cache fallback, exclude private (already handled) ──
  if (request.mode === 'navigate' ||
      (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetchWithRetry(request, 1, 15000)
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
          return caches.match(request, { ignoreVary: true })
            .then(cached => cached || getOfflineFallback(url))
            .then(res => res || Response.error())
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
        return fetchWithRetry(request).then(response => {
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
        }).catch(() => cached || Response.error())
      })
    )
    return
  }

  // ── Static assets (images, styles, scripts, fonts) — stale-while-revalidate ──
  if (['image', 'style', 'script', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetchWithRetry(request).then(response => {
            if (response.ok) {
              // Do not cache if private path somehow sneaks in
              if (!isPrivatePathPrecise(pathname)) {
                cache.put(request, response.clone()).catch(()=>{})
              }
            }
            return response
          }).catch(() => cached || Response.error())
          return cached || fetchPromise
        })
      )
    )
    return
  }

  // ── Everything else (R2 images, etc.) — network first, no cache for private ──
  event.respondWith(
    fetchWithRetry(request).then(response => {
      // For R2 and other public CDNs, cache if image and not private
      if (response.ok && request.destination === 'image' && !isPrivatePathPrecise(pathname)) {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(c => c.put(request, clone).catch(()=>{}))
      }
      return response
    }).catch(() => {
      // For images, try cache
      if (request.destination === 'image') {
        return caches.match(request).then(c => c || Response.error())
      }
      return Response.error()
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
