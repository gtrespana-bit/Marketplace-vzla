# 📊 Análisis de Google Analytics 4 — 20 de octubre de 2026

> **Petición:** «Google Analytics no recibe información. ID `G-RMMQFHP6EC`. Analiza si todo está correctamente implantado.»
> **Resultado:** no era un problema de ID, de permisos ni de la propiedad. **No había ninguna etiqueta de GA4 desplegada** (se eliminó el 1 de agosto y nunca se volvió a instalar) y, además, la CSP habría bloqueado el script si se hubiera añadido sin tocarla. Ya está reinstalado y verificado.

---

## 1. Diagnóstico: por qué no llegaba ni un solo dato

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **No existe ninguna etiqueta de GA4 en el código.** | `grep -rn "G-RMMQFHP6EC\|gtag\|googletagmanager"` → 0 resultados en `src/`. |
| 2 | **Se eliminó expresamente el 1 de agosto de 2026** por dudas de rendimiento y nunca se revirtió. | `docs/analisis-rendimiento-2026-08-01.md` §1 y `docs/seo-fixes-2026-08-01.md` (fila «Sin GA/GTM»). |
| 3 | `NEXT_PUBLIC_GA_ID` no se leía en ningún sitio. | Solo aparece en la documentación histórica. |
| 4 | **La CSP impedía cargar GA.** | `next.config.js` → `script-src` sin `googletagmanager.com` y `connect-src` sin `*.google-analytics.com` / `*.analytics.google.com`. Aunque se hubiera reañadido el componente, el navegador habría bloqueado `gtag.js` y en GA no habría aparecido nada (solo un error de CSP en consola). |
| 5 | **El banner de cookies existía pero no se montaba.** | `src/components/CookieConsent.tsx` no se importaba en ningún layout. El consentimiento no se gestionaba. |
| 6 | **No había medición de navegaciones SPA.** | Sin GA instalado es irrelevante, pero al reinstalarlo hay que enviar `page_view` en cada cambio de ruta del App Router (las navegaciones internas no recargan la página). |
| 7 | Vercel Analytics y Speed Insights sí estaban activos. | Son productos distintos de Google. No envían nada a GA4. |

**Conclusión:** la implantación de GA4 era inexistente. No hay datos históricos desde el 1 de agosto de 2026 porque durante ese periodo no se envió ningún hit.

---

## 2. Qué se ha implementado

### Archivos nuevos

| Archivo | Función |
|---|---|
| `src/components/GoogleAnalytics.tsx` | Carga `gtag.js` con `next/script` en `afterInteractive` (no bloquea el render). Emite `config` con `send_page_view: true` y envía un `page_view` manual en cada navegación SPA. Excluye `/admin` y `/en/admin`. |
| `src/lib/analytics.ts` | Constantes y utilidades: ID de medición validado, `getStoredConsent` / `setStoredConsent` (Consent Mode v2), `trackEvent` y `trackPageView`. |
| `tests/unit/analytics.test.ts` | 7 tests de la capa de analítica y consentimiento. |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/app/layout.tsx` | Monta `<GoogleAnalytics />`. Añade `dns-prefetch` a `googletagmanager.com` y un script inline en `<head>` con los valores **por defecto de Consent Mode v2**, que se ejecuta antes de que cargue `gtag.js`. |
| `next.config.js` | CSP: `script-src` + `https://www.googletagmanager.com`; `connect-src` + `https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`. |
| `src/components/CookieConsent.tsx` | Ahora guarda la decisión y la comunica a GA4 (`consent update`). Traducido es/en, colocado por encima de la navegación inferior en móvil. |
| `src/components/LocaleClientEffects.tsx` | Monta el banner de cookies (antes era código muerto). |
| `src/i18n/dictionaries/es.json` / `en.json` | Nueva sección `cookies`. |
| `src/app/[locale]/(auth)/register/page.tsx` | Evento `sign_up` al crear la cuenta. |
| `src/app/[locale]/publicar/page.tsx` | Evento `publicar_anuncio` al publicar correctamente. |
| `src/app/[locale]/producto/[slug]/ProductoPageClient.tsx` | Eventos `contactar_vendedor` (chat, WhatsApp, teléfono, email, Messenger) y `compartir_producto` (WhatsApp, copiar enlace). |

