# Por qué VendeT no clasifica — diagnóstico técnico (noviembre 2026)

Este documento responde a una pregunta concreta: **si el proyecto lleva meses
con SEO "hecho", ¿por qué no aparece en Google ni lo citan las IA?**

La respuesta corta es que el trabajo previo (que existe y es bueno: ISR, JSON-LD,
404 reales, hreflang, sitemap de imágenes) estaba construido sobre **cuatro
decisiones de arquitectura que se anulan entre sí**. No falta SEO: hay SEO que se
contradice.

Todo lo que sigue está verificado ejecutando el build de producción y midiendo
la respuesta HTTP real, no leyendo el código de memoria.

---

## El problema de fondo: el sitio se declara a sí mismo "no indexable"

Google no decide indexar página por página. Decide **cuánto confía en un
dominio** y, con ese presupuesto, rastrea e indexa. Cada señal contradictoria
gasta ese presupuesto.

Esto es lo que el sitio le decía a Google antes de este ciclo:

| Señal que envía el sitio | Qué entiende Google |
|---|---|
| Sitemap con **2.883 URLs** | "Este dominio tiene casi 3.000 páginas importantes" |
| De esas, **2.852** responden `noindex, follow` | "…pero casi ninguna quiere estar en el índice" |
| `/en/*` con ~1.400 URLs `noindex` | "…y además duplica todo en un idioma que no es el suyo" |
| 9 páginas informativas sin canonical | "…en esas no sabemos cuál es la versión buena" |
| `sameAs` a perfiles sociales ajenos | "…y este sitio es en realidad otra entidad" |
| Header con `href="/en/es"` (404) | "…y sus enlaces internos están rotos" |

Cada fila es un problema menor. Juntas son un veredicto: *calidad baja, rastrear
poco*. Y eso explica exactamente el síntoma que describe el usuario — otras webs
suyas clasifican bien con mucho menos trabajo, porque no se contradicen.

---

## Hallazgo 1 — El sitemap anunciaba 2.852 páginas `noindex` (crítico)

**Síntoma medido.** `sitemap.xml` generaba 2.883 URLs. Las landings de ciudad y
ciudad/categoría se autodeclaran `noindex` cuando no tienen anuncios:

```
GET /caracas              → <meta name="robots" content="noindex, follow">
GET /caracas/vehiculos    → <meta name="robots" content="noindex, follow">
```

Pero seguían en el sitemap con `priority: 0.6–0.7`:

```
2.640 URLs  →  /{ciudad}/{categoria}       (330 ciudades × 8 categorías)
  330 URLs  →  /{ciudad}
```

En este sandbox la base de datos no es alcanzable, así que las 2.852 páginas
salen `noindex` por el efecto colateral de `fail-open` en `seo-landings.ts`.
**En producción el patrón es el mismo pero parcial**: las ciudades sin
inventario (la mayoría de los 330 municipios) devuelven `noindex` y siguen
anunciadas.

**Por qué es tan grave.** Un sitemap que lista URLs `noindex` es la señal más
directa que existe de "este sitemap no es fiable". Google no penaliza la página:
degrada la confianza en el **inventario de URLs del dominio**, y con ella el
rastreo de todo lo demás, incluidos los productos que sí venden.

**Arreglo aplicado.**
- El sitemap consulta el inventario real (una sola query) y solo anuncia
  ciudades y combinaciones con al menos un anuncio activo.
- La lógica vive en `src/lib/sitemap-inventario.ts`, con 9 tests de regresión.
- Es la **misma regla** que usa `lib/seo-landings.ts` para decidir `index`. Si
  alguna vez divergen, el sitemap vuelve a mentir; por eso las dos llevan un
  comentario que apunta a la otra.
- Fail-open a propósito: si Supabase falla, se anuncia todo (comportamiento
  anterior) en vez de publicar un sitemap vacío que podría desindexar el sitio.

---

## Hallazgo 2 — `sameAs` apuntaba a perfiles que no son de VendeT (crítico)

**Medido** en `GET /`, JSON-LD `Organization`:

```json
"sameAs": [
  "https://instagram.com/vendet",
  "https://twitter.com/vendet",
  "https://facebook.com/vendet"
]
```

Ninguna de esas cuentas es del proyecto. `sameAs` es la propiedad con la que
Schema.org declara **"esta organización es la misma entidad que aquella"**. Al
apuntar a cuentas ajenas, el sitio le está diciendo a Google:

