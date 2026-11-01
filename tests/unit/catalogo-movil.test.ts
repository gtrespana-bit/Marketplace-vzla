/**
 * Regresión: el catálogo en móvil no debe quedarse "en blanco" ni mentir.
 *
 * Contexto del bug (reportado como "el catálogo no carga, solo en móvil"):
 *  1. Si la consulta del servidor fallaba (Supabase lento → timeout de la
 *     función serverless, habitual en 3G/4G), `initialProducts` llegaba vacío
 *     y el cliente pintaba "No hay productos en esta categoría" sin pedir
 *     nada más. El usuario veía un catálogo vacío.
 *  2. El `<Suspense>` de la página no tenía fallback (`undefined`), así que
 *     mientras el RSC viajaba el móvil mostraba una pantalla en blanco.
 *
 * Estos tests fijan el contrato: el estado de error del servidor se propaga
 * (`initialOk`) y el cliente puede reintentar por su cuenta.
 */
import * as fs from 'fs'
import * as path from 'path'

const read = (rel: string) => fs.readFileSync(path.join(__dirname, '../../', rel), 'utf8')

describe('catálogo — carga en móvil', () => {
  const serverPage = read('src/app/[locale]/catalogo/page.tsx')
  const clientPage = read('src/app/[locale]/catalogo/CatalogoPage.tsx')

  test('el servidor distingue "vacío" de "falló"', () => {
    // La consulta fallida debe propagar ok:false, no devolver un catálogo vacío.
    expect(serverPage).toMatch(/ok:\s*false/)
    expect(serverPage).toMatch(/ok:\s*true/)
    // El cliente recibe el flag.
    expect(serverPage).toContain('initialOk={ok}')
  })

  test('el Suspense tiene fallback visible (nunca undefined)', () => {
    expect(serverPage).toMatch(/<Suspense\s+fallback=/)
    expect(serverPage).not.toMatch(/<Suspense>\s*\n\s*<CatalogoClient/)
  })

  test('el cliente reintenta solo si el SSR falló', () => {
    expect(clientPage).toMatch(/initialServerFailed/)
    expect(clientPage).toMatch(/loadPage\(\{\s*page:\s*1/)
    // Y muestra un estado de error accionable, no el estado "vacío".
    expect(clientPage).toContain("t('catalog.offlineTitle')")
    expect(clientPage).toContain("t('catalog.offlineCta')")
  })

  test('no se filtra el mensaje interno de Supabase al usuario en producción', () => {
    expect(clientPage).toMatch(/process\.env\.NODE_ENV\s*!==\s*'production'/)
  })

  test('las tarjetas declaran 2 columnas en móvil (grid del catálogo)', () => {
    const grid = read('src/components/OptimizedProductGrid.tsx')
    expect(grid).toContain('grid-cols-2')
    expect(grid).not.toContain('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3')
  })
})

describe('buscar — sin HTML escapado visible', () => {
  test('no se inyectan entidades/quotes dentro de un template string JSX', () => {
    const buscar = read('src/app/[locale]/buscar/BuscarClient.tsx')
    // Este patrón renderizaba literalmente &ldquo;<strong>…</strong>&rdquo;
    expect(buscar).not.toMatch(/\$\{query\}[^\n]*<\/strong>&rdquo;/)
    expect(buscar).not.toContain('&ldquo;')
    expect(buscar).not.toContain('&rdquo;')
  })
})

describe('ficha de producto — cacheable (rendimiento móvil)', () => {
  test('la página puede prerenderizarse (force-static + revalidate)', () => {
    const page = read('src/app/[locale]/producto/[slug]/page.tsx')
    expect(page).toContain("export const dynamic = 'force-static'")
    expect(page).toMatch(/export const revalidate = \d+/)
    // Datos sociales (favoritos/reseñas) envueltos para no volver dinámica la ruta.
    expect(page).toMatch(/getFavoritosCount/)
    expect(page).toMatch(/withTimeout/)
  })

  test('el cliente no usa useSearchParams (evita render dinámico)', () => {
    const client = read('src/app/[locale]/producto/[slug]/ProductoPageClient.tsx')
    // Solo el comentario puede mencionarlo; ninguna llamada real.
    expect(client).not.toMatch(/^\s*(import\s+\{[^}]*useSearchParams[^}]*\}|const\s+\w+\s*=\s*useSearchParams\()/m)
    expect(client).not.toMatch(/=\s*useSearchParams\(/)
  })
})
