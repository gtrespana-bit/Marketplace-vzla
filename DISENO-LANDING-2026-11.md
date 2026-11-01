# Revisión de diseño — Landing VendeT

Fecha: 2026-11-01
Alcance: portada (`/`), su *chrome* (header, footer, bottom nav, banner PWA, cookies, chat) y las landings de SEO que se abren desde ella (`/[ciudad]`, `/categoria/[categoria]`, `/[ciudad]/[categoria]`, `/blog`).

Método: lectura del código + captura y análisis del HTML servido (`next start` contra el mock de Supabase) + cálculo de contraste WCAG 2.1 con los hex reales del brand. **No se pudo usar un navegador real** en el entorno (falta `libnss3` y no hay red hacia los CDN de Chromium), así que la verificación visual se hizo sobre el DOM renderizado y las clases CSS efectivamente generadas.

---

## 1. Defectos encontrados y corregidos

### 1.1 Contraste (WCAG AA) — 26 botones/badges ilegibles
La causa raíz: el dorado del brand (`#C9A84C`) se usaba con **texto blanco**. Contraste real **2.29:1** (mínimo AA: 4.5:1). También aparecía `text-gray-900` (6.42:1, pasa) y `text-brand-dark` (5.48:1). Se normalizaron los 26 usos de `bg-brand-accent` + `text-white` a `text-brand-dark`, incluido el CTA "Publicar gratis" del hero, el botón de registro del header, los badges "Destacado" y los CTAs del catálogo.

| Combinación | Antes | Después |
|---|---|---|
| `text-white` sobre `brand-accent` | 2.29:1 ❌ | — |
| `text-brand-dark` sobre `brand-accent` | — | **5.48:1** ✅ |
| `text-green-500`+blanco (badge Boost) | 2.28:1 ❌ | `green-700` **5.02:1** ✅ |
| `text-amber-800` sobre `accent/20` | 1.03:1 ❌ | `text-brand-dark` sobre `accent/25` **9.69:1** ✅ |
| precio de vendidos en `gray-400` | 2.54:1 ❌ | `brand-primary` **9.21:1** ✅ |
| `text-brand-accent` sobre `accent/20` (chip de blog) | ~1.0:1 ❌ | `brand-dark` sobre `accent` **5.48:1** ✅ |

También se corrigieron textos secundarios sobre fondo claro (`gray-400` → `gray-600/500`) en catálogo, vendedor y ficha.

### 1.2 Clases Tailwind que no existían (19 sitios)
`hover:bg-accent/90` se usaba en 19 botones (header, catálogo, publicar, blog, boost, cookies…) pero **`accent` no existía en `tailwind.config.js`**: Tailwind no generaba la regla y el hover no hacía nada. Además `/90` aclaraba el dorado en vez de oscurecerlo (comportamiento erróneo). Se añadió la escala corta (`accent`, `accent-dark` = `#B8963F`) y se usó `hover:bg-accent-dark`.

Verificación automática: se compilaron las clases usadas en el HTML servido contra las definidas en el CSS compilado. **0 clases inexistentes** en `/`, `/caracas`, `/categoria/vehiculos`, `/catalogo`, `/blog`, `/creditos`, `/como-funciona`.

### 1.3 Hero mal centrado (el problema que reportó el usuario)
El bloque de texto era hijo directo de un `grid` con `items-center`: el texto estaba centrado **dentro de una columna que ocupaba todo el ancho**, dejando un hueco gris a la derecha en tablet/desktop y con el contenido pegado a la izquierda en `lg`. Cambios:

- La columna pasa a `flex flex-col items-center text-center xl:items-start xl:text-left` (centrado real, alineado a la izquierda sólo cuando ya hay collage).
- Los bloques de ancho limitado llevan `w-full max-w-*` para que no se estiren ni se salgan del eje: chip (`self-center`, antes se iba a la izquierda), H1 (`max-w-2xl text-balance`), subtítulo, buscador y stats.
- **El collage se solapaba con el texto**: en `lg` (1024 px) la columna queda en ~560 px y el collage mide ~448 px reales con las tarjetas rotadas, así que el precio de la tarjeta superior caía sobre el titular. Ahora el collage sólo aparece en `xl` (≥1280 px) y el grid de 2 columnas también. En `lg` el hero es una columna centrada.