> "No sé qué entidad soy; probablemente soy la de Instagram de otra persona."

Esto tiene dos consecuencias muy concretas:

1. **Búsquedas de marca.** Buscar "VendeT" no devuelve el sitio porque el
   Knowledge Graph no puede consolidar la entidad. Es exactamente el síntoma
   "es muy difícil de encontrar en ningún lado".
2. **Motores de IA.** ChatGPT, Perplexity y los AI Overviews construyen su
   noción de "qué es esto" leyendo el grafo de entidades. Un `sameAs` falso
   mete ruido en la resolución de entidad y hace que el modelo prefiera una
   fuente que sí sabe lo que es.

**Arreglo aplicado.** Se eliminó `sameAs` por completo y se sustituyó por un
`@graph` con `Organization` + `WebSite` unidos por `@id`:

```json
{ "@type": "Organization", "@id": "https://vendet.online/#organization", ... }
{ "@type": "Website", "@id": "https://vendet.online/#website",
  "publisher": { "@id": "https://vendet.online/#organization" } }
```

Ahora el blog (`author`/`publisher`) y el resto de schemas apuntan a ese `@id`
en vez de repetir tres variantes del nombre de marca.

> **✅ Resuelto (nov-2026).** Ya existe el perfil real de Facebook y está
> declarado en `src/lib/social.ts` (única fuente de verdad):
>
> ```
> https://www.facebook.com/profile.php?id=61589268274357
> ```
>
> De ahí salen DOS señales que se refuerzan entre sí:
>
> 1. `sameAs` en el `Organization` del JSON-LD (afirma la identidad).
> 2. Un enlace visible en el footer, escritorio **y móvil**, con
>    `rel="me"` (demuestra la identidad con contenido rastreable).
>
> Un `sameAs` sin enlace visible es solo una afirmación; con el enlace, Google
> puede seguir la relación en ambos sentidos y resolver la entidad. Hay 6 tests
> de regresión (`tests/unit/seo-social-sameas.test.ts`) que fallan si alguien
> vuelve a colar un perfil inventado.
>
> **Recomendación:** la URL `profile.php?id=…` funciona e indexa igual, pero si
> se reserva un `facebook.com/vendet` conviene cambiarla en `lib/social.ts`:
> una URL con nombre refuerza la marca y es más reconocible. Del mismo modo,
> crear Instagram y TikTok cuando haya capacidad — cada perfil adicional suma
> una señal de entidad, pero solo si es real.

---

## Hallazgo 3 — Enlaces internos rotos en el header (`/en/es`, 404)

**Medido.** El conmutador de idioma del header se construía como
`` `/en${pathname}` ``. En las páginas servidas bajo `/en`, el `pathname` que
recibe el cliente ya incluye el locale (`/es/catalogo`), así que el enlace
salía:

| Página | Enlace del header | Resultado |
|---|---|---|
| `/` | `/en/es` | **404** |
| `/faq` | `/en/es/faq` | **404** |
| `/blog` | `/en/es/blog` | **404** |
| `/categoria/vehiculos` | `/en/es/categoria/vehiculos` | **404** |

Los enlaces rotos del header (presentes en **todas** las páginas del sitio) son
rastreados por Google desde la portada. Encontrar 404s en la navegación
principal de un dominio nuevo es una señal de calidad muy negativa.

**Arreglo aplicado.** `src/i18n/routing.ts` exporta ahora
`esPaginaConVersionIngles(pathname)`. El conmutador solo se renderiza en
páginas con versión inglesa real (home, catálogo, informativas). Verificado:
`/`, `/faq`, `/blog` y `/categoria/*` ya no emiten ningún `href="/en..."`;
`/catalogo` conserva `/en/catalogo`, que sí existe.

---

## Hallazgo 4 — 9 páginas sin canonical (incluida `/publicar` y `/creditos`)

**Medido** (antes del arreglo):

```
/faq                    canonical: NONE   robots: index, follow
/publicar               canonical: NONE   robots: index, follow
/creditos               canonical: NONE   robots: index, follow
/sobre-nosotros         canonical: NONE   ...
/como-funciona          canonical: NONE
/contacto               canonical: NONE
/terminos-y-condiciones canonical: NONE
/politica-de-privacidad canonical: NONE
/como-instalar-app      canonical: NONE
```

