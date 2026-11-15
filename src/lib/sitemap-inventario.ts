/**
 * Cálculo de inventario para el sitemap.
 *
 * Vive en `lib/` (y no dentro de `app/sitemap.ts`) para poder probarlo con
 * Jest: una ruta de metadata de Next no se puede importar de forma aislada.
 *
 * ⚠️ REGLA DE CONSISTENCIA con `lib/seo-landings.ts`:
 * la página de ciudad/categoría decide `index` consultando si HAY anuncios;
 * el sitemap debe anunciar exactamente las mismas URLs. Si estos dos criterios
 * divergen, el sitemap acaba lleno de URLs `noindex` y Google aprende a
 * desconfiar del dominio entero.
 */

export type Inventario = {
  /** nombres de ciudad en minúsculas con al menos un anuncio activo */
  ciudades: Set<string>
  /** claves `${ciudad}|${categoria}` en minúsculas */
  pares: Set<string>
}

export const MODERACION_FILTRO = 'estado_moderacion.is.null,estado_moderacion.eq.aprobado'

const norm = (s: unknown) => (typeof s === 'string' ? s.trim().toLowerCase() : '')

/**
 * Construye el inventario a partir de las filas de `productos`.
 * Se separa del acceso a datos para poder testearlo sin red.
 */
export function construirInventario(rows: unknown[]): Inventario {
  const ciudades = new Set<string>()
  const pares = new Set<string>()

  for (const row of rows) {
    const r = row as any
    const ciudad = norm(r?.ubicacion_ciudad)
    if (!ciudad) continue
    ciudades.add(ciudad)

    // Supabase devuelve el join como objeto o como array según la cardinalidad.
    const cat = r?.categoria
    const catNombre = Array.isArray(cat) ? cat[0]?.nombre : cat?.nombre
    const catSlug = norm(catNombre)
    if (catSlug) pares.add(`${ciudad}|${catSlug}`)
  }

  return { ciudades, pares }
}

/** ¿Esta ciudad tiene inventario? `null` = dato desconocido → fail-open. */
export function ciudadConInventario(
  inv: Inventario | null,
  nombre: string,
  municipio?: string,
): boolean {
  if (!inv) return true
  if (inv.ciudades.has(norm(nombre))) return true
  if (municipio && inv.ciudades.has(norm(municipio))) return true
  return false
}

/** ¿Esta ciudad tiene inventario de esta categoría? `null` → fail-open. */
export function ciudadCategoriaConInventario(
  inv: Inventario | null,
  nombre: string,
  municipio: string | undefined,
  categoriaSlug: string,
): boolean {
  if (!inv) return true
  const cat = norm(categoriaSlug)
  const claves = [norm(nombre)]
  if (municipio) claves.push(norm(municipio))
  return claves.some((k) => inv.pares.has(`${k}|${cat}`))
}