### 1.4 Grids de producto
- "Recién publicado" y "Destacados" eran `grid-cols-1` en móvil: 8 tarjetas a pantalla completa, scroll interminable, y **el mismo patrón del bug de catálogo ya corregido**. Ahora `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` en las tres secciones.
- `sm:grid-cols-2` redundante en "Lo más visto" eliminado.
- Se dejó **una sola imagen con `priority`** (antes dos): el hero no tiene LCP de imagen y dos preloads competían por el LCP.

### 1.5 `blurDataURL` inválido (3 sitios)
Se pasaba `blurDataURL="/placeholder-product.webp"` — una **ruta**, no una data URL. El navegador no puede decodificarla, así que el efecto *blur* nunca se veía. Se añadió `src/lib/image-placeholder.ts` con un JPEG base64 de 4×3 px (~600 bytes).

### 1.6 El footer desaparecía en móvil
`<footer class="hidden md:block">` + `pb-20`: en móvil no había footer, sólo una **banda oscura vacía de 80 px** al final de cada página (el padding del bottom nav, sin contenido). Se añadió un footer móvil real (marca, descripción, enlaces legales, copyright) y se quitó el padding muerto. Además `mt-auto` no funcionaba porque el `<footer>` no era hijo de ningún *flex*: `SiteChrome` ahora usa `flex min-h-screen flex-col` con `<main class="flex-1">`, así que en páginas cortas el footer se ancla abajo.

### 1.7 Elementos flotantes pisados / mal anclados
- **Banner PWA** a `bottom-4` con `z-60`: quedaba **dentro** de la zona del bottom nav (`z-50`, 64 px) y el botón "Instalar" se veía cortado. Ahora `bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]` en móvil.
- **La X del banner** usaba `absolute` sin que el contenedor fuera `relative`: se anclaba al **viewport** (arriba a la derecha de la pantalla), no a la tarjeta.
- **Chat flotante** (`FloatingChat`) dependía de `.floating-chat`, que sí existe, pero usaba la marca vieja **"TA"** (Todo Anuncios) y un azul fuera de paleta. Sustituido por el logo real y colores del brand; también se le dio offset sobre el bottom nav.
- **CTA final** (`bg-brand-accent`): en móvil el bottom nav tapaba el último bloque; ahora `pb-24 md:py-20`.

### 1.8 Marca vieja "TA"
`PWAInstallBanner` mostraba un cuadrado con **"TA"** (marca muerta de "Todo Anuncios") en dos sitios; `FloatingChat` en un tercero. Sustituidos por `/logo-vendet.webp`.

### 1.9 Fuga de i18n y datos inventados
- `🔥 Trending` estaba **hardcodeado** en inglés dentro de la sección "Lo más visto"; ahora usa `t('home.trending.chip')` y un icono `TrendingUp` en lugar del emoji.
- `'Venezuela'` hardcodeado en vendidos → `t('home.sold.venezuela')`.
- **`+5K` era un número inventado** en los stats del hero. Ahora se consulta el conteo real de `perfiles` (con `cache()` + timeout de 4 s) y, si no hay dato, se cae a un beneficio verificable ("24/7") en vez de una cifra falsa.

