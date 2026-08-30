# ESTADO DEL PROYECTO — VendeT (agosto 2026)

> **Documento maestro de "dónde estamos".** Se actualiza al cierre de cada ciclo de trabajo.
> Documentos complementarios: [`ANALISIS-SEO.md`](./ANALISIS-SEO.md) (SEO técnico, 2 rondas) · [`ANALISIS-CONVERSION.md`](./ANALISIS-CONVERSION.md) (embudo, psicología, P0/P1/P2) · [`PROJECT.md`](./PROJECT.md) (estructura del código).

---

## 1. Resumen ejecutivo

| | |
|---|---|
| **Rama de trabajo** | `arena/01a05083-marketplace-vzla` (13 commits, 51 archivos, +3.341/−1.171) |
| **Base** | `main` @ `abf315b3` — **pendiente de merge** |
| **Stack** | Next.js 16 (App Router) · Supabase · PWA · deploy Vercel (`vendet.online`) |
| **Ciclo cerrado** | Rediseño de home → P0 conversión → P1 retención → SEO interno (2 rondas) → contenido head |
| **QA del ciclo** | `tsc` ✓ · `eslint` ✓ · **93/93 tests** ✓ · build **177/177 páginas** ✓ · verificación HTTP manual de los cambios críticos ✓ |
| **SQL pendiente de confirmar** | 1 migración (`visitas_snapshot`) — ver §5 |
| **Riesgo del ciclo** | Bajo: todo lo nuevo degrada sin error si falta una tabla/env var |

**En una frase:** la web pasó de *vender créditos en la portada* a un embudo completo (publicar gratis → contactar sin muro → volver por alertas), con el SEO interno saneado (404s reales, sin soft-404s, landings inteligentes, imágenes, estrellas) y contenido atacando las queries genéricas del mercado venezolano.

---

## 2. Cronología de la rama (13 commits)

| # | Commit | Qué hizo |
|---|---|---|
| 1 | `9bb5deb` | **Rediseño home**: free-first, producto antes que créditos (fuera precios, tabla de boost, banner "¿Quieres aparecer aquí?"). Buscador grande + chips de categorías + collage. |
| 2 | `f2f1aad` | **Análisis de conversión** (documento): auditoría por embudo + plan P0/P1/P2. |
| 3 | `85c2e9d` | **Marca**: eliminado "Todo Anuncios" y dominio viejo `marketplacevzla.vercel.app` del repo (plantillas de email, README, scripts). Supabase ya estaba correcto — era desync del repo. |
| 4-5 | `45e7cb4`, `5b8dd98` | Docs: reflejar que producción estaba bien. |
| 6 | `cd732aa` | **Fixes next-intl** (`/creditos`, `/publicar`, WhatsApp del producto lanzaban FORMATTING_ERROR) + **header sin "Créditos" para visitantes** + **nav inferior en móvil web** (antes solo PWA) + footer con padding. |
| 7 | `59e510e` | **P0 conversión**: relacionados en producto, "N personas lo guardaron", compartir WhatsApp/copiar tras publicar, feed "Vendidos recientemente" (migración `vendido_fecha`), stats de actividad semanal, fuera "MercadoLibre" del banner. |
| 8 | `1848e21` | **P1 (1ª tanda)**: búsquedas guardadas con alertas push (tabla + API + botón + cron 6 h), renovar anuncio cada 7 días, registro de 4 campos (sin teléfono/ubicación, contraseña 8+ sin composición). |
| 9 | `6d75a5e` | Cron búsquedas: degradación segura si la tabla no está migrada. |
| 10 | `d617627` | **P1 (2ª tanda)**: publicar **foto-primero** (fotos→categoría→detalles→revisar), digest semanal al vendedor (email+push), aviso de bajada de precio a favoritos, nudge para invitados (WhatsApp/1-clic en vez de redirect), bloque de enlaces internos en el blog. **Decisión: cobertura nacional** (descartada concentración por ciudad). |
| 11 | `95c1af1` | Crons lifecycle: degradación segura sin tablas. |
| 12 | `8feda52` | **SEO ronda 2**: 404s reales (fin del soft-404 generalizado causado por `loading.tsx` + div-200), vendidos se sirven con `noindex,follow` + similares (cada venta ya no mata una URL indexada), noindex en landings de ciudad sin anuncios, RSS `/feed.xml`. |
| 13 | `d83e188` | **SEO Bloque A+B**: `AggregateRating` (estrellas) con reseñas reales, `/sitemap-images.xml`, y 5 artículos head (clasificados Venezuela / publicar gratis / comprar-vender usado / Caracas / ciudades). |

---

