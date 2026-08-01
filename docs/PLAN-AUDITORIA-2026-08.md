# Plan de corrección y endurecimiento — VendeT

Este documento define el orden de trabajo para corregir la auditoría sin dejar el
proyecto en un estado intermedio.

## Reglas de trabajo

1. Cada cambio de esquema va en una migración nueva, aditiva y reversible cuando sea posible.
2. Antes de revocar permisos o cambiar una columna se actualizan todos los consumidores del repositorio.
3. No se elimina ni renombra una columna usada por código sin una migración de transición.
4. Cada fase debe pasar `tsc`, tests unitarios, lint y build; si una validación no puede ejecutarse, se documenta.
5. No se considera una corrección terminada hasta verificar también los flujos afectados.
6. Las migraciones deben aplicarse primero en staging y comprobarse con una copia de producción.

## Fases

### Fase 1 — Integridad y permisos de datos

- Reducir permisos directos del cliente sobre perfiles, productos, créditos y reseñas.
- Proteger solicitudes de verificación, cédulas, comprobantes y suscripciones push.
- Añadir operaciones atómicas para visitas, créditos y promociones.
- Mover lecturas privadas de perfil a una API autenticada.

### Fase 2 — Moderación, chat y reputación

- Revalidar moderación en servidor.
- Validar que el destinatario pertenece a la conversación.
- Validar compra/venta antes de permitir reseñas.
- Corregir triggers de reputación y evitar recursión.

### Fase 3 — Pérdida de datos y experiencia principal

- Cargar/guardar imágenes y métodos de contacto en edición y detalle.
- Corregir paginación del catálogo.
- Corregir visitas, filtros y consultas con columnas inexistentes.

### Fase 4 — Migraciones, SEO, i18n y PWA

- Consolidar la historia de migraciones sin ejecutar scripts destructivos automáticamente.
- Corregir landings ciudad/categoría, slugs duplicados, sitemap y Open Graph.
- Completar traducciones y revisar la caché del Service Worker.

### Fase 5 — Calidad y despliegue

- Corregir lint, build reproducible y auditoría de dependencias.
- Añadir pruebas de API/RLS y una prueba E2E de autenticación, compra, publicación y edición.
- Aplicar en staging, verificar y solo entonces desplegar en producción.

## Estado inicial

La primera corrección incluye la migración de permisos/integridad y los cambios de
cliente necesarios para que esos permisos no rompan los flujos existentes.
