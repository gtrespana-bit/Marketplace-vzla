# Análisis estratégico de VendeT — Conversión, psicología y crecimiento

> Lente aplicada: dirección de producto de marketplace (liquidez, retención, densidad) + psicología del consumidor aplicada a clasificados en Venezuela (confianza, urgencia, prueba social, fricción).
>
> Base: auditoría de código completa (registro, publicar, producto, vendedor, chat, créditos, emails, PWA, SEO). El SEO técnico ya está auditado en `ANALISIS-SEO.md`; aquí no se repite.

---

## 1. El modelo mental: qué siente el usuario venezolano al llegar

Antes de tocar botones, entendamos las dos personas que llegan:

**El vendedor** quiere: deshacerse de algo **ya**, al mejor precio, sin complicaciones y sin que lo estafen. Su alternativa real no es MercadoLibre: es **el grupo de Facebook de su ciudad** (gratis, ya tiene público) y **el estado de WhatsApp**. VendeT le tiene que dar algo que eso no le da: alcance, visibilidad de su anuncio, y protección.

**El comprador** quiere: encontrar **ese** artículo, saber que el vendedor es real, y pagar menos. Su miedo #1 —por cultura, por experiencia— es **la estafa**. No compra "productos": compra **a una persona**. Si la página no resuelve "¿este tipo es de fiar?" en 3 segundos, se va.

**Las 6 palancas psicológicas que mueven un clasificado**, y que usaremos como criterio de todo el análisis:

| Palanca | Qué genera | Dónde aplica |
|---|---|---|
| Confianza (prueba de seguridad) | "Aquí no me roban" | Perfil vendedor, verificación, reseñas, ventas verificadas |
| Prueba social | "Aquí pasa algo, la gente sí vende" | Contadores de actividad, feed de vendidos, reseñas |
| Escasez/urgencia | "Si espero, lo pierdo" | "hace 2 h", visitas hoy, N lo guardaron |
| Reciprocidad | "Me dieron algo, devuelvo" | 1 crédito gratis, renovaciones gratis, datos útiles (precios) |
| Aversión a la pérdida | "No quiero perderme esto" | Búsquedas guardadas con alerta, aviso de bajada de precio |
| Fricción cero | "Esto es más fácil que en Facebook" | Publicar en <2 min, contactar sin registro |

**La regla de oro que hoy se incumple:** cada elemento de la página debe o **generar confianza**, o **crear urgencia**, o **reducir fricción**. Si no hace ninguna de las tres, es ruido que compite con la acción principal.

---

## 2. Auditoría por embudo

### 2.1 Adquisición (SEO/contenido) — ✅ fuerte, con 3 huecos

**Ya está bien (no romper):** sitemap + 330 landings de ciudad, URLs semánticas, structured data (Product, ItemList, Breadcrumb, FAQ), blog con 14 artículos útiles, hreflang correcto.

**Huecos:**
1. **El blog casi no enlaza al catálogo** (solo ~6 enlaces internos en 14 artículos). Un artículo sobre "precios de iPhone" que no enlaza a `/categoria/tecnologia` ni a búsquedas de iPhone es autoridad que se evapora. *Cada artículo debería terminar con 3-5 enlaces a categorías/búsquedas reales.*
2. **Landings de ciudad con contenido delgado** (la auditoría SEO ya detectó la taxonomía rota). Una landing de ciudad que no muestra "X anuncios nuevos esta semana en Valencia" no convierte ni posiciona.
3. **No hay landings de "intención larga"**: "vender iPhone Caracas", "bicicletas usadas Maracaibo". Son las que ganan tráfico barato y con intención de compra inmediata.

### 2.2 Primera visita (home) — ✅ ya corregida en la iteración anterior