### Cómo se comporta ahora

- **Primera página:** la mide automáticamente `gtag('config')` → no se pierde la visita aunque el usuario rebote antes de que React hidrate.
- **Navegaciones internas:** `usePathname()` detecta el cambio de ruta y envía un `page_view` con `page_title`, `page_location` y `page_path`.
- **Consentimiento:** por defecto `analytics_storage: 'granted'` (se mide y el usuario puede rechazar con el banner). Si rechaza, se envía `consent update` con `denied` y GA4 deja de usar cookies. `ad_storage`, `ad_user_data` y `ad_personalization` van SIEMPRE en `denied`: no hay publicidad ni remarketing.
- **Modo estricto opcional:** con `NEXT_PUBLIC_GA_REQUIRE_CONSENT=1`, GA4 arranca en `denied` y solo mide si el usuario pulsa «Aceptar» (modelo RGPD previo). Reduce los datos, pero es más conservador.
- **Rendimiento:** el script externo se carga tras la hidratación (`afterInteractive`), no bloquea LCP ni TTFB. Se mantiene la política de rendimiento del proyecto.
- **Admin:** `/admin` y `/en/admin` no cargan gtag ni envían eventos.
- **Dev, previews y localhost:** GA no se carga con `next dev`, en deployments *preview* de Vercel ni en hosts distintos de `vendet.online` / `www.vendet.online`. Así las pruebas no contaminan la propiedad de producción. Se puede forzar en local con `NEXT_PUBLIC_GA_FORCE=1`.

---

## 3. Eventos disponibles desde el primer despliegue

| Evento | Cuándo se envía | Parámetros | Recomendación |
|---|---|---|---|
| `page_view` | Carga inicial + cada navegación SPA | `page_title`, `page_location`, `page_path` | Automático |
| `sign_up` | Cuenta creada correctamente | `method: 'email'` | **Marcar como evento clave** |
| `publicar_anuncio` | Anuncio publicado | `categoria`, `subcategoria`, `precio_usd` | **Marcar como evento clave** |
| `contactar_vendedor` | Clic en chat / WhatsApp / teléfono / email / Messenger | `metodo`, `producto_id`, `categoria` | **Marcar como evento clave** |
| `compartir_producto` | Compartir por WhatsApp o copiar enlace | `metodo` | Secundario |

`sign_up`, `publicar_anuncio` y `contactar_vendedor` son las tres conversiones del embudo que el propio proyecto tenía pendientes (`docs/seo-fixes-2026-08-01.md`, «Pasos pendientes»). Hay que marcarlas manualmente como eventos clave en GA4; enviarlas no las convierte en conversión por sí solo.

---

## 4. Verificación realizada (local, build de producción)

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ sin errores |
| `npx eslint` (archivos tocados) | ✅ 0 errores (solo warnings previos de `<img>` en `publicar`) |
| `npm test` | ✅ 16 suites / **100 tests** |
| `npm run build` | ✅ `Compiled successfully in 17.2s` |
| HTML generado | ✅ incluye `<script id="ga-consent-default">` y `<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=G-RMMQFHP6EC">` |
| Cabecera CSP servida | ✅ incluye `googletagmanager.com` en `script-src` y `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` en `connect-src` |
| Servidor de producción local (`next start`) | ✅ HTTP 200 en `/` |

> Nota: `npx next start` avisa de que el proyecto usa `output: 'standalone'` (lo normal en Vercel). En local, si se quiere probar el standalone: `node .next/standalone/server.js`. No afecta al despliegue.

---

## 5. Lo que falta por hacer **en GA4 / Vercel** (no en código)

1. **Confirmar el flujo de datos.**
   GA4 → Administrar → Flujos de datos. Debe existir un flujo **Web** con URL `https://vendet.online` y medición `G-RMMQFHP6EC`. Si el flujo apunta a `vendete.online`, `www...` o a otro dominio, edítalo: el sitio redirige todo a `vendet.online`, pero GA4 atribuye por `page_location`.
2. **Marcar conversiones.**
   GA4 → Administrar → Eventos → marcar como **evento clave**: `sign_up`, `publicar_anuncio`, `contactar_vendedor`. Sin este paso se ven como eventos normales, no como conversiones.
