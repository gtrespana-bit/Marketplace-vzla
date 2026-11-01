# Revisión completa — catálogo en móvil, seguridad, rendimiento y SEO

**Fecha:** 1 de noviembre de 2026
**Rama:** `arena/f6725f98-marketplace-vzla`
**Base:** `main` @ `1e29dc8`
**Alcance:** revisión del repositorio completo + diagnóstico del bug «el catálogo no carga (solo en móvil)» + seguridad, rendimiento y SEO.

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` | ✅ limpio |
| `eslint .` | ✅ 0 errores (5 warnings preexistentes) |
| `jest` (unit) | ✅ **108/108** (8 nuevos de regresión) |
| `next build` | ✅ 181 rutas |
| Pruebas HTTP contra build de producción + mock PostgREST | ✅ catálogo 200, estado de error correcto, ficha cacheable |
| `middleware` → `proxy` (deprecación Next 16) | ⚠️ pendiente, ver §5 |

---

## 1. El bug: «el catálogo no carga, solo en móvil»

### 1.1 Qué pasaba

`/catalogo` renderizaba en el servidor la primera página y, si esa consulta
fallaba, el componente **no distinguía entre «no hay productos» y «la consulta
falló»**:

```ts
// antes — src/app/[locale]/catalogo/page.tsx
if (error || !data) return { products: [], count: 0 }   // ⬅️ se perdía el error
...
} catch {
  return { products: [], count: 0 }                     // ⬅️ idem
}
```

Con `initialProducts = []` y `initialCount = 0`, el cliente entraba por la rama
«datos del SSR», `showInitialSSR = true`, y **no ejecutaba nunca la consulta del
lado del cliente**. Resultado: la página pintaba durante 10 minutos (ISR) el
estado vacío **«No hay productos en esta categoría — Sé el primero en
publicar»**… con 29 productos publicados.

Por qué se nota **solo en móvil**:

| Factor | Escritorio | Móvil |
|---|---|---|
| Tiempo de la función serverless (cold start + Supabase) | rara vez > 10 s | frecuente en 3G/4G → timeout del render → `catch` → catálogo vacío |
| El `<Suspense>` de la página no tenía `fallback` | el HTML llega rápido | pantalla **en blanco** mientras viaja el RSC |
| Grid de 1 columna | 1 tarjeta grande | la primera imagen (lazy, sin `priority`) entra tarde → hueco gris en el primer scroll |
| Respuestas 304 con `RSC` incompleto / caché intermedia | red estable | más probable en redes móviles |

Es decir: no era «el catálogo», era **el estado de error disfrazado de catálogo
vacío**, amplificado por el arranque lento del móvil.

### 1.2 Qué se cambió

1. **El servidor distingue vacío de fallo** (`InitialCatalog.ok`). Si Supabase
   falla, `ok: false` viaja al cliente.
2. **El cliente se autorrecupera**: si `initialOk === false`, pide la página 1
   por su cuenta con `useProductLoader` (la misma consulta, ahora desde el
   navegador del usuario, que no depende del timeout de la función).
3. **Estado de error accionable** (y también en el HTML del servidor):
   *«No pudimos cargar el catálogo — Revisa tu conexión e inténtalo de nuevo —
   Reintentar»*. El mensaje interno de Supabase solo se muestra en desarrollo.
4. **`<Suspense fallback>` real**: esqueleto con la estructura exacta del
   catálogo (filtros + grid), nunca `undefined`.
5. **Antes de hidratar** no se muestra «no hay productos»: se mantiene el
   esqueleto (no se puede saber si el catálogo está vacío sin ejecutar JS).
6. **Grid 2 columnas en móvil** (`grid-cols-2 md:grid-cols-3 xl:grid-cols-4`),
   como los clasificados: caben 4 tarjetas por pantalla en vez de 2.
7. **Primeras 2 tarjetas en `eager` + `fetchPriority="high"`** y `sizes`
   corregido (declaraba `20vw` en desktop → variante menos nítida de la
   necesaria; ahora `50vw / 33vw / 25vw` según breakpoint).
8. **Esqueleto de `loading.tsx` con las mismas columnas** que el grid final:
   antes el paso esqueleto → contenido movía el layout (CLS).

### 1.3 Pruebas realizadas

Se levantó un **mock de PostgREST** (`mock-supabase/server.js`, fuera de git)
que responde como Supabase (`Content-Range`, `count: 'exact'`, filtros `eq/neq/
gte/lte/in`, `or=(...)`) y se probaron los dos caminos contra `next build` +
`next start`:

| Escenario | Antes | Ahora (verificado) |
|---|---|---|
| Supabase OK | 24 tarjetas | 24 tarjetas, «29 resultados» |
| Supabase caído en el render del servidor | «No hay productos en esta categoría» (mentira, cacheada 10 min) | «No pudimos cargar el catálogo · Reintentar» |
| JS deshabilitado / hidratación lenta | texto vacío | esqueleto con estructura |

> Nota: el HTML del SSR prerenderizado en Vercel se regenera cada 600 s
> (`revalidate`), así que un fallo transitorio se «pegaba» hasta 10 minutos en
> el CDN. Con el nuevo camino, el cliente no espera a esa regeneración.

### 1.4 Otros dos bugs encontrados en la misma revisión

* **`/buscar` mostraba HTML escapado al usuario**: el contador se construía
  dentro de un template string dentro de JSX, así que se renderizaba
  literalmente `0 resultados para &ldquo;<strong>xiaomi</strong>&rdquo;`.
  Corregido con JSX real (`<strong>“xiaomi”</strong>`). Afectaba a todo el
  mundo, pero en móvil el texto ocupa 3 líneas y se parte.
* **Barra de estado del móvil de color equivocado**: `viewport.themeColor`
  era `#008080` (teal) mientras el manifest declara `#7B2D3B`. En Android la
  barra de estado salía teal y la PWA cambiaba de color al abrir. Unificado.

