# Análisis SEO — VendeT.online (Marketplace Venezuela)

Análisis técnico y on-page del repositorio. Enfoque: posicionar para **Venezuela** (es‑VE),
sin pequeñeces. Los hallazgos están priorizados por impacto real sobre indexación,
crawl budget, velocidad y visibilidad en Google.

> **Estado:** ✅ Los 3 puntos críticos (1, 2 y 3) ya fueron aplicados en el código (ver notas `Aplicado` en cada uno).

> **Lo bueno que ya tienes (no rompas esto):**
> - URLs semánticas de producto (`/producto/iphone-15-caracas-…`) con 301 desde UUID legacy.
> - Un único `sitemap.ts` + `robots.ts` centralizados (bien comentado, `/buscar` se rastrea pero noindex).
> - 330 landing pages de ciudad generadas programáticamente + ciudad/categoría.
> - Structured data bien cubierto: `Product`, `ItemList`, `BreadcrumbList`, `City`, `Article`, `FAQPage`, `WebSite+Organization`, `AggregateRating` en vendedores.
> - SEO local real: `geo.region=VE`, `geo.placename=Venezuela`, `language=Spanish`, hreflang `es-VE`, precios en USD + Bs.
> - Seguridad/perf: cabeceras completas, fuentes locales, `next/image` con AVIF/WebP, splitChunks optimizado.

---

## 🔴 CRÍTICO — corregir primero (impacto directo en ranking/crawl)

### 1. Taxonomía de categorías rota: el sitemap genera páginas que no existen en el sitio
**Archivos:** `src/lib/ubicaciones-seo.ts` (`CATEGORIAS_POPULARES`), `src/app/[locale]/[ciudad]/[categoria]/page.tsx` (`CATEGORIAS_SEO`), `src/lib/categorias.ts` (categorías reales).

Hay **tres listas distintas de categorías** que no coinciden:

| Origen | Slugs |
|---|---|
| Categorías REALES del catálogo (`categorias.ts`, header, footer, publicar) | vehiculos, tecnologia, moda, hogar, herramientas, repuestos, materiales, otros |
| Sitemap (`CATEGORIAS_POPULARES`) | vehiculos, **inmuebles, electronicos, deportes, empleo, servicios** |
| Landing ciudad/categoría (`CATEGORIAS_SEO`) | vehiculos, tecnologia, moda, hogar, herramientas, materiales, repuestos, otros |

**Consecuencia:** el sitemap envía a Google ~**5.280 URLs** (330 ciudades × 8 categorías × 2 idiomas) para categorías que **no existen** en el marketplace (`inmuebles`, `electronicos`, `deportes`, `empleo`, `servicios`). Esas landing salen con título genérico de fallback, no filtran productos reales y quedan como contenido delgado/duplicado → **crawl budget desperdiciado y páginas de baja calidad**. Y al revés: las categorías que sí existen y más se buscan (`tecnologia`, `herramientas`, `materiales`, `repuestos`, `otros`) **no** se generan como páginas locales.

**Fix:** unificar en una sola fuente (idealmente derivar de `categorias.ts`) y usar esos 8 slugs reales tanto en el sitemap como en la landing. Esto de paso libera presupuesto para las páginas que sí posicionan.

**✅ Aplicado:** `CATEGORIAS_POPULARES` en `src/lib/ubicaciones-seo.ts` ahora usa los 8 slugs reales (vehiculos, tecnologia, moda, hogar, herramientas, materiales, repuestos, otros), coincidiendo con `categorias.ts`, el header/footer y la landing `[ciudad]/[categoria]`. El sitemap ya no genera URLs de categorías inexistentes.

---

### 2. Títulos duplicados por el template del layout raíz + marca inconsistente
**Archivos:** `src/app/layout.tsx` (definir `title.template`) y las `page.tsx`.