## 3. Estado por área

### 3.1 Home — ✅ rediseñada
Orden: hero con buscador + chips + collage → banner "100% GRATIS" → categorías → recién publicado → destacados → vendidos recientemente → lo más visto → 3 pasos → strip único discreto a créditos → CTA final (publicar/explorar). Stats dinámicos de **actividad** ("+N esta semana"), nunca inventario total bajo. Sin precios en portada; sin nombrar competidores.

### 3.2 Página de producto — ✅ ya no es callejón sin salida
Relacionados (misma categoría → subcategoria → marca → recientes, server-side) · "N personas lo guardaron" · compartir WhatsApp/copiar tras publicar · nudge para invitados · **vendidos**: banner "Ya fue vendido" + contacto oculto + `noindex,follow` + schema `OutOfStock` · pausados/eliminados → **404 real** · 1 sola query a Supabase por visita (`cache()`).

### 3.3 Publicar y registro — ✅ fricción mínima
Publicar **foto-primero** (4 pasos reordenados) · registro de 4 campos (nombre, email, contraseña ×2; teléfono/ubicación en contexto) · contraseña 8+ sin composición (NIST) · Bonus Emprendedor ya visible en el flujo (preexistente).

### 3.4 Retención — ✅ los 3 loops montados
| Loop | Mecanismo | Frecuencia |
|---|---|---|
| Comprador | Búsquedas guardadas → push "hay novedades para tu búsqueda" | cron 6 h |
| Comprador | "📉 Bajó de precio" a quien guardó el producto | cron diario |
| Vendedor | Digest "tus anuncios tuvieron N vistas esta semana" (email + push) | cron lunes 9:05 am VET |
| Vendedor | Renovar anuncio gratis (sube como recién publicado) | manual, cada 7 días |

Todas las rutas de cron usan `Bearer CRON_SECRET` y **degradan sin error** si falta una tabla o env var.

### 3.5 SEO — ✅ 2 rondas + bloque A+B (ver `ANALISIS-SEO.md` para el detalle)
- **Ronda 1** (previa a este ciclo): taxonomía de categorías unificada, títulos sin marca duplicada, ISR en producto.
- **Ronda 2**: fin de soft-404s generalizado (era: TODA URL muerta respondía 200) · vendidos sin matar URLs · noindex en ~2.640 landings ciudad/categoría sin inventario (fail-open) · RSS del blog.
- **Bloque A**: estrellas (`AggregateRating` solo con reseñas reales) · sitemap de imágenes en `robots.txt`.
- **Bloque B**: 5 artículos head publicados (ver §6 para el listado con queries objetivo).
- Indexación: solo `es` indexable; `/en` disponible con `X-Robots-Tag` (decisión SEO preexistente).

### 3.6 Marca — ✅ sincronizada
Repo limpio de "Todo Anuncios" y del dominio viejo. Plantillas de email de referencia correctas (producción en Supabase ya lo estaba).

### 3.7 Bugs corregidos en el ciclo
`FORMATTING_ERROR` de next-intl en `/creditos` (5 usos), `/publicar` (1) y el enlace WhatsApp del producto · `<img>`→`Image` en relacionados · `quality` no configurada (70→75) · botsón "1 gratis" permanente del header.

---

## 4. Verificación realizada (QA)

- **Estados HTTP verificados uno a uno** (16 rutas): 404 real en producto inexistente/pausado, ciudad inválida, categoría inválida, `/ciudad/categoría-inventada` y rutas random; 200 correcto en todas las vivas; vendido → 200 + `noindex,follow` + banner; activo → 200 + `index,follow`.
- `aggregateRating` renderizado con datos de prueba; `sitemap-images.xml` 200 con entradas; `robots.txt` con ambos sitemaps; 5 artículos a 200 con 33-42 enlaces internos cada uno; feed RSS actualizado.
- Crons probados end-to-end contra mock (búsquedas, precios-bajaron, digest) + 401 sin secret.
- Tests unitarios **93/93** · build de producción **177/177** · `tsc`/`eslint` limpios.
- El preview del sandbox usa un **mock de Supabase** (`.env.local` fuera de git): títulos/precios/fotos de ejemplo no son datos reales.

---

## 5. ⚠️ Checklist operativo PENDIENTE (lo único que queda por hacer fuera del repo)