---

## 2. Seguridad

### 2.1 Estado (verificado en código)

| Área | Estado |
|---|---|
| `/api/admin/*` (34 rutas) | ✅ `requireAdmin()` → valida JWT con Supabase contra cookies + `ADMIN_EMAILS` (el `adminEmail` del body ya no se usa) |
| Créditos (`/api/comprar-creditos`) | ✅ userId de la sesión, paquete validado contra allowlist, precio derivado en servidor, comprobante validado |
| Chat (`/api/enviar-mensaje`) | ✅ `requireUser` + valida pertenencia a la conversación + rate limit |
| Subida R2 | ✅ sesión + key obligada a `{userId}/…` + content-types permitidos + rate limit |
| Sesión | ✅ modelo de un solo dueño del refresh token (navegador) con sincronización vía `/api/auth/session` (rechaza tokens con < 60 s de vida) |
| Rate limiting | ✅ login (por IP), register, password-reset, contacto, mensajes, favoritos, R2, push, Telegram; RPC atómico y *fail-closed* |
| Headers | ✅ HSTS, CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, `frame-ancestors 'none'`, `form-action 'self'`, `object-src 'none'` |
| RLS / SQL | ✅ migraciones `023_fix_seguridad` (RPCs comparan `auth.uid()`), `202608010001…007` |
| Secretos | ✅ ninguno en el repo; `.env*` ignorado |
| Open redirect | ✅ `getSafeRedirectPath` + tests |
| Service Worker | ✅ solo intercepta navegaciones públicas; no cachea APIs ni rutas privadas; limpia caches `vendet-*` al cerrar sesión |
| XSS | ✅ 14 `dangerouslySetInnerHTML`, todos con `JSON.stringify` de datos del servidor o el script de consentimiento (estático) |

### 2.2 Hallazgos abiertos (no bloqueantes, recomendados)

| # | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| S1 | ✅ Resuelto | `/api/contacto` limitaba sólo por IP: un bot con IPs rotativas llenaba el buzón. | Rate limit **también por email** (`contacto:email`, 5/h, normalizado a minúsculas) y ambas comprobaciones deben pasar. La validación corre **antes** del rate limit para no crear claves basura con valores arbitrarios del cliente. Ver §2.4. |
| S2 | ✅ Resuelto | **Más amplio de lo documentado**: no era sólo `/api/login`, sino **4 endpoints** (login, contacto, publicar, comprar-creditos) que usaban el header `x-forwarded-for` **entero** como identificador. Como es una lista (`cliente, proxy1, proxy2`), dos peticiones del mismo cliente detrás de proxies distintos generaban claves distintas y el límite se podía esquivar. | Todos pasan por `getClientIp()`, que toma el primer salto, **valida formato** y cae a `x-real-ip` / `cf-connecting-ip`. Ver §2.4. |
| S3 | ✅ Resuelto | `/api/datos-pago` (endpoint huérfano) exponía la cuenta de Pago Móvil del administrador. **Corrección de criterio:** los datos de cobro *deben* ser públicos — son una dirección a la que transferir, y el flujo es pagar → comprobante → aprobación. Ocultarlos rompería la compra y además son visibles en el bundle del cliente. El riesgo real es la **suplantación**, no la visibilidad. | Se **eliminó el endpoint** (no lo llamaba nadie, usaba `SERVICE_ROLE_KEY` y tenía fallback hardcodeado) y se añadió un **aviso antifraude** junto a los datos en el modal de `/creditos`. Ver §2.3. |
| S4 | ⚪ Baja | CSP con `'unsafe-inline'` y `'unsafe-eval'` en `script-src`. | Migrar a *nonces* (`middleware` ya existe) para endurecerla. |
| S5 | ✅ Resuelto | `/api/tasa-bcv` devolvía `429` **con uso normal**, no sólo bajo ataque: el límite es de 60/h **por IP** y una IP pública es una oficina entera compartiendo NAT. Además, `actualizarTasaClient()` pedía la tasa en **cada montaje ignorando la caché que tenía al lado** (2 peticiones por visita al dashboard, 1 por ficha de producto). | Un único camino de red (`fetchTasaConCache`), caché real de 15 min, deduplicación de peticiones concurrentes, `Cache-Control` en el endpoint y última tasa conocida como red de seguridad ante 429/5xx. Ver §2.6. |

### 2.3 Aviso antifraude en la compra de créditos (S3)

Los datos de Pago Móvil (`04126443099`) y Binance ID (`204147542`) **siguen
siendo públicos a propósito**: son la dirección de cobro. Están además en el
bundle del cliente, así que "protegerlos" en el servidor no aportaría nada.

El vector de ataque real es que un tercero escriba a un usuario por el chat
diciendo que es del equipo y le dé **su** número. Por eso:

- El aviso va **dentro del mismo bloque** que los datos, antes de la lista de
  instrucciones: se lee antes de copiar el número, no en otra página.
- Menciona explícitamente el fraude por chat.
- Recuerda pagar el monto exacto en Bs (que es lo que se revisa al aprobar).
- La cuenta va marcada como "Cuenta oficial".
- `role="note"` + iconos `aria-hidden`: accesible sin ruido para lectores.

Contraste medido: `amber-900` sobre `amber-50` = **8.75:1** (AA y AAA).
Cubierto por `tests/unit/creditos-aviso-fraude.test.ts` (6 casos).

### 2.4 Rate limiting endurecido (S1 + S2)

**S2 — la IP se usaba mal.** `x-forwarded-for` no es una IP: es una lista
`cliente, proxy1, proxy2`. Cuatro endpoints la usaban entera como clave, así
que la misma persona detrás de distinta cadena de proxies generaba claves
distintas y el límite se esquivaba. Además, `x-forwarded-for: <basura>` de un
cliente forzaba esa basura como identificador.