La home ahora enseña productos y "publicar gratis" antes que créditos. **Pendiente de la home:**
- El stat **"+130 productos activos"** es psicológicamente contraproducente: un número bajo revela inventario escaso. Nadie quiere ser vendedor #131 de un mercado vacío ni comprador de un mercado con 130 cosas. → Reemplazar por **medidores de actividad** ("X anuncios esta semana", "X ventas verificadas") que crecen aunque el inventario total sea pequeño, o por densidad local ("Caracas: X anuncios nuevos hoy"). **Nunca mostrar absolutos bajos.**
- El banner "En MercadoLibre pagas por publicar" nombra al competidor en la puerta de tu casa = publicidad gratis para ellos y tono defensivo. → Llevar la comparativa a `/como-funciona` (donde ya existe la tabla vs.) y en la home usar marco positivo: **"Publica, vende, cobra. 0 comisiones. Siempre."**

### 2.3 Confianza — ⚠️ el eslabón más débil de toda la web

Es la barrera #1 del mercado venezolano y hoy está a mitad de construcción:

**Ya existe (bien):** `BadgeVerificado`, `SellerReputation`, reseñas por venta, tips de "compra seguro" en producto, botón de reportar, conversión Bs/USD con tasa BCV.

**Faltan las señales de "aquí SÍ se vende":**
1. **No hay prueba social de transacciones.** El comprador nuevo no ve ninguna evidencia de que alguien haya vendido algo jamás. → Feed público **"Vendido esta semana"** en la home (título + ciudad + "vendido en X días"), usando los datos que ya genera `marcar-vendido`. Es la señal más poderosa disponible y **ya tienes los datos**.
2. **La reputación está enterrada.** Las reseñas existen pero casi no se ven: no hay testimonios en home, ni contador de "ventas verificadas" en la home, ni resumen en el card de producto ("Juan · ⭐4.8 · 12 ventas").
3. **Las plantillas de referencia del repo dejaban la marca vieja "Todo Anuncios"** (`supabase-email-templates/confirmation-mail-es*.md`). *(Verificado con el equipo: la configuración real en Supabase ya estaba correcta — marca VendeT y dominio vendet.online.)* El riesgo era del repositorio: quien copiara la plantilla del repo al dashboard habría retrocedido la marca y reintroducido el dominio viejo `marketplacevzla.vercel.app`.

   **✅ Sincronizado:** plantillas v1/v2 reescritas a marca VendeT (logo "Vende**T**" con los colores del sitio), copy corregido ("Ya puedes…" en vez de "Próximamente", sin claim de "la plataforma más grande"), copyright deduplicado, dominio de las instrucciones → `vendet.online`. También README, `scripts/generar-publicaciones.js` y docs internas. Producción no requirió cambios.
4. **Velocidad de respuesta del vendedor** ("responde en ~2 h") — la señal #1 que usa un comprador para decidir si escribe. Se calcula con timestamps del chat (datos que ya existen).

### 2.4 Publicar (el momento más crítico del embudo vendedor) — ⚠️ buena base, fricción optimizable

**Ya está bien:** publicación **instantánea** (solo lo sospechoso va a pendiente — ver `api/publicar/route.ts`), moderación posterior, compresión de imágenes, banner de éxito con `?nuevo=1`.

**Fricción a quitar:**
1. **4 pasos percibidos** (categoría → detalles → fotos → revisar) cuando la psicología dice: **la foto es el gancho**. Facebook/WhatsApp ya condicionaron al usuario a "saco foto → lo subo". → Flujo **foto-primero**: pantalla 1 = foto + título + precio (3 campos, listo para publicar), el resto opcional después de publicar ("mejora tu anuncio"). La publicación en 2 minutos prometida en la home debe sentirse real.
2. **El registro pide demasiado antes de dar valor**: nombre, email, teléfono, contraseña ×2, estado, ciudad + mayúscula + número. → Teléfono y ubicación **al publicar**, no al registrarse; regla de contraseña simple (8 caracteres, sin complejidad obligatoria — estándar NIST 800-63B; la complejidad obliga a contraseñas que olvidan y no vuelven).
3. **El pico emocional se desperdicia**: el banner de éxito dice "publicado" y ya. Ese es el momento de máxima dopamina del vendedor → ahí va el **botón "Compartir en WhatsApp/Instagram"** con enlace directo a su anuncio (trae compradores de SU red, gratis) y el "te avisaremos cada vez que alguien lo vea". (Regla peak-end: el final del flujo es lo que recuerda.)