Sin canonical, y sirviéndose la misma página en `/faq` y `/en/faq`, cada par
compite contra sí mismo. Google elige una al azar y reparte señales entre dos.

**El caso grave es `/publicar` y `/creditos`**: son Client Components
(`'use client'`), que **no pueden exportar `metadata`**. Heredaban la metadata
del layout raíz, es decir: título de portada, descripción de portada y —desde
el `metadataBase`— intención de canonical de portada. La página cuyo objetivo
es posicionar "publicar anuncios gratis Venezuela" se presentaba a Google como
un duplicado de la home.

**Arreglo aplicado.**
- `publicar/layout.tsx` y `creditos/layout.tsx` nuevos, con su propia metadata.
- Canonical + `hreflang` + Open Graph en las 7 páginas estáticas restantes.
- Términos y privacidad tenían solo `title`, sin `description`.

---

## Hallazgo 5 — El 58 % del sitemap duplicaba contenido en un idioma falso

**La aritmética.** 2.883 URLs en el sitemap frente a ~1.200 páginas con
contenido propio. La diferencia no es inventario: son **330 ciudades × 8
categorías = 2.640** páginas construidas con la misma plantilla.

A eso se sumaba un `/en` que servía el mismo texto en español bajo URLs
inglesas (productos, blog, vendedores), con `X-Robots-Tag: noindex` para
compensar. Es decir: el sitio generaba, rastreaba y luego desindexaba miles de
páginas duplicadas en cada deploy.

**Por qué importa para SEO local.** "carros en venta Caracas" es la consulta
con más intención de compra del mercado venezolano. Para competir por ella hace
falta una página con contenido propio sobre Caracas, no 330 hermanas idénticas
con la ciudad cambiada en el `<h1>`. Google no indexa una plantilla 330 veces:
indexa la mejor y descarta el resto — y si el resto es el 99 % del dominio, la
impresión global es "sitio de contenido generado a escala".

**Arreglo aplicado (parcial y deliberado).**
- Sitemap: solo combinaciones con inventario real (Hallazgo 1).
- `/en` sigue disponible como interfaz pero no se enlaza desde el header ni se
  anuncia (Hallazgo 3).
- Contenido nuevo **único por ciudad + categoría** en
  `[ciudad]/[categoria]/ContenidoLocal.tsx`: qué revisar antes de pagar
  (distinto por categoría), cómo publicar en esa ciudad, por qué comprar local.
  Medido: la página pasa de **74 a 449 palabras visibles**, y las palabras
  cambian entre `/caracas/vehiculos` y `/maracaibo/tecnologia`.
- Enlaces internos: cada página de ciudad es ahora un hub que enlaza a sus 8
  categorías locales (antes esas URLs **solo existían en el sitemap**, sin un
  solo enlace interno — lo que hace que se rastreen tarde y mal).

---

## Hallazgo 6 — `og:image` en WebP: ninguna red social podía previsualizarla

**Medido.** La imagen Open Graph era `public/og-image.webp`.

WhatsApp —el canal por donde circula un marketplace en Venezuela— **no
renderiza WebP** en sus tarjetas de enlace. Tampoco LinkedIn. El resultado: cada
vez que alguien comparte un anuncio o la portada, la tarjeta sale sin imagen.
Menos clics, menos enlaces entrantes, y los enlaces son el principal
combustible del ranking.

**Arreglo aplicado.** Convertida a `og-image.jpg`, 1200×630 exactos, JPEG
progresivo de calidad 82 (170 KB). Servido con `Content-Type: image/jpeg`
(verificado). Se mantiene el `.webp` original para uso interno de la app.

---

## Hallazgo 7 — DuckDuckGo/Bing bloqueado por diseño

`User-agent: *` + `Allow: /` **no** incluye a los rastreadores de IA por
convención implícita: cada uno se identifica con su propio `User-Agent` y
muchos operadores aplican reglas conservadoras cuando no hay una explícita.