`getClientIp()` ahora: toma el **primer salto**, lo **valida** con
`/^[0-9a-fA-F:.]{3,45}$/`, cae a `x-real-ip` y luego a `cf-connecting-ip`, y
si nada sirve devuelve `unknown`. Probado con 8 casos (IPv4, IPv6, espacios,
basura, string de 80 caracteres, sin headers).

**S1 — faltaba el límite por email.** Un bot con IPs rotativas podía inundar
el mismo buzón. Ahora `/api/contacto` comprueba dos claves en paralelo
(`contacto:send` por IP y `contacto:email` por email, 5/h) y **ambas deben
pasar**. El email se normaliza a minúsculas (`Ana@X.com` y `ana@x.com` son la
misma clave).

Orden corregido: la **validación va antes** del rate limit. Si se limitara
primero con un valor sin validar, un cliente podría crear filas de rate limit
con claves arbitrarias sin tope. También un body JSON inválido ahora devuelve
**400** en vez de 500.

**Nota de despliegue:** esto asume que el proxy de la plataforma (Vercel)
controla el primer valor de `x-forwarded-for`. Si algún día se pone otro proxy
delante, ese proxy debe **sobrescribir** el header, no añadirse.

### 2.5 `middleware.ts` → `proxy.ts` (Next 16)

Next 16.2.12 renombra la convención: `src/proxy.ts` con la función exportada
como `proxy`. Se migró conservando el matcher y el comportamiento (sólo
routing de next-intl + header de locale). El build lo sigue marcando como
`ƒ Proxy (Middleware)` y las rutas con prefijo de idioma (`/`, `/en`,
`/en/catalogo`) responden 200.

### 2.6 Tasa BCV: caché de cliente y degradación sin 429 (S5)

**El 429 no era un ataque, era arquitectura.** El endpoint tiene un límite de
60 peticiones por hora **por IP** (`src/lib/rate-limit.ts`). En Venezuela una
IP pública suele ser un edificio, una oficina o una familia entera saliendo por
el mismo NAT, así que la cuota se agotaba con tráfico legítimo y el usuario
veía la tasa de contingencia sin entender por qué.

El tope real no estaba en el servidor, sino en el cliente:
`actualizarTasaClient()` **siempre** hacía `fetch('/api/tasa-bcv')` en el
montaje, ignorando el `localStorage` que tenía justo al lado. Resultado: 2
peticiones por visita al dashboard y 1 por cada ficha de producto, multiplicado
por cada usuario detrás de esa IP.

**Qué cambió**

- **Un solo camino de red.** Las dos funciones de cliente se colapsaron en
  `fetchTasaConCache()`; `actualizarTasaClient()` queda como *alias
  deprecado*, para no tocar a sus consumidores pero garantizando que ya no
  existe una segunda ruta que se salte la caché.
- **Caché por antigüedad, no por fuente.** El bug sutil: la comprobación era
  `cached.fuente === 'api'`. Si el proveedor no respondía en esa petición, la
  tasa se guardaba con `fuente: 'fallback'`; en el siguiente montaje la caché
  estaba **fresca** pero la condición fallaba y se pedía de nuevo. Ahora la
  única pregunta es `edadMs < 15 min`.
- **Deduplicación.** Un módulo con una única promesa en vuelo
  (`tasaEnVuelo`) evita que varios componentes montando a la vez disparen
  peticiones en paralelo.
- **Red de seguridad.** Ante 429, 5xx, `AbortSignal` o red caída se devuelve
  **la última tasa conocida**, no el 746 fijo. Mejor una tasa de hace 20
  minutos (y refrescada justo después) que un número inventado.
  `getTasaBCVClient()` también devuelve el valor caducado si existe.
- **Caché de CDN.** El endpoint responde
  `Cache-Control: public, s-maxage=900, stale-while-revalidate=3600`, de modo
  que Vercel sirve la tasa desde el borde y las peticiones ni siquiera llegan a
  contar contra el límite por IP.
- **Validación del proveedor.** `fetchFromAPI()` acepta tanto la lista de
  casas como la forma `{ promedio }` y sigue descartando cualquier valor
  `<= 10` (el bolívar no baja de ahí desde 2021), así un dato corrupto nunca
  se propaga.