### 2.5 Contactar/comprar (embudo comprador) — ⚠️ muro de registro

`handleContacto` en `ProductoPageClient.tsx` exige login **para todo** contacto (aunque el vendedor publicó WhatsApp, si lo configuró se muestra el link — bien). El registro-forzado para escribir es la fricción que más compradores mata en móvil: te llega con la tarjeta preparada y le pides contraseña con mayúscula.

→ **Permitir el primer mensaje como invitado** (email o WhatsApp directo), y pedir cuenta solo para guardar el historial ("crea tu cuenta para no perder la conversación"). El chat interno protege del spam: mantengámoslo, pero la primera barrera no puede ser un formulario.

**Falta el elemento que convierte interés en acción:**
- **No hay productos relacionados** en la página de producto (verificado: no existe la sección). Es un **callejón sin salida**: si el artículo no me convence, salgo de la web en vez de seguir comprando. → "También te puede interesar" (misma categoría/subcategoría, misma query barata) = +páginas/sesión, +SEO interno, y salvataje cuando el producto está vendido.
- **Señales de urgencia incompletas**: hay visitas totales y "publicado hace X". Faltan **"X visitas hoy"** y **"N personas lo guardaron en favoritos"** (el dato de favoritos ya existe en la tabla `favoritos`). Ambas son urgency honesta, calculable con datos reales.

### 2.6 Vender y repetir (retención) — 🔴 el mayor hueco estructural

Hoy, terminada la visita, **no existe ninguna razón para volver**:

1. **No hay búsquedas guardadas ni alertas.** El comprador que no encuentra su iPhone hoy se va… para siempre. → **"Avísame cuando aparezca"** (alerta por email/push — la infra de push ya está montada). Es EL mecanismo de retención de compradores en todos los clasificados del mundo (Craigslist → notify, Milanuncios → alertas). Además produce el email con mejor open rate posible: "Hay un iPhone 12 en Caracas por $240".
2. **No hay aviso de "bajó de precio"** ni de "tu anuncio tiene X visitas esta semana". Los vendedores no vuelven a mirar su anuncio → no renuevan, no destacan, no publican el segundo. El email "Esta semana 47 personas vieron tu anuncio" (endowment: le recuerda el valor que le diste gratis) es el que reactiva la monetización con mejor CTR.
3. **No hay programa de referidos.** Tu usuario venezolano vive en WhatsApp; cada vendedor que comparte su anuncio ya te está haciendo adquisición gratis — pero no hay loop estructurado. → Referido de doble lado: "invita a un vendedor: tú +2 créditos, él +1". El crédito es la moneda perfecta para esto (coste marginal ~0).
4. **No hay renovación de anuncios** ("renovar gratis cada 7 días"): reviviría inventario viejo (los anuncios de hace 3 semanas están muertos) y crearía el hábito de retorno semanal del vendedor.
5. Gamificación ya existe pero está oculta (Bonus Emprendedor: 10 publicaciones → 5 créditos, solo visible en dashboard) → subirla al propio flujo de publicar ("te faltan 3 publicaciones para 5 créditos gratis" — goal gradient effect).

### 2.7 Monetización — ✅ modelo correcto, ejecución con fricción

El modelo (publicar gratis, destacar opcional) es el correcto y ya está bien dosificado en la home. Dos afinidades:

1. **La aprobación manual de créditos (8am–10pm)** es un bote de fricción a las 11pm, que es cuando el venezolano navega. No se puede automatizar de un día para otro, pero sí: estado del comprobante en tiempo real ("recibido → en revisión → aprobado ≈ 15 min en horario"), y **auto-aprobación con límite** para compradores repetidos sin incidentes (confianza progresiva).
2. **El header muestra "Créditos" a visitantes sin cuenta** (icono ⚡ + badge "1 gratis" siempre visible). Para el recién llegado sigue siendo ruido de "aquí se paga". → Mostrar el acceso a créditos solo a usuarios logueados; el visitante debe ver Buscar/Publicar/Entrar.

