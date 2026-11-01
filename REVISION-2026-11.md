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
| S1 | 🟡 Media | `/api/contacto` limita por IP pero no valida que el campo `email` sea de un dominio real; un bot con IPs rotativas puede llenar el buzón. | Añadir rate limit también por email + cap diario global; captcha si aparece abuso. |
| S2 | 🟡 Media | `/api/login` toma la IP de `x-forwarded-for` sin normalizar; en Vercel llega bien, pero aceptar el header tal cual permite *spoofear* la IP si algún día se despliega detrás de otro proxy. | Usar el primer valor de la lista o el `x-real-ip` de la plataforma, y documentar la dependencia. |
| S3 | 🟡 Media | `/api/datos-pago` es público y expone la cuenta de Pago Móvil del administrador (necesario para cobrar, pero es un objetivo de fraude). | Servir solo para usuarios autenticados, o mostrar los datos parcialmente (…últimos 4 dígitos) hasta que el usuario inicie sesión. |
| S4 | ⚪ Baja | CSP con `'unsafe-inline'` y `'unsafe-eval'` en `script-src`. | Migrar a *nonces* (`middleware` ya existe) para endurecerla. |
| S5 | ⚪ Baja | `/api/tasa-bcv` responde `429` cuando el rate limit se dispara; el cliente no reintenta. | Cachear en cliente 15 min (ya existe `getTasaBCVClient`) y servir la última tasa conocida. |

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
| 3 | Renombrar `src/middleware.ts` → `src/proxy.ts` | Next 16 lo marca deprecado; funciona hoy, pero deja de funcionar en la próxima major |
| 4 | Revisar los 5 hallazgos abiertos de seguridad (§2.2) | S3 (datos de pago) es el más sensible |
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