| # | Acción | Estado |
|---|---|---|
| 1 | Migración `20260829000101_add_vendido_fecha.sql` en Supabase | ✅ Aplicada |
| 2 | Migración `20260829000103_busquedas_guardadas.sql` en Supabase | ✅ Aplicada |
| 3 | Migración `20260829000105_snapshot_visitas.sql` (línea base del digest semanal) | ❓ **Por confirmar** — sin ella todo funciona; el cron solo no envía digests |
| 4 | Merge del PR `arena/01a05083-marketplace-vzla` → `main` (deploy Vercel) | ⏳ Pendiente |
| 5 | GSC → Sitemaps: reenviar `sitemap.xml` y dar de alta `sitemap-images.xml` | ⏳ Tras el deploy |
| 6 | GSC → Inspección de URL: indexar `/blog/clasificados-venezuela-gratis-guia-2026` | ⏳ Tras el deploy |
| 7 | Confirmar en Vercel que los 4 crons aparecen (clean-rate-limits, busquedas, digest, precios) | ⏳ Tras el deploy |
| 8 | En GSC → Páginas (2-3 semanas): confirmar caída de soft-404/excluidas y subida de indexadas útiles | 📅 2-3 semanas |

**Env vars requeridas** (ya existían en producción, verificadas por los sistemas preexistentes): `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`, `ZOHO_SMTP_*` (el email degrada si falta), `SUPABASE_SERVICE_ROLE_KEY`.

---

## 6. Contenido head publicado (Bloque B)

| Artículo | Query objetivo |
|---|---|
| `/blog/clasificados-venezuela-gratis-guia-2026` | clasificados venezuela / gratis |
| `/blog/publicar-anuncios-gratis-venezuela` | publicar anuncios gratis |
| `/blog/comprar-y-vender-usado-venezuela` | comprar y vender usado venezuela |
| `/blog/clasificados-caracas` | clasificados caracas |
| `/blog/clasificados-ciudades-venezuela` | clasificados maracaibo / valencia / barquisimeto / maracay |

Blog total: **19 artículos** (14 previos + 5 nuevos), todos con bloque de enlaces internos a categorías/catálogo/publicar.

---

## 7. Métricas a vigilar (cuando haya datos)

**Norte del negocio:** % de anuncios con ≥1 contacto en 72 h (liquidez).
**Del ciclo conversión:** tiempo registro→1ª publicación (<5 min) · % compradores con búsqueda guardada (>15% predice retención D30) · % vendedores con 2+ anuncios/30 días (>25%).
**Del ciclo SEO (GSC, semana a semana):** clics orgánicos a producto y a páginas de ciudad · impresiones de las 5 queries head · ratio de páginas indexadas útiles · aparición de estrellas en resultados (productos con reseñas).
**Dejar de mirar:** visitas totales, registros acumulados, páginas vistas (vanidad).

---

## 8. Backlog (ordenado, sin fechas)

**Cuando haya datos de GSC (3-4 semanas):**
1. Landings de intención larga ("vender iphone caracas") según queries con impresiones y sin clic.
2. FAQPage schema en artículos con preguntas.

**P2 de conversión (decisión del equipo: pausado hasta tener datos):**
3. Programa de referidos (2+1 créditos) — loop de adquisición vía WhatsApp.
4. Guía de precios con datos propios ("el iPhone 12 se vende entre $220-260 esta semana").
5. Auto-aprobación de créditos para compradores recurrentes.
6. Resumen de reputación en cards de listados ("⭐4.8 · 12 ventas") + tiempo de respuesta del vendedor.
7. Onboarding de verificación con ladder de beneficios.

**Deuda técnica conocida (no urgente):**
- 2 warnings `<img>` en previews de subida de fotos de `/publicar`.
- Sitemap de vendedores: incluir solo activos (hoy lista hasta 1.000 con producto activo — suficiente).
- Decidir coste real de mantener `/en` completo.

---

## 9. Decisiones estratégicas registradas

| Decisión | Fecha | Contexto |
|---|---|---|
| **Cobertura nacional** (descartada concentración en 3-4 ciudades) | ago-2026 | El equipo prefiere el alcance nacional; las 330 landings de ciudad son el soporte SEO de esa decisión. |
| **Free-first en portada**: créditos fuera del escaparate, una mención discreta | ago-2026 | La presión de precios en la home sugería "hay que pagar para publicar". |
| Publicar gratis **siempre**; destacar opcional | (preexistente) | Reforzado en todo el copy nuevo. |
| `/en` disponible pero no indexable | (preexistente) | SEO es-VE; revisar coste de mantenimiento en el futuro. |

---

## 10. Cómo continuar después del merge

1. Aplicar §5 (checklist operativo).
2. Dejar correr 3-4 semanas sin tocar nada estructural.
3. Reunión de datos: GSC (Rendimiento + Páginas) + métricas de conversión de §7.
4. Elegir backlog de §8 con esos datos — nada de lo pendiente se decide bien sin ellos.
