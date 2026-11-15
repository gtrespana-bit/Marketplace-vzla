import {
  construirInventario,
  ciudadConInventario,
  ciudadCategoriaConInventario,
  type Inventario,
} from '@/lib/sitemap-inventario'

/**
 * Regresión del bug SEO más caro del proyecto: el sitemap anunciaba 2.883
 * URLs mientras ~2.640 de esas páginas respondían `noindex,follow` cuando no
 * tenían inventario. Google rastrea, ve "no index" y concluye que el sitemap
 * no es de fiar → rastrea menos todo el dominio.
 *
 * Estos tests fijan la regla: el sitemap anuncia EXACTAMENTE lo que la página
 * declara indexable.
 */
describe('inventario del sitemap', () => {
  const filas = [
    { ubicacion_ciudad: 'Caracas', categoria: { nombre: 'vehiculos' } },
    { ubicacion_ciudad: 'caracas', categoria: { nombre: 'tecnologia' } },
    { ubicacion_ciudad: 'Maracaibo', categoria: [{ nombre: 'moda' }] },
    { ubicacion_ciudad: null, categoria: { nombre: 'vehiculos' } },
    { ubicacion_ciudad: 'Valencia', categoria: null },
  ]

  const inv = construirInventario(filas)

  it('normaliza nombres de ciudad a minúsculas', () => {
    expect(inv.ciudades.has('caracas')).toBe(true)
    expect(inv.ciudades.has('maracaibo')).toBe(true)
    expect(inv.ciudades.has('valencia')).toBe(true)
    // Sin ubicación no debe crear una entrada vacía
    expect(inv.ciudades.has('')).toBe(false)
  })

  it('entiende el join de categoría como objeto y como array', () => {
    expect(inv.pares.has('caracas|vehiculos')).toBe(true)
    expect(inv.pares.has('caracas|tecnologia')).toBe(true)
    // Maracaibo llega como array (join de Supabase)
    expect(inv.pares.has('maracaibo|moda')).toBe(true)
  })

  it('no inventa pares cuando la categoría es null', () => {
    // Valencia existe como ciudad pero sin categoría resuelta
    expect(inv.ciudades.has('valencia')).toBe(true)
    expect(inv.pares.has('valencia|vehiculos')).toBe(false)
  })

  it('una ciudad sin anuncios NO entra en el sitemap', () => {
    expect(ciudadConInventario(inv, 'Caracas')).toBe(true)
    expect(ciudadConInventario(inv, 'Barquisimeto')).toBe(false)
  })

  it('una combinación ciudad/categoría sin anuncios NO entra en el sitemap', () => {
    expect(ciudadCategoriaConInventario(inv, 'Caracas', undefined, 'vehiculos')).toBe(true)
    expect(ciudadCategoriaConInventario(inv, 'Caracas', undefined, 'repuestos')).toBe(false)
  })

  it('considera el municipio además del nombre de la ciudad', () => {
    // En los datos la ciudad se guarda como capital del municipio; si el
    // anuncio usó el nombre del municipio, también debe contar.
    expect(ciudadConInventario(inv, 'Caracas', 'Libertador')).toBe(true)
    expect(ciudadCategoriaConInventario(inv, 'Otra', 'caracas', 'tecnologia')).toBe(true)
  })

  it('es insensible a mayúsculas y espacios en los parámetros', () => {
    expect(ciudadConInventario(inv, '  CARACAS  ')).toBe(true)
    expect(ciudadCategoriaConInventario(inv, 'Caracas', undefined, ' Vehiculos ')).toBe(true)
  })

  describe('fail-open: nunca dejar el sitio sin sitemap', () => {
    const nulo: Inventario | null = null

    it('si el inventario es desconocido, anuncia todo (comportamiento anterior)', () => {
      expect(ciudadConInventario(nulo, 'Cualquier Ciudad')).toBe(true)
      expect(ciudadCategoriaConInventario(nulo, 'Cualquier Ciudad', undefined, 'vehiculos')).toBe(true)
    })
  })

  it('un inventario vacío produce un sitemap sin landings locales', () => {
    const vacio = construirInventario([])
    expect(ciudadConInventario(vacio, 'Caracas')).toBe(false)
    expect(ciudadCategoriaConInventario(vacio, 'Caracas', undefined, 'vehiculos')).toBe(false)
  })
})