### 2.8 Mobile web — 🔴 invisibilidad estructural

`BottomTabNav` **solo se renderiza en modo PWA** (`if (!isPWA()) return null`). Pero el 90%+ de tu tráfico móvil llega por enlace compartido (WhatsApp, Google) **al navegador**, no a la PWA. Es decir: la barra inferior con el botón grande de publicar —el patrón que mejor convierte en móvil— está construida y **apagada para casi todos**. → Activarla en móvil web (esconde el header al hacer scroll, si preocupa el espacio).

---

## 3. Plan priorizado

### P0 — Esta semana (alto impacto, bajo esfuerzo; la mayoría usa datos/infra que ya existe)

| # | Acción | Palanca | Estado |
|---|---|---|---|
| 1 | Corregir marca "Todo Anuncios" en emails (repo) | Confianza | ✅ Sincronizado (Supabase ya estaba bien) |
| 2 | Productos relacionados en página de producto | Exploración | ✅ Aplicado |
| 3 | Activar BottomTabNav en móvil web (no solo PWA) | Fricción | ✅ Aplicado |
| 4 | Feed "Vendidos recientemente" en home (datos de `marcar-vendido` + migración `vendido_fecha`) | Prueba social | ✅ Aplicado |
| 5 | Reemplazar stat "+130 productos" por actividad semanal; quitar "MercadoLibre" del banner home | Psicología | ✅ Aplicado |
| 6 | Botones de compartir (WhatsApp/copiar) en el éxito post-publicación | Peak-end | ✅ Aplicado |
| 7 | "N personas lo guardaron" en producto ("visitas hoy" requiere tracking diario nuevo — pendiente) | Urgencia | ✅ Parcial |
| 8 | Header: ocultar "Créditos" a visitantes | Claridad | ✅ Aplicado |
| 9 | (bug) `FORMATTING_ERROR` de next-intl en `/creditos`, `/publicar` y en el enlace WhatsApp del producto | — | ✅ Aplicado |

### P1 — Este mes (las palancas estructurales de retención)

| # | Acción | Por qué | Estado |
|---|---|---|---|
| 10 | **Búsquedas guardadas + alertas push** | El mecanismo #1 de retorno de compradores; usa la infra de push existente | ✅ Aplicado (migración `20260829000103`, API + botón en /buscar + cron cada 6 h) |
| 11 | Emails de ciclo de vida: "tu anuncio tuvo X visitas", "alguien lo guardó", "bajó de precio" | Endowment + reactivación del vendedor | ✅ Aplicado (digest semanal email+push con snapshot de visitas — migración `20260829000105` — y cron diario de bajadas de precio a quien guardó en favoritos) |
| 12 | **Flujo publicar foto-primero** + simplificar registro | Fricción de activación | ✅ Aplicado (fotos → categoría → detalles → revisar; registro de 4 campos) |
| 13 | **Renovar anuncio gratis cada 7 días** | Inventario vivo + hábito semanal | ✅ Aplicado (API `/api/productos/renovar` + botón en Gestionar) |
| 14 | Primer mensaje como invitado (sin registro para el 1er contacto) | Quitar el muro al comprador caliente | ✅ Aplicado (nudge con alternativa WhatsApp + crear cuenta en 1 clic, en vez de redirect seco; WhatsApp/teléfono públicos ya existían) |
| 15 | Resumen de reputación visible en el card de producto ("⭐4.8 · 12 ventas") + tiempo de respuesta del vendedor | Confianza en 3 segundos | 🔶 Ya existía en la página de producto (SellerReputation). Pendiente: resumen en cards de listados y tiempo de respuesta |
| 16 | Bonus Emprendedor visible en el flujo de publicar | Goal gradient | ✅ Ya existía (barra de progreso {count}/10 en el paso final de /publicar) |
| 17 | Blog: 3-5 enlaces internos a categorías/búsquedas por artículo + 10 landings "vender X en Y" | Autoridad → conversación | 🔶 Bloque de enlaces aplicado en todos los artículos (categorías según tags + catálogo + publicar). Landings "vender X en Y" pendientes |

