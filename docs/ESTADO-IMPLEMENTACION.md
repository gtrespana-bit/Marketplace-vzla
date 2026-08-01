# Estado de implementación y seguridad

> **Última actualización:** 31 de julio de 2026  
> **Rama de trabajo:** `arena/019fbaa2-marketplace-vzla`  
> **Pull request activo:** [#9 — fixes de administración y Fase 2](https://github.com/gtrespana-bit/Marketplace-vzla/pull/9)

Este documento es el registro operativo de las mejoras realizadas, validaciones pendientes y trabajo planificado. Debe actualizarse al terminar cada fase o al encontrar un bloqueo relevante.

## Resumen

| Fase | Estado | Nota |
|---|---|---|
| 1. Seguridad base | ✅ Realizada y desplegada previamente | Autorización de rutas/acciones administrativas, validación de propietario y subida R2 endurecida. Migración `023_fix_seguridad.sql` aplicada. |
| Corrección UX `/admin` | ✅ Implementada; pendiente de integrar PR #9 | El visitante sin sesión ya recibe una pantalla de acceso en vez de una pantalla vacía. |
| 2. BCV, moderación y abuso de APIs | ✅ Implementada; pendiente de integración y verificación operativa | Incluida en PR #9. Requiere configurar `CRON_SECRET` en Vercel. |
| 3. Seguridad, PWA y endurecimiento | ⏳ Pendiente | Service Worker, manifest/iconos, headers y compras de créditos. |
| 4. Internacionalización y SEO | ⏳ Pendiente | Traducciones, precios, `hreflang`, metadata, sitemap y robots. |
| 5. Accesibilidad y rendimiento | ⏳ Pendiente | Lighthouse, foco/ARIA, contraste, CLS y rendimiento. |
| 6. Calidad técnica y mantenimiento | 🟡 En curso parcialmente | TypeScript quedó limpio; falta reparar lockfile, CI, ESLint y limpiar artefactos. |

---

## Cambios integrados en el PR #9

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

## Validaciones completadas

- ✅ Pruebas focalizadas de redirect, moderación y tasa BCV: 19 pruebas aprobadas.
- ✅ `npx tsc --noEmit` pasa correctamente.
- ✅ Error TypeScript preexistente en `tests/unit/input-validation.test.ts` resuelto en el commit `01cdbae`.
- ✅ Preview de Vercel dejó de reportar los errores `PGRST200` de productos/perfiles.

## Acciones operativas pendientes antes/después de producción

Estas acciones no pueden completarse únicamente con cambios de código:

1. **Integrar el PR #9 en `main`** cuando se autorice el despliegue a producción.
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

- GitHub Actions falla actualmente en **Install dependencies** porque `npm ci` no puede instalar desde el lockfile actual.
- El problema identificado anteriormente incluía una dependencia ausente o desincronizada: `@swc/helpers@0.5.23`.
- Mientras no se repare, el CI no valida el proyecto mediante una instalación limpia.
- Próximo trabajo recomendado: corregir el lockfile de forma aislada, ejecutar `npm ci`, pruebas y build, y revisar cuidadosamente el diff.

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

- [ ] Añadir nombres accesibles/`aria-label` a controles con iconos.
- [ ] Corregir contraste insuficiente.
- [ ] Revisar navegación por teclado y foco visible.
- [ ] Revisar formularios, modales, alertas y toasts.
- [ ] Corregir formatos de texto/fecha en español.
- [ ] Ejecutar Lighthouse y una revisión manual básica con lector de pantalla.

### Rendimiento y estabilidad visual

- [ ] Reservar tamaños de imágenes y componentes dinámicos para reducir CLS.
- [ ] Carga diferida de paneles pesados.
- [ ] Revisar consultas grandes de Supabase, especialmente en admin.
- [ ] Revisar fuentes Google y estrategia de contingencia.
- [ ] Medir de nuevo en móvil real y red lenta.

## Fase 6 — Calidad técnica y mantenimiento

- [x] Resolver error TypeScript de declaración local duplicada.
- [ ] Reparar `package-lock.json` y conseguir que `npm ci` pase desde cero.
- [ ] Ejecutar build y pruebas con instalación limpia.
- [ ] Migrar `.eslintrc.json` a Flat Config (`eslint.config.js`).
- [ ] Ejecutar lint y resolver hallazgos reales.
- [ ] Incorporar lint en CI o en el flujo previo a despliegue.
- [ ] Revisar/eliminar `console.log` innecesarios de servidor, manteniendo logs útiles de error.
- [ ] Decidir y completar configuración de Sentry, o eliminar configuración inactiva.
- [ ] Revisar `/offline` para ambos locales.
- [ ] Mantener locale en redirecciones de confirmación de email.
- [ ] Sustituir estadísticas estáticas incorrectas por datos reales o eliminarlas.
- [ ] Mover reportes útiles a `docs/` y eliminar artefactos temporales de auditoría/Lighthouse/scripts.
- [ ] Añadir artefactos temporales relevantes a `.gitignore`.