3. **Revisar «Medición mejorada».**
   GA4 → Administrar → Flujos de datos → Medición mejorada. Si «Cambios de página según eventos del historial del navegador» está **activado**, hay doble medición de las navegaciones SPA: o lo desactivas en GA4, o defines `NEXT_PUBLIC_GA_SPA_PAGEVIEWS=0` en Vercel. Recomendado: desactivarlo en GA4 y dejar la medición manual del código.
4. **Probar en tiempo real.**
   Abre `https://vendet.online` en una ventana de incógnito (sin bloqueadores), acepta el banner y comprueba GA4 → Informes → **Tiempo real**. Debe aparecer 1 usuario activo y el `page_view` con la ruta.
5. **Comprobar la petición en el navegador.**
   DevTools → Red → filtrar `collect`. Debe haber peticiones a `region1.google-analytics.com/g/collect?v=2&tid=G-RMMQFHP6EC...`. Si aparecen bloqueadas en rojo, es un bloqueador de anuncios, no la web.
6. **No usar un bloqueador al validar.**
   uBlock Origin, Brave Shields, AdGuard y el modo de protección de Safari bloquean GA. También es normal perder un 10–30 % del tráfico real por esta razón.
7. **Vincular Search Console** (Administrar → Vinculaciones de productos) si quieres ver consultas de Google junto a la analítica.
8. **Paciencia con los informes.**
   Tiempo real es inmediato; los informes estándar (Adquisición, Participación) pueden tardar **24–48 h** en consolidar. Si acabas de desplegar, no esperes el histórico: no existe.

---

## 6. Variables de entorno

Todas son **opcionales**: el sitio funciona sin configurar nada porque el ID real está como valor por defecto.

| Variable | Valor | Efecto |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-RMMQFHP6EC` | Sobreescribe el ID de medición. Útil si algún día hay un flujo de staging. Se valida con el formato `G-...`; un valor inválido cae al ID por defecto con un aviso en consola. |
| `NEXT_PUBLIC_GA_REQUIRE_CONSENT` | `1` | Consentimiento previo estricto: no se mide hasta que el usuario acepta. Sin definir: se mide y el usuario puede rechazar. |
| `NEXT_PUBLIC_GA_SPA_PAGEVIEWS` | `0` | Desactiva los `page_view` manuales en navegaciones internas (úsalo solo si GA4 ya los mide por «historial del navegador»). |
| `NEXT_PUBLIC_GA_FORCE` | `1` | Fuerza la carga de GA también en desarrollo/preview (solo para depurar; contamina la propiedad real). |

> Al ser variables `NEXT_PUBLIC_*`, se incrustan en el build: después de cambiarlas hay que **redesplegar** en Vercel.

---

## 7. Limitaciones que conviene tener presentes

- **Bloqueadores de anuncios / ITP:** GA4 pierde entre un 10 % y un 30 % de las visitas reales en sitios como este. No es un fallo de la implantación.
- **Consent Mode:** si el usuario rechaza, GA4 sigue enviando *pings* sin cookies (medición agregada), pero no verás su comportamiento detallado ni podrá usarse para remarketing.
- **Umbralización:** GA4 oculta datos en informes con pocos usuarios para proteger la privacidad.
- **Admin excluido a propósito:** las visitas al panel no cuentan.
- **Vercel Analytics ≠ GA4:** pueden convivir. Vercel Analytics mide sin cookies desde su propia infraestructura; no sustituye a GA4 ni comparte datos con Google.

---

## 8. Si algún día hay que volver a desactivarlo

1. Quitar `<GoogleAnalytics />` de `src/app/layout.tsx`.
2. Opcional: quitar el script `ga-consent-default` y las entradas GA del CSP en `next.config.js`.

El resto del código (`trackEvent`) no rompe nada si GA no está cargado: las llamadas se ignoran sin lanzar errores (hay test que lo cubre).

---

## 9. Referencias internas

- `docs/analisis-rendimiento-2026-08-01.md` — motivo histórico de la retirada de GA.
- `docs/seo-fixes-2026-08-01.md` — estado SEO y variables de entorno (nota de agosto).
- `tests/unit/analytics.test.ts` — cobertura de la capa de analítica.
