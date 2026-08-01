/* Service Worker - VendeT PWA - v11
 *
 * Cambios v11 (fix rendimiento global — las navegaciones no deben colgarse):
 * - Las NAVEGACIONES (HTML) ya NO reintentan y usan un timeout corto de 5s
 *   (antes: 1 reintento + timeout de 15s). En redes móviles inestables un
 *   blip de red podía dejar la página "colgada" varios segundos antes de que
 *   el fallback (caché → offline → HTML inline) respondiera, penalizando el
 *   TTFB/TTI de TODAS las páginas.
 * - El caché de HTML sigue siendo en segundo plano (background): devolvemos
 *   la respuesta de red al momento y cacheamos el clon sin bloquear.
 * - El caché sube a vendet-v11 para forzar instalación limpia.
 *
 * Cambios v10 (fix "Failed to load resource: status of 503"):
 * - Se eliminan los 4 `new Response(..., { status: 503 })` sintéticos que el
 *   SW devolvía cuando la red fallaba y no había caché. Eran MENTIRA: el
 *   servidor estaba sano, pero la consola mostraba
 *   "the server responded with a status of 503 (Service Unavailable)",
 *   apuntando a un fallo de backend inexistente y enmascarando el problema
 *   real (un blip de red, muy común en redes móviles de Venezuela).
 * - Ahora se devuelve `Response.error()`, que es lo que el navegador entiende
 *   como fallo de red auténtico (status 0). Es también el contrato que ya
 *   verificaban los tests en tests/unit/service-worker.test.ts.
 * - Las NAVEGACIONES siguen resolviendo siempre con una respuesta válida
 *   (caché → offline → HTML inline): ahí un error de red daría pantalla rota.
 * - El caché sube a vendet-v10 para forzar instalación limpia.
 */
const CACHE_NAME = 'vendet-v11'
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

// ── Timeout corto para NAVEGACIONES (HTML) ──
// Las navegaciones son el hot path de la experiencia: el usuario está viendo
// una pantalla en blanco mientras esto resuelve. Un timeout largo + reintento
// podía "colgar" la página 15s+ en redes inestables. Usamos un único intento
// con 5s; si falla, el fallback (caché → offline → HTML inline) responde
// inmediatamente.
const NAV_TIMEOUT_MS = 5000

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

// ── Último recurso para navegaciones: HTML offline mínimo (200) ──
// Resolver una navegación con Response.error() llena la consola con
// "The FetchEvent ... resulted in a network error response" y muestra un
// error crudo del navegador. En su lugar servimos una página offline
// autocontenida con botón de reintentar (no depende de la red ni del caché).
function createInlineOfflineResponse() {
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sin conexión | VendeT.online</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;color:#0f172a;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}
  .card{max-width:420px;padding:32px}
  h1{font-size:22px;margin:0 0 8px}
  p{color:#64748b;font-size:15px;line-height:1.5;margin:0 0 20px}
  button{background:#008080;color:#fff;border:0;border-radius:10px;padding:12px 24px;font-size:15px;font-weight:600;cursor:pointer}
</style>
</head>
<body>
<div class="card">
  <div style="font-size:44px;margin-bottom:12px">📡</div>
  <h1>Estás sin conexión</h1>
  <p>No pudimos cargar la página. Revisa tu conexión a internet e inténtalo de nuevo.</p>
  <button onclick="location.reload()">Reintentar</button>
</div>
</body>
</html>`
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

// Re-cachea las páginas offline (por si la instalación falló o expiraron).
function refreshOfflinePages(cache) {
  try {
    ;['/offline', '/es/offline', '/en/offline'].forEach((u) => {
      cache.add(u).catch(() => {})
    })
  } catch {
    // noop
  }
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

  // ── API routes: NUNCA se cachean, pero sí se reintentan ──
  // Solo llegamos aquí con peticiones GET (las demás salieron arriba), así que
  // reintentar es idempotente y seguro: no puede duplicar una publicación ni
  // un mensaje. Un blip de red en /api/tasa-bcv se recupera solo.
  //
  // fetchWithRetry únicamente reintenta FALLOS DE RED; las respuestas HTTP
  // reales (429, 500...) se devuelven intactas al caller.
  if (isApiRoute(pathname)) {
    event.respondWith(
      fetchWithRetry(request).catch(() => Response.error())
    )
    return
  }

  // ── Never cache sensitive storage buckets — pass through ──
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/') && isSensitiveStorage(url)) {
    return
  }

  // ── Never cache private routes ──
  if (isPrivatePathPrecise(pathname)) {
    // HTML navigation to private page: network only, fallback offline if fails
    if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
      event.respondWith(
        fetchWithRetry(request, 0, NAV_TIMEOUT_MS)
          .catch(() => getOfflineFallback(url).then(r => r || createInlineOfflineResponse()))
      )
    } else {
      // For other assets on private pages (subresources), pass through.
      // No interceptamos: si la red falla, el navegador maneja el error naturalmente.
      return
    }
    return
  }

  // ── HTML pages (navigation) — network first, cache fallback, exclude private (already handled) ──
  // Un único intento con timeout corto: si la red falla, servimos al instante
  // la respuesta cacheada/offline. El caching del HTML se hace en segundo
  // plano (no bloquea el retorno de la respuesta).
  if (request.mode === 'navigate' ||
      (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetchWithRetry(request, 0, NAV_TIMEOUT_MS)
        .then(response => {
          // Do not cache if response is redirect or auth related
          if (response.ok && response.type !== 'opaqueredirect') {
            const clone = response.clone()
            // Only cache if not private (double check)
            if (!isPrivatePathPrecise(new URL(clone.url).pathname)) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clone).catch(()=>{})
                // Mantener el fallback offline siempre fresco
                refreshOfflinePages(cache)
              })
            }
          }
          return response
        })
        .catch(() => {
          // NUNCA resolver con Response.error(): la cadena siempre termina en
          // una respuesta (caché → offline → HTML offline inline).
          return caches.match(request, { ignoreVary: true })
            .then(cached => cached || getOfflineFallback(url))
            .then(res => res || createInlineOfflineResponse())
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
        }).catch(() => {
          // Si hay caché viejo (expirado), servirlo antes de fallar
          if (cached) return cached
          // No hay caché: propagar un ERROR DE RED real. Inventar un 503
          // mentía sobre el estado del servidor (aparecía "status of 503" en
          // consola con el backend perfectamente sano).
          return Response.error()
        })
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
          }).catch(() => {
            // Si hay caché, servirlo
            if (cached) return cached
            // No hay caché: error de red real, no un 503 inventado.
            return Response.error()
          })
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
        return caches.match(request).then(c => {
          if (c) return c
          // No hay caché: error de red real, no un 503 inventado.
          return Response.error()
        })
      }
      // No-imagen: error de red real, no un 503 inventado.
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