**Verificación**

| Escenario | Resultado |
|---|---|
| Primera visita a `/creditos` | 1 petición, caché escrita |
| Recarga con caché fresca | **0 peticiones** |
| Caché caducada (16 min) | 1 petición de refresco, `timestamp` renovado |
| Endpoint en 429 con tasa real caducada (812,50) | muestra **812,50**, no el 746 |
| 429 / offline | sin mensaje de error visible al usuario |
| `/dashboard` primera visita | 1 petición (antes 2) |
| `/dashboard` recarga | **0 peticiones** |

`tests/unit/tasa-bcv-cache.test.ts` cubre los 12 casos (frescura, el bug de la
fuente, caducidad, 429, 5xx, offline, sin caché previa, concurrencia, JSON
corrupto y registro sin tasa). Suite total: **23 suites / 153 pruebas**.

> Nota de método: en las trazas del navegador aparecen **dos** entradas por
> recarga, pero sólo una es `resourceType: 'fetch'`; la otra es `'other'`, un
> prefetch del propio navegador que no ejecuta código de la aplicación. Contar
> peticiones sin separar por tipo lleva a diagnosticar un bug inexistente.

---

## 3. Rendimiento

### 3.1 Lo que estaba bien

* Inter autohospedada (woff2 local, `preload`), `compress`, `poweredByHeader:false`.
* `optimizePackageImports` (lucide, supabase) y solo 2 `cacheGroups` en webpack.
* Analytics / Speed Insights / SW / banners PWA montados tras `load` + `idle`.
* Root layout 100 % estático (sin `cookies()`/`headers()`).
* Imágenes AVIF/WebP, `minimumCacheTTL` 30 días, `deviceSizes` ajustados.

### 3.2 Lo corregido

| Problema | Impacto | Fix |
|---|---|---|
| `/[locale]/producto/[slug]` se renderizaba **dinámico** (SSR en cada visita y en cada rastreo de Google) porque `getFavoritosCount` no estaba memorizado | TTFB alto, más caro, peor LCP | `cache()` + `dynamic='force-static'` + `revalidate=300` → verificado `x-nextjs-cache: HIT`, `s-maxage=300` |
| `ProductoPageClient` usaba `useSearchParams()` solo para leer `?nuevo=1` | Forzaba render dinámico y obligaba a un `<Suspense>` extra | Lectura en `useEffect` (sin `useSearchParams`), se elimina el `Suspense` interno |
| Consultas a Supabase de relacionados/favoritos/reseñas sin timeout | Una Supabase lenta colgaba el render (504) | `withTimeout(…, 5 s)` + degradación (ficha sin relacionados antes que error) |
| Catálogo: 1 columna en móvil y primeras imágenes `lazy` | Sensación de «no carga» | 2 columnas + 2 primeras `eager` + `sizes` corregido |
| `<Suspense>` sin fallback en el catálogo | Pantalla en blanco | esqueleto real |
| Código muerto: `ProductCard` duplicado en `CatalogoPage.tsx` (nunca renderizado) | ~3,5 KB de JS por visita | eliminado |

### 3.3 Pendiente medido (no aplicado en esta rama)

* **JS inicial ≈ 710 KB sin comprimir** en `/es` (13 archivos). El mayor
  sospechoso es `@supabase/supabase-js` en páginas públicas: `Header`
  sólo lo importa dinámicamente si hay sesión, pero `SiteAnnouncement`,
  `useProductLoader` y `usePrefetch` lo arrastran. Meta razonable: < 400 KB.
  Plan: mover el loader del catálogo a `fetch('/api/productos')` (una ruta ya
  existente) para que el visitante anónimo no descargue el cliente de Supabase.
* El diccionario i18n (~90 KB) se envía completo al cliente vía
  `NextIntlClientProvider`; se puede recortar a los namespaces usados en cada
  página.

---

## 4. SEO