### P2 — Este trimestre (ventaja competitiva)

| # | Acción | Nota |
|---|---|---|
| 18 | **Programa de referidos** (2+1 créditos) | Loop de adquisición vía WhatsApp |
| 19 | **Guía de precios con datos propios** ("el iPhone 12 se vende entre $220-260 esta semana") | Valor que ni Facebook ni ML dan; posiciona como experto; alimenta SEO |
| 20 | ~~Estrategia de densidad: dominar 2-3 ciudades~~ | **Decisión del equipo: mantener cobertura NACIONAL** — se descarta la concentración por ciudad. Las 330 landings locales siguen siendo el soporte SEO de esa decisión |
| 21 | Auto-aprobación de créditos para compradores recurrentes | Confianza progresiva |
| 22 | Onboarding del vendedor verificado (cedula ya existe en admin) con ladder de beneficios | Confianza + estatus |
| 23 | Decidir con datos el coste real de `/en` (duplica mantenimiento de textos) | Si no hay tráfico, redirigir |

### QUITAR (además de lo ya quitado en la home)

1. **Muro de registro para el primer contacto** (ver #14).
2. **Campo teléfono/ubicación en el registro** (mover al momento de publicar).
3. **Reglas de contraseña compleja** (mayúscula+número) — 8 caracteres bastan.
4. **"MercadoLibre" en el banner de la home** — comparar está bien en `/como-funciona`, no en tu escaparate.
5. **El número total de productos cuando es bajo** — mostrar actividad, no inventario.
6. **Badge "1 gratis" permanente en el header para visitantes.**

---

## 4. Las métricas que importan (y las que no)

**Norte del negocio:** % de anuncios con ≥1 contacto en 72 h (**liquidez**). Esa es la métrica que define si el marketplace vive. Todo lo anterior tira de ella.

| Métrica | Objetivo | Palanca que la mueve |
|---|---|---|
| Tiempo registro→1ª publicación | < 5 min | P0-6, P1-12 |
| % anuncios con contacto en 72 h | > 40% | Relacionados, alertas, urgencia |
| % compradores con búsqueda guardada | > 15% (predice retención D30) | P1-10 |
| % vendedores con 2+ anuncios/30 días | > 25% | Renovación, bonus, emails |
| Retorno D7 / D30 | x2 / x3 vs. hoy | Alertas + emails de ciclo |
| Open rate "tu anuncio fue visto" | > 40% | P1-11 |

**Dejar de mirar:** visitas totales, usuarios registrados, páginas vistas. Son vanidad hasta que la liquidez funcione.

---

## 5. El hilo psicológico de la experiencia ideal (para qué exista norte)

1. **Llega** (WhatsApp/Google) → ve productos reales y "hoy" en 3 segundos → *confianza + actividad*.
2. **Busca** "iPhone" → no está → botón **"avísame cuando aparezca"** → *aversión a la pérdida convertida en retención*.
3. **Encuentra** → vendedor con ⭐, ventas verificadas, "3 personas lo guardaron hoy" → escribe **sin registrarse** → *urgencia + fricción cero*.
4. **Le toca vender** → foto + título + precio → publicado en 90 segundos → celebración + compartir a WhatsApp → *peak-end*.
5. **Vuelve** (email: "47 personas vieron tu anuncio") → renueva, destaca, publica el segundo → *endowment + hábito*.
6. **Trae a su primo** → referido con créditos → *loop*.

Cada pieza de este ciclo existe hoy a medias en el código; ninguna requiere re-arquitectura. Es priorización, ejecución y medición.