El layout raíz define `title: { template: '%s | VendeT' }`. En Next.js ese template se aplica a **todos** los títulos de páginas hijas que definen `title` como string. Pero casi todas las páginas ya ponen el sufijo de marca en el propio string:

- `faq`: `"Preguntas Frecuentes — VendeT-Venezuela"` → en realidad renderiza `"Preguntas Frecuentes — VendeT-Venezuela | VendeT"`
- `catalogo`: `"... | VendeT-Venezuela"` → `"... | VendeT-Venezuela | VendeT"`
- producto: `"iPhone 15 — $800 — Caracas, Distrito Capital — VendeT-Venezuela | VendeT"`

Además hay **3 nombres de marca distintos** (VendeT / VendeT-Venezuela / VendeT.online) que diluyen el brand equity y recortan el título útil (Google corta ~60 caracteres en móvil).

**Fix:** quitar el sufijo de marca de cada `title` y dejar que el template raíz agregue uno solo ("| VendeT"). En producto, mantener precio + ciudad al inicio y recortar el título del anuncio.

**✅ Aplicado:** Se eliminó el sufijo de marca de los `title`/`openGraph` de: home, catálogo, producto, vendedor, blog, blog/[slug], ciudad, ciudad/categoría, faq, contacto, como-funciona, sobre-nosotros, términos, privacidad, como-instalar-app, eliminar-cuenta. El template raíz (`%s | VendeT`) ahora agrega la marca una sola vez. También se unificó el nombre de marca a "VendeT" (se quitaron los "VendeT-Venezuela" y "VendeT.online" de títulos/siteName).

---

### 3. Páginas de producto sin caché: SSR dinámico + query a DB en cada visita
**Archivo:** `src/app/[locale]/producto/[slug]/page.tsx` (no tiene `export const revalidate`).

Es la página más importante para SEO (es la que entra a posicionar por producto) y **cada request** —cada visita y cada rastreo de Google— ejecuta 1–2 queries a Supabase con TTFB alto. El equipo ya resolvió esto en la home (`revalidate = 120`), catálogo (`600`) y vendedor (`300`), pero **producto quedó sin ISR**. En Venezuela, con conexiones lentas y móviles, esto es crítico para Core Web Vitals y para que Google pueda rastrear muchos productos sin matar el servidor.

**Fix:** añadir `export const revalidate = 300` (ISR *on-demand*, sin `generateStaticParams` — ese fue justo el bug de 500 que ya resolvieron yendo a SSR dinámico).

**✅ Aplicado:** se añadió `export const revalidate = 300` en `src/app/[locale]/producto/[slug]/page.tsx`, coherente con home (120) y catálogo (600). Sin `generateStaticParams` para no reintroducir el bug de `DYNAMIC_SERVER_USAGE`.

---

## 🟠 ALTO — mejorar para no quedar atrás de la competencia

### 4. ~5.900 URLs locales con contenido delgado
`330 municipios × (1 ciudad + 8 categorías) × 2 idiomas`. Las landing de ciudad muestran solo 24 productos o el estado vacío *"Aún no hay anuncios en X"* (ver `LandingCiudad.tsx`). Muchas ciudades pequeñas tendrán 0 productos → páginas casi vacías indexables. Google puede ignorarlas o marcarlas como thin content.

**Fixes combinables:**
- Sitemap: solo incluir combinaciones ciudad/categoría con contenido real (productos activos).
- `noindex,follow` en las landing vacías ("Aún no hay anuncios") y activar indexación cuando tengan contenido.
- Enriquecer con copy único por ciudad + sección FAQ local + enlaces a categorías (menos plantilla, más texto real).

### 5. Duplicado completo `/en` de contenido en español
Los productos y el blog están en español pero se sirven también bajo `/en/producto/…` y `/en/blog/…` con hreflang. Google verá el mismo texto en español bajo URLs "inglesas" → riesgo de duplicado y señal de idioma confusa. Para un marketplace **exclusivo de Venezuela (es-VE)**, `/en` aporta poco.