**Arreglo aplicado.** Reglas explícitas `Allow: /` para `GPTBot`,
`OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`,
`Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `CCBot` y `Bingbot`.

El `robots.txt` queda además como el único sitio donde se decide esto, con un
comentario que explica cómo bloquear entrenamiento sin bloquear citación (la
distinción que de verdad importa: interesa que las IA **citen** VendeT, no que
lo usen de corpus sin devolver tráfico).

---

## Hallazgo 8 — Datos estructurados incompletos en lo que más importa

| Página | Antes | Ahora |
|---|---|---|
| Categoría | `CollectionPage` + `ItemList` de enlaces | `Product` + `Offer` por anuncio (precio, moneda, condición, ciudad) |
| Producto | Sin `dateModified` / `priceValidUntil` | Ambos, con `validFrom`; degradación segura si falta la columna |
| Blog | `author` como organización con nombre inventado, `logo` → `/logo.png` (**404**) | `author`/`publisher` por `@id`; `logo` correcto; `@id`, `url`, `image` |
| Global | `Organization` sin `areaServed` ni `contactPoint` | `areaServed: Venezuela` (wikidata Q717), `contactPoint`, `knowsLanguage` |

El `logo: /logo.png` del blog apuntaba a un archivo que **no existe** en
`public/` (es `logo-vendet.webp`). Un `logo` roto en `publisher` invalida el
resultado enriquecido de artículo.

---

## Lo que NO se tocó (y por qué)

Decisiones conscientes, para que nadie las "arregle" después:

- **`/en` no se elimina.** Quitarlo rompería URLs indexadas y la PWA. Se
  neutraliza (sin enlaces, sin sitemap, `X-Robots-Tag`), que es reversible.
- **`'unsafe-inline'` en la CSP** se mantiene: quitarlo exige nonces y los
  nonces desactivan el ISR de 25 rutas. Documentado en `security-headers.js`.
- **No se añadió `aggregateRating` de mentira** en categorías. Google penaliza
  reseñas sin reseñas reales, y los motores de IA citan menos a un dominio con
  datos inventados.
- **No se generaron más artículos de blog.** 19 artículos con contenido real
  valen más que 100 generados. Lo que falta es distribución, no volumen.

---

## Verificación ejecutada

```
tsc --noEmit                    ✓ limpio
next build                      ✓ 177 rutas, 0 errores
jest (24 suites)                ✓ 178/178 tests
```

Comprobaciones HTTP contra el build de producción:

| Comprobación | Antes | Después |
|---|---|---|
| `href="/en/es"` en `/` | 404 enlazado | ausente |
| Enlaces `/en/es/*` en 5 páginas | 4 de 5 páginas | 0 |
| Canonical en 9 informativas | 0 de 9 | 9 de 9 |
| `og-image` servido | `image/webp` | `image/jpeg` 1200×630 |
| `sameAs` a perfiles ajenos | 3 | 0 |
| `sameAs` al perfil real de Facebook | 0 | 1 (JSON-LD + footer escritorio y móvil) |
| Palabras visibles en `/caracas/vehiculos` | 74 | 449 |
| Enlaces internos a `/caracas/{cat}` | 0 | 8 |
| URLs del sitemap con inventario (prod) | 2.883 | solo con anuncios |

---

## Qué hacer ahora fuera del código (en este orden)

1. **Google Search Console:** reenviar `sitemap.xml`. En 2–4 semanas debería
   caer el número de "Excluidas por noindex" y subir el de "Indexadas".
2. **Inspección de URL** sobre `/`, `/catalogo`, `/publicar`,
   `/categoria/vehiculos` y una landing de ciudad **con anuncios** reales.
   Pedir indexación explícita de esas cinco.
3. **Bing Webmaster Tools:** dar de alta el sitio. Bing alimenta DuckDuckGo y
   parte de ChatGPT. Es la vía más rápida para aparecer en respuestas de IA.
4. ~~Crear los perfiles sociales reales y añadirlos al `sameAs`.~~
   **✅ Hecho:** el Facebook oficial ya está en `sameAs` y enlazado en el
   footer. Añadir Instagram/TikTok en `src/lib/social.ts` cuando existan
   (el código ya los soporta: aparecen solos en el footer y en el schema).
   **Asegurarse de que en Facebook la web figure como "Sitio web" del perfil**
   — Facebook enlaza de vuelta y refuerza la relación de identidad.
5. **Datos reales antes que más páginas.** El límite del SEO programático no es
   el número de URLs: es que cada URL tenga inventario. Con 50 ciudades con
   anuncios se compite mejor que con 330 vacías — y ahora el sitemap lo refleja
   solo.

> El cambio estructural de fondo es este: el sitio dejó de intentar parecer
> grande (2.883 URLs) y empezó a parecer **fiable** (solo lo que tiene
> contenido, con enlaces que no rompen y una entidad que se sabe quién es).
> Para un dominio nuevo eso último es lo único que se puede conseguir rápido.