### 4.1 Lo que estaba bien

`robots.txt` único (con ambos sitemaps), `sitemap.xml` real desde fs + Supabase,
`sitemap-images.xml`, RSS `/feed.xml`, `noindex` en `/buscar` y en `/en`
(`X-Robots-Tag`), 404 reales (fin de los soft-404) desde `generateMetadata`,
`AggregateRating` solo con reseñas reales, JSON-LD de Product/Organization/
Breadcrumb/FAQ, canonical + hreflang por página.

### 4.2 Corregido

| Problema | Fix |
|---|---|
| Todas las variantes de filtros declaraban `canonical: https://vendet.online/catalogo` — Google rastreaba, filtraba y descartaba cada combinación | Solo la página 1 limpia mantiene la canonical; filtros y `?pagina=N` pasan a `robots: noindex, follow` (se siguen rastreando los enlaces a productos) |
| Canonical/hreflang absolutos con host hardcodeado en el catálogo | Rutas relativas resueltas contra `metadataBase` |
| `?categoria` llegaba sin codificar a la imagen OG | `encodeURIComponent` |
| La ficha de producto era dinámica → TTFB alto para Googlebot y sin caché de página | Ahora `force-static` + ISR 300 s (mejor rastreo, sin perder frescura) |

### 4.3 Recomendaciones (para el siguiente ciclo)

1. **`metadataBase` duplicado**: varias páginas usan `https://vendet.online`
   literal; unificar en una constante para evitar divergencias de canonical.
2. Las landing `/[ciudad]` y `/[ciudad]/[categoria]` siguen siendo **ƒ
   dinámicas** (documentado como intencional por el bug `DYNAMIC_SERVER_USAGE`);
   revisar si con `generateStaticParams` + `dynamicParams = true` ya se puede
   volver a ISR (serían ~2.600 URLs).
3. Enviar a GSC el `sitemap-images.xml` y comprobar la cobertura tras el deploy
   (habrá un pico de «excluidas por noindex» en URLs de filtros: es esperado).

---

## 5. Checklist operativo tras el merge

| # | Acción | Nota |
|---|---|---|
| 1 | Deploy en Vercel y probar `/catalogo` en un móvil real (o DevTools 3G lento) | El estado de error debe decir «Reintentar», nunca «No hay productos» |
| 2 | Confirmar en Vercel Logs que `/producto/[slug]` responde `x-nextjs-cache: HIT` | Antes era `MISS`/dinámico siempre |
| 3 | ~~Renombrar `src/middleware.ts` → `src/proxy.ts`~~ | **Hecho** (§2.5) |
| 4 | Revisar los hallazgos abiertos de seguridad (§2.2) | ~~S1~~ (§2.4), ~~S2~~ (§2.4), ~~S3~~ (§2.3), ~~S5~~ (§2.6) **hechos**. Queda S4 |
| 5 | Medir JS inicial con `npm run build:analyze` | Objetivo < 400 KB en páginas públicas |

---

## 6. Archivos tocados

```
src/app/[locale]/catalogo/page.tsx              SSR: ok/false, canonical condicional, skeleton de Suspense
src/app/[locale]/catalogo/CatalogoPage.tsx      autorrecuperación, estado de error, limpieza de código muerto
src/app/[locale]/catalogo/loading.tsx           columnas iguales al grid final
src/app/[locale]/buscar/BuscarClient.tsx        fin del HTML escapado visible
src/app/[locale]/producto/[slug]/page.tsx       ISR real (force-static + cache + timeouts)
src/app/[locale]/producto/[slug]/ProductoPageClient.tsx   sin useSearchParams
src/components/ProductCardLazy.tsx              sizes correcto, onError sin bucle
src/components/OptimizedProductGrid.tsx         2 columnas en móvil, eager en las 2 primeras
src/app/layout.tsx                              themeColor de marca
src/i18n/dictionaries/{es,en}.json              4 claves nuevas del catálogo
tests/unit/catalogo-movil.test.ts               8 tests de regresión
```