### 1.10 Consistencia visual
- **Azules fuera de paleta** en pleno brand vino+dorado: `to-blue-700`, `text-blue-100/blue-50` en el hero de categoría y `text-blue-200` en el blog. Reemplazados por blanco con opacidad y el degradado del brand; se añadió un halo dorado decorativo coherente con el resto.
- **Jerarquía tipográfica**: los `h2` de sección mezclaban `text-2xl` con `text-2xl md:text-3xl`; unificados a `text-2xl md:text-3xl font-black`.
- **Ritmo vertical**: se mezclaban `py-8`, `py-10`, `py-12` y `py-16` sin sistema; normalizado a `py-10 md:py-14` (y `py-14 md:py-20` en el CTA final).
- **Cabeceras de sección** sin `flex-wrap`: en móvil el enlace "Ver todos" / badge se montaba sobre el título. Corregido en las cuatro secciones.
- **Categorías**: 6 en fila dejaban tarjetas de ~180 px con la descripción cortada (`truncate` → "Vehícul…"). Ahora `line-clamp-2`, icono en pastilla y `hover:-translate-y-0.5`.
- **Todas las tarjetas de "Destacados"** llevaban borde dorado grueso: si todas destacan, ninguna destaca. El badge de la sección ya lo comunica.
- **Tarjetas de las landings de ciudad/categoría**: `<Image width={300} height={300}>` con `w-full h-full` **deformaba** las fotos (no era `fill`), sin `sizes` y con `placeholder="blur"` sin `blurDataURL`. Además había un `<div>` vacío con un emoji fantasma como *fallback* y se pintaba `"usado · undefined"` cuando faltaba la subcategoría. Reescritas con `fill`, `sizes`, blur real, *fallback* al placeholder y metadatos filtrados.

### 1.11 Seguridad relacionada con el diseño de imágenes
`images.dangerouslyAllowSVG: true` en `next.config.js`. Las fotos de producto las sube el vendedor: un SVG con `<script>` servido desde `/_next/image` es **XSS almacenado** en el dominio del sitio. Puesto a `false`.

---

## 2. Herramientas de verificación

Se amplió el mock de Supabase (`/mock-supabase`, fuera de Git) para poder ver las secciones que dependen de datos que antes no existían:

- `rpc('obtener_destacados_home')` → ahora responde (antes 404 → "Destacados" **nunca** se pintaba en local).
- Productos con `destacado` y `vendido` para verificar esas secciones.
- `order=col.desc.nullslast` soportado (PostgREST), necesario para "Vendidos".

Resultado en el HTML servido: **las 7 secciones se renderizan** (`Explora por categoría`, `Recién publicado`, `Destacados`, `Lo más visto`, `Vendidos recientemente`, `Vende en 3 pasos`, `¿Tienes algo para vender?`), 16 productos enlazados, 0 clases CSS inexistentes, 0 tokens corruptos (`&ldquo;`, `undefined` visible, `NaN`, `{count}`).

## 3. Estado de las comprobaciones

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` | 0 errores |
| `eslint .` | 0 errores / 5 warnings preexistentes |
| `npm test` | 17 suites, **108/108** tests |
| `npm run build` | OK, 181 rutas |
| Rutas servidas | `/`, `/en`, `/caracas`, `/categoria/vehiculos`, `/catalogo`, `/buscar`, `/blog`, `/creditos`, `/como-funciona` → 200 |
| Contraste | pares corregidos ≥ 4.5:1 |
| Catálogo móvil | **sin regresión** (2 columnas, SSR 24 tarjetas) |

## 4. Pendiente / fuera de alcance

- **No se pudo ver con navegador real**: falta `libnss3` y no hay egress a los CDN de Chromium. La comprobación es sobre DOM + CSS compilado; conviene una pasada visual en un dispositivo real (sobre todo el collage en `xl` y el safe-area en iPhone con notch).
- ~710 KB de JS inicial en páginas públicas (documentado en `REVISION-2026-11.md`).
- `middleware.ts` → `proxy.ts` (deprecación de Next 16).
- `[ciudad]`, `[ciudad]/[categoria]` y `vendedor/[id]` siguen siendo dinámicas (ƒ).
- El panel `/admin` mantiene su propia paleta (azules incluidos): es una app interna, no forma parte del sitio público.