**Fix:** quitar `/en` del sitemap y del hreflang de las páginas de contenido (productos/blog), o mejor aún, `noindex` el `/en` de contenido. Mantener `/en` solo en las páginas realmente traducidas (home, catálogo y las informativas si están traducidas).

### 6. Páginas informativas sin canonical / hreflang / Open Graph
`faq`, `contacto`, `como-funciona`, `sobre-nosotros`, `terminos-y-condiciones`, `politica-de-privacidad`, `eliminar-cuenta`: solo definen `title` + `description`. No emiten `canonical` propio, ni `hreflang` es/en, ni `og:image`. Están en el sitemap en ambos idiomas pero sin señales que las relacionen → soft-duplicate potencial con su versión `/en`.

**Fix:** replicar el patrón ya usado en `/catalogo` y `/blog`: `alternates.canonical` + `alternates.languages` + `openGraph`.

---

## 🟡 MEDIO — pulir para exprimir el CTR y el SEO local

### 7. H1 de la home desaprovechado
El H1 es *"Vende rápido en Venezuela"*. La query principal por la que quieres posicionar ("clasificados venezuela", "compra venta venezuela") está en el `<title>` pero no en el H1. Un H1 tipo *"Clasificados en Venezuela — Compra y Venta"* o *"El marketplace de Venezuela"* refuerza el tema de la home con costo cero (solo copy en `src/i18n/dictionaries/es.json`).

### 8. Structured data: detalles que hacen la diferencia en CTR
Ya hay buen marcado. Mejorar:
- `Product.offers.availability` se fija siempre `InStock` aunque el producto esté vendido/inactivo (`page.tsx` de producto) → poner `OutOfStock` según `estado`.
- Añadir `dateModified` y `priceValidUntil` en el `Offer`.
- Verificar con [Rich Results Test](https://search.google.com/test/rich-results) que `Product` y `AggregateRating` (vendedor) pasen sin errores.

### 9. Verificación y configuración en Google Search Console
La verificación meta depende de la env var `GOOGLE_SITE_VERIFICATION` (`src/app/layout.tsx`). Confirmar que está seteada o verificar por DNS. Luego: enviar `sitemap.xml`, monitorear **Coverage** para las páginas ciudad/categoría (ver punto 4) y validar que `robots.txt` no bloquee nada público.

### 10. Internal linking a las landing locales es débil
El footer enlaza solo 6 ciudades a `/ciudad` y las categorías del footer/header apuntan a `/catalogo?categoria=X` (que canonicaliza a `/catalogo`). Las landing `/ciudad/categoria` (las que sí posicionan) casi no reciben enlaces internos: están solo en el sitemap. Enlazar desde la página de ciudad a sus categorías y desde el footer a más ciudades reforzaría el SEO programático.

### 11. Imágenes Open Graph duplicadas
`catalogo/opengraph-image.tsx` y `producto/[slug]/opengraph-image.tsx` quedan opacadas por el `openGraph.images` que define `generateMetadata` (que sí genera las imágenes dinámicas). Mantener la generación de OG en **un solo lugar** para evitar confusión y coste de edge function innecesario.

---

## Checklist rápido de acción (orden sugerido)

1. Unificar las categorías en una sola lista y corregir el sitemap → **repara ~5.280 URLs muertas**.
2. Quitar el doble sufijo de marca de los títulos y unificar la marca a "VendeT".
3. Añadir `revalidate` a `/producto/[slug]` → **baja el TTFB** de la página que más importa.
4. `noindex` o retirar del sitemap las landing locales sin contenido.
5. Limpiar el duplicado `/en` de productos/blog.
6. Completar metadata (canonical/hreflang/OG) en las páginas informativas.
7. Ajustar el H1 de la home a la query principal.
8. Verificar GSC + enviar sitemap + revisar Coverage.
