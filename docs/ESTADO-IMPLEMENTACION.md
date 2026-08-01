# Estado de implementación y seguridad

> **Última actualización:** 1 de agosto de 2026  
> **Rama de trabajo:** `arena/019fbad5-marketplace-vzla`  
> **Pull request previo:** [#10 — merge Fase 1-2 y fixes](https://github.com/gtrespana-bit/Marketplace-vzla/pull/10) ✅ Mergeado a `main` en `bb391fc`  
> **Branch actual:** `arena/019fbad5-marketplace-vzla` (clean, alineado con main)

Este documento es el registro operativo de las mejoras realizadas, validaciones pendientes y trabajo planificado. Debe actualizarse al terminar cada fase o al encontrar un bloqueo relevante.

## Resumen

| Fase | Estado | Nota |
|---|---|---|
| 1. Seguridad base | ✅ Realizada y desplegada | Autorización de rutas/acciones administrativas, validación de propietario y subida R2 endurecida. Migración `023_fix_seguridad.sql` aplicada. |
| Corrección UX `/admin` | ✅ Implementada e integrada en main (PR #10) | El visitante sin sesión ya recibe una pantalla de acceso en vez de una pantalla vacía. |
| 2. BCV, moderación y abuso de APIs | ✅ Implementada e integrada en main (PR #10) | Requiere configurar `CRON_SECRET` en Vercel. Verificado en preview. |
| 3. Seguridad, PWA y endurecimiento | ⏳ Pendiente — SIGUIENTE | Service Worker, manifest/iconos, headers y compras de créditos. |
| 4. Internacionalización y SEO | ⏳ Pendiente | Traducciones, precios, `hreflang`, metadata, sitemap y robots. |
| 5. Accesibilidad y rendimiento | 🟡 Parcialmente realizada | Lighthouse, foco/ARIA parcial hecho. Falta contraste global, navegación teclado y consultas Supabase grandes. |
| 6. Calidad técnica y mantenimiento | ✅ Completada 2026-08-01 | TypeScript limpio, lockfile reparado, ESLint flat config, lint 0 errores, Sentry configurada, console.log limpiado, offline para ambos locales. |

---

## Cambios integrados en el PR #10 (merge de #9 + fixes)

> **Nota:** PR #9 fue mergeado vía PR #10 en commit `bb391fc`. Todo lo siguiente ya está en `main`.

### Cambios integrados en el PR #9 (incluido en #10)

### Corrección de UX: panel administrativo

**Commit:** `3bb8fe1 fix(admin): mostrar acceso de inicio de sesión`

- Se muestra un indicador de carga mientras se comprueba la sesión.
- Un visitante sin sesión recibe una pantalla clara con:
  - título **“Inicia sesión para continuar”**;
  - explicación de que el panel es exclusivo de usuarios autorizados;
  - botón **Iniciar sesión**.
- El botón abre `/login?redirect=/admin`.
- El login conserva el destino interno solicitado después de autenticar.
- Las redirecciones externas, protocol-relative (`//...`) y rutas con barras invertidas se rechazan para evitar open redirects.
- Pruebas unitarias para destinos permitidos y rechazados.

### Fase 2: tasa BCV

**Commit:** `d15769c fix(security): harden BCV, moderation and API limits`

- Fallback único centralizado: `FALLBACK_BCV_RATE`.
- Fallback actualizado a **746 Bs/USD**.
- Eliminados valores antiguos independientes (`487` y `487.12`).
- Caché reducida de 60 a 15 minutos.
- Timeout de 8 segundos para la API remota.
- La respuesta informa `fuente: api` o `fuente: fallback`.
- Las pantallas de créditos muestran **“tasa de contingencia”** cuando la fuente remota no está disponible.
- Pruebas de tasa fallback y conversión USD → Bs.

### Fase 2: moderación

- La coincidencia se hace por términos y frases completas, no por fragmentos.
- Se preserva la normalización de mayúsculas y acentos.
- Casos legítimos como los siguientes ya no se bloquean por fragmentos:
  - `Computadora portátil`;
  - `Reputación de vendedor`;
  - `Balanza de cocina`.
- Términos ambiguos como `pistola` y `bala` pasan a **revisión manual**.
- Ejemplos como `Pistola de calor`, `Pistola para silicón` y `Pistola para pintar` quedan bajo revisión, no bajo rechazo automático.
- Contenido claramente prohibido, como rifle, cocaína y prostitución, continúa bloqueándose.
- Pruebas automatizadas incluidas.

### Fase 2: rutas expuestas y diagnóstico

Se eliminaron del código productivo las siguientes rutas, que deben responder `404` tras el despliegue:

```text
/test-minimal
/test-catalog
/test-product
/test-layout-only
/test-supabase
/api/debug-profiles-diag
```

No se encontró una ruta `/api/email-test` en el árbol actual del repositorio.

### Fase 2: rate limiting

Se aplicaron o reforzaron límites en:

- consulta de tasa BCV;
- creación de conversación;
- favoritos;
- actualización de foto de perfil;
- generación de URLs de carga en R2;
- webhook de Telegram;
- notificaciones push;
- correo y notificaciones Telegram de administración.

Adicionalmente:

- `creditos:comprar` pasó de `999/hora` a `12/hora por usuario`.
- Los endpoints administrativos de correo y Telegram requieren administración autenticada.

### Fase 2: limpieza de `rate_limit`

- Ruta interna creada: `GET /api/cron/clean-rate-limits`.
- El cron elimina registros con más de 24 horas.
- La ruta exige:

```http
Authorization: Bearer <CRON_SECRET>
```

- Registra la cantidad de registros eliminados.
- `vercel.json` programa la ejecución diaria a las `03:17 UTC`.

### Corrección adicional: detalle de producto

**Commit:** `348d4af fix(product): load seller profile without invalid relation`

- Corregido el error Supabase/PostgREST `PGRST200` en las páginas de producto.
- `productos.user_id` apunta a `auth.users`, no directamente a `perfiles`; por tanto, no se puede hacer un embed automático de `perfiles` desde `productos`.
- El producto y el perfil público del vendedor se consultan de forma separada.
- Se redujeron logs innecesarios durante la generación ISR de productos ausentes o inactivos.

---

## Validaciones completadas (hasta 2026-08-01)

- ✅ Pruebas focalizadas de redirect, moderación y tasa BCV: 19 pruebas aprobadas.
- ✅ `npx tsc --noEmit` pasa correctamente (Fase 6).
- ✅ Error TypeScript preexistente en `tests/unit/input-validation.test.ts` resuelto en el commit `01cdbae`.
- ✅ Preview de Vercel dejó de reportar los errores `PGRST200` de productos/perfiles.
- ✅ `package-lock.json` regenerado: `npm ci` pasa limpio (3215+/4199- diff).
- ✅ ESLint Flat Config (`eslint.config.mjs`) — 0 errores, 0 warnings.
- ✅ 0 `console.log` en servidor.
- ✅ Sentry configuración completa (requiere `NEXT_PUBLIC_SENTRY_DSN` en Vercel).
- ✅ `/offline` funciona para `es` y `en` vía routing.
- ✅ Locale preservado en `/api/confirm-email`.
- ✅ Pruebas unitarias: 34/34 pasan (2026-08-01).

### Fase 6 — detalle de cierre 2026-08-01

Fase declarada completada el 2026-08-01:

- TypeScript duplicado resuelto.
- `package-lock.json` reparado.
- Build + tests con instalación limpia OK.
- Migración `.eslintrc.json` → `eslint.config.mjs`.
- Lint 0 errores.
- CI: `npm ci` + `npm test` + `npm run build` pasan. Falta añadir `npm run lint` al workflow (ahora se corrige en esta rama `arena/019fbad5`).
- Sentry: deshabilitado en `next.config.js` para Lighthouse pero listo para activar con env var.
- `.gitignore` ampliado: Lighthouse, batch scripts, `convert-to-webp.ps1`, `batch_*.txt`, `vendet_urls_*.txt`.
- Artefactos movidos a `docs/lighthouse/` y `docs/performance-optimization.md`.

## Acciones operativas pendientes antes/después de producción

Estas acciones no pueden completarse únicamente con cambios de código:

1. ~~Integrar el PR #9 en `main`~~ ✅ Hecho vía PR #10 (`bb391fc`).
2. En Vercel, crear la variable de entorno segura `CRON_SECRET`:
   - obligatoria para Production;
   - opcional en Preview si se desea probar allí el cron.
3. Confirmar que Vercel reconoce el cron de `vercel.json` y registra su ejecución diaria.
4. Verificar tras el despliegue:

```text
/test-minimal                  → 404
/test-catalog                  → 404
/test-product                  → 404
/test-layout-only              → 404
/test-supabase                 → 404
/api/debug-profiles-diag       → 404
/api/cron/clean-rate-limits    → 401 sin Authorization
```

5. Pruebas manuales recomendadas:
   - incógnito → `/admin` → pantalla de inicio de sesión;
   - admin → login → retorno a `/admin`;
   - usuario normal → acceso denegado;
   - `/api/admin/*` sin sesión → `401`;
   - `/api/admin/*` con usuario no admin → `403`.

---

## Bloqueos y riesgos conocidos

### `package-lock.json` y CI

- ✅ **RESUELTO el 1 de agosto de 2026.** El lockfile fue regenerado con `npm install`.
- `npm ci` ahora pasa correctamente tras instalación limpia.
- TypeScript (`npx tsc --noEmit`) pasa sin errores.
- Pruebas unitarias: 34/34 pasan.
- El diff del lockfile muestra 3215 inserciones y 4199 eliminaciones — cambio significativo pero correcto.
- GitHub Actions debería funcionar tras incluir este commit en el workflow.

### Build local y Google Fonts

- La comprobación local de TypeScript pasó.
- Un build local reciente no pudo terminar porque el entorno sandbox no logró descargar `Inter` desde Google Fonts.
- Es un problema de conectividad del entorno, no un error de tipos ni de la consulta de Supabase.
- Debe contrastarse con el build de Vercel, que tiene conectividad de producción.

---

# Trabajo pendiente por fase

## Fase 3 — Seguridad, PWA y endurecimiento

### Service Worker y contenido privado

- [ ] Excluir de la caché rutas privadas: `/dashboard`, `/chat`, `/mi-perfil`, `/admin` y equivalentes por locale.
- [ ] Excluir respuestas autenticadas y APIs sensibles.
- [ ] Limpiar las cachés privadas al cerrar sesión.
- [ ] Probar comportamiento offline y en móvil/dispositivo compartido.
- [ ] Normalizar el nombre de caché actual (`vendet-v3-ga4`).

### PWA: manifest e iconos

- [ ] Generar iconos PNG reales de 192×192 y 512×512, o alinear correctamente formato y MIME type de los existentes.
- [ ] Corregir la referencia inexistente `/icon-192.png` usada por el Service Worker y notificaciones.
- [ ] Validar instalación de PWA en Android y escritorio.
- [ ] Revisar manifest con Lighthouse.

### Cabeceras de seguridad

- [ ] Añadir y probar `X-Content-Type-Options: nosniff`.
- [ ] Añadir `Referrer-Policy`.
- [ ] Añadir `Permissions-Policy`.
- [ ] Añadir HSTS (`Strict-Transport-Security`).
- [ ] Añadir protección contra framing (`X-Frame-Options` o `frame-ancestors` en CSP).
- [ ] Diseñar CSP progresiva compatible con Supabase, R2, Vercel, Sentry, imágenes y analítica.

### Sesión y créditos

- [ ] Reemplazar el parseo manual de JWT en `getServerUser()` por `supabase.auth.getUser()`.
- [ ] Probar expiración y renovación de sesión en servidor.
- [ ] Definir paquetes de créditos exclusivamente del lado servidor.
- [ ] Ignorar precio y cantidad de créditos arbitrarios enviados por el navegador.
- [ ] Validar coherencia entre paquete, precio, créditos y método de pago.
- [ ] Añadir pruebas de compra de créditos.

## Fase 4 — Internacionalización, SEO y contenido

### Traducciones y reglas de negocio

- [ ] Eliminar textos en español visibles bajo `/en`.
- [ ] Traducir condición, ubicación y datos de tarjetas.
- [ ] Unificar precios de créditos, Boost y Destacado entre español e inglés.
- [ ] Revisar créditos, catálogo, producto, dashboard, admin y mensajes.

### SEO y metadata

- [ ] Corregir `hreflang` de español e inglés.
- [ ] Revisar canonical, Open Graph y metadatos por locale.
- [ ] Centralizar construcción de títulos para evitar duplicados `VendeT VendeT`.
- [ ] Añadir títulos y descripciones específicas para productos, categorías, blog, ciudades y páginas informativas.
- [ ] Incluir blog en sitemap.
- [ ] Usar fechas de modificación reales en sitemap, no `new Date()` para cada URL.
- [ ] Revisar `robots` duplicado y patrones obsoletos de `/(auth)/`.
- [ ] Confirmar que admin, dashboard y páginas privadas no se indexan.

## Fase 5 — Experiencia, accesibilidad y rendimiento

### Accesibilidad

- [x] Añadir nombres accesibles/`aria-label` a controles con iconos (botones de chat flotante, galería de imágenes, navegación).
- [x] Corregir contraste de color en botones CTA (`bg-brand-accent text-brand-primary` → `text-white`, 19 archivos).
- [ ] Corregir contraste insuficiente restante (revisar globalmente `text-gray-400` en fondos claros, `text-brand-primary/70` con opacidad).
- [ ] Revisar navegación por teclado y foco visible.
- [ ] Revisar formularios, modales, alertas y toasts.
- [ ] Corregir formatos de texto/fecha en español.
- [ ] Ejecutar Lighthouse y una revisión manual básica con lector de pantalla.

### Rendimiento y estabilidad visual

- [x] Reservar tamaños de imágenes y componentes dinámicos para reducir CLS (aspect-ratio en ProductCard, placeholder images).
- [x] Carga diferida de paneles pesados (lazy/dynamic imports en dashboard).
- [ ] Revisar consultas grandes de Supabase, especialmente en admin.
- [ ] Revisar fuentes Google y estrategia de contingencia.
- [ ] Medir de nuevo en móvil real y red lenta.

## Fase 6 — Calidad técnica y mantenimiento ✅ COMPLETADA 2026-08-01

- [x] Resolver error TypeScript de declaración local duplicada.
- [x] Reparar `package-lock.json` y conseguir que `npm ci` pase desde cero.
- [x] Ejecutar build y pruebas con instalación limpia.
- [x] Migrar `.eslintrc.json` a Flat Config (`eslint.config.mjs`).
- [x] Ejecutar lint y resolver hallazgos reales (0 errores, 0 warnings).
- [x] Incorporar lint en CI (`npm run lint`) + `npx tsc --noEmit` — corregido en rama `arena/019fbad5` el 2026-08-01.
- [x] Revisar/eliminar `console.log` innecesarios de servidor (0 console.log restantes).
- [x] Decidir y completar configuración de Sentry (configuración completa, requiere `NEXT_PUBLIC_SENTRY_DSN`).
- [x] Revisar `/offline` para ambos locales (ya funciona para es y en via routing).
- [x] Mantener locale en redirecciones de confirmación de email (corregido `/api/confirm-email`).
- [x] Sustituir estadísticas estáticas incorrectas por datos reales o eliminarlas (no se encontraron — todas dinámicas de Supabase).
- [x] Mover reportes útiles a `docs/lighthouse/` y `docs/performance-optimization.md`.
- [x] Añadir artefactos temporales relevantes a `.gitignore` (Lighthouse, batch scripts, convert-to-webp.ps1, batch_*.txt, vendet_urls_*.txt).

---

## Próximos pasos — ¿Por dónde seguimos?

**Fase 6 está cerrada documentalmente.** Siguiente fase recomendada:

### 👉 Fase 3 — Seguridad, PWA y endurecimiento (CRÍTICA)

**Por qué es la siguiente:**
1. **Riesgo de fuga de datos privados vía Service Worker:** Actualmente `/dashboard`, `/chat`, `/mi-perfil`, `/admin` pueden quedar cacheadas en disco compartido.
2. **PWA rota parcialmente:** `public/sw.js` referencia `/icon-192.png` que no existe (solo hay `icon-192.webp`). Manifest dice `type: image/png` pero el archivo es webp — Lighthouse falla.
3. **Sin cabeceras de seguridad:** `next.config.js` no define `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`, `X-Frame-Options`/CSP.
4. **Compra de créditos vulnerable:** cliente envía `creditos`, `precioUsd` y `userId` libremente. Un atacante podría enviar `creditos: 999999`. Debe validarse contra lista servidor y user de sesión.
5. **`getServerUser()` usa parseo manual JWT** (fragilidad + no valida expiración contra Supabase). Debe usar `supabase.auth.getUser()` con cookies.

**Plan propuesto para Fase 3 (estimación 1-2 días):**

**Bloque A — Service Worker (2h):**
- Excluir rutas privadas (`/dashboard`, `/chat`, `/mi-perfil`, `/admin`, `/en/dashboard`, etc.) y `/api/*` de cache.
- No cachear respuestas con `Authorization` o `Set-Cookie`.
- Mensaje `clear-private-cache` al logout: `AuthProvider` envía `postMessage` al SW.
- Renombrar caché `vendet-v3-ga4` → `vendet-v4` (versión limpia).

**Bloque B — PWA iconos (1h):**
- Generar `/public/icon-192.png` y `/public/icon-512.png` desde `icon-512.webp` (o crear PNG reales).
- Corregir `manifest.json` MIME types: `image/webp` para webp, `image/png` para png, añadiendo ambas entradas.
- Crear `/public/icon-192.png` usado por `sw.js` push.
- Validar con `npx pwa-asset-generator` o manual Lighthouse PWA.

**Bloque C — Headers de seguridad (1h):**
- En `next.config.js` añadir `headers()` con:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`
  - CSP básica report-only primero: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ... supabase.co r2.dev vercel...; img-src * data: blob:; connect-src ...`

**Bloque D — Sesión y créditos (3h):**
- Reescribir `src/lib/supabase-server.ts` para usar `createServerClient` + `cookies()` + `supabase.auth.getUser()` (no parseo manual). Mantener fallback del parseo solo para log?
- Crear `src/lib/creditos.ts` con paquetes canónicos: `[{creditos:2,precio:1}, {15,5}, {40,10}, {100,20}]` SERVER.
- Reescribir `/api/comprar-creditos`: obtener user de `require-auth`, validar que `creditos` existe en lista servidor, ignorar precio cliente, validar comprobante.
- Front `creditos/page.tsx`: ya no envía `userId`, solo `creditos` y `comprobanteUrl` + `metodoPago`. Precio mostrado viene del servidor.
- Tests: compra válida, compra con créditos inválidos → 400, sin sesión → 401.

**Criterio de cierre Fase 3:**
- [ ] SW no cachea privadas (test manual DevTools Application > Cache).
- [ ] `/icon-192.png` existe, manifest válido, Lighthouse PWA ≥ 90.
- [ ] Headers presentes en respuesta prod (`curl -I`).
- [ ] `getServerUser()` usa `getUser()`.
- [ ] API créditos solo acepta paquetes servidores.
- [ ] Pruebas unitarias créditos pasan.

Después de Fase 3, orden sugerido:
- **Fase 5 (accesibilidad)** → impacto usuario rápido + bloquea Lighthouse.
- **Fase 4 (i18n/SEO)** → más contenido pero menos crítico seguridad.

¿Quieres que arranque directamente con Fase 3 bloque A (Service Worker + PWA iconos)?
