import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-server-client'
import { CATALOG_PAGE_SIZE } from '@/lib/catalog-pagination'
import CatalogoClient from './CatalogoPage'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type InitialCatalog = {
  products: any[]
  count: number
  /** false cuando la consulta falló (red/Supabase): NO es un catálogo vacío. */
  ok: boolean
}

// Filtros vía query string (?categoria=, ?ciudad=, ?q=...). Como el
// canonical siempre apunta a /catalogo limpio, cada combinación de filtros
// consolida su señal en UNA sola URL en vez de competir como duplicado.
// (Las landing pages indexables para ciudad/categoría ya existen como
// rutas estáticas /caracas/vehiculos etc. — esas sí posicionan.)
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams
  const categoriaRaw = resolvedParams?.categoria
  const categoria = typeof categoriaRaw === 'string' ? categoriaRaw : ''

  // La imagen OG se genera en /api/og/catalog (edge). La URL relativa se
  // resuelve contra metadataBase para no atar el repo a un host concreto.
  const ogImageUrl = categoria
    ? `/api/og/catalog?categoria=${encodeURIComponent(categoria)}`
    : '/api/og/catalog'

  // `?pagina=2` y las combinaciones de filtros NO deben declarar la misma
  // canonical que /catalogo limpio: eso mandaba a Google a rastrear, filtrar
  // y descartar. La página 1 sin filtros conserva la canonical histórica.
  const tieneFiltros = ['categoria', 'subcategoria', 'marca', 'q', 'precioMin', 'precioMax', 'estado', 'ciudad']
    .some((k) => typeof resolvedParams?.[k] === 'string' && resolvedParams[k])
  const pagina = Number.parseInt(String(resolvedParams?.pagina ?? '1'), 10)
  const esPrimeraPaginaLimpia = !tieneFiltros && (!Number.isFinite(pagina) || pagina <= 1)

  return {
    title: 'Catálogo — Compra y Venta en Venezuela',
    description: 'Explora el catálogo de productos en VendeT. Carros, tecnología, moda, hogar, herramientas y más.',
    openGraph: {
      title: 'Catálogo — Compra y Venta en Venezuela',
      description: 'Explora el catálogo de productos en VendeT. Carros, tecnología, moda, hogar, herramientas y más.',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Catálogo - VendeT' }],
      locale: 'es_VE',
    },
    // Variantes filtradas/paginadas: se rastrean (follow) pero no compiten
    // como duplicados de /catalogo.
    ...(esPrimeraPaginaLimpia
      ? {
          alternates: {
            canonical: '/catalogo',
            languages: {
              'es-VE': '/catalogo',
              'x-default': '/catalogo',
            },
          },
        }
      : {
          robots: { index: false, follow: true },
        }),
  }
}

// ✅ Fetch server-side de productos iniciales
// Replica exactamente la misma query + ordenamiento que usa el cliente
async function getInitialProducts(): Promise<InitialCatalog> {
  // Sin variables de entorno no hay Supabase: es un fallo de configuración,
  // no un catálogo vacío. Se propaga para que el cliente pueda reintentar.
  if (!supabase) return { products: [], count: 0, ok: false }
  try {
    // Optimización: Seleccionar solo columnas necesarias para la vista de catálogo
    const { data, count, error } = await supabase
      .from('productos')
      .select('id, slug, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, ubicacion_estado, creado_en, subcategoria, boosteado_en, destacado, destacado_hasta, vendedor_verificado', { count: 'exact' })
      .eq('activo', true)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado,estado_moderacion.eq.pendiente')
      .order('creado_en', { ascending: false })
      .limit(CATALOG_PAGE_SIZE) // Debe coincidir con la página del cliente; de lo contrario se omiten filas.

    if (error) throw error
    if (!data) return { products: [], count: 0, ok: false }

    // Mismo ordenamiento que el cliente: boost > destacado vigente > fecha
    // Pre-computamos flags de estado para evitar hydration mismatch
    const now = new Date().toISOString()
    const sorted = data.sort((a: any, b: any) => {
      const aBoost = a.boosteado_en || null
      const bBoost = b.boosteado_en || null
      if (aBoost && !bBoost) return -1
      if (!aBoost && bBoost) return 1
      if (aBoost && bBoost) return bBoost.localeCompare(aBoost)
      const aDest = a.destacado && a.destacado_hasta && a.destacado_hasta > now
      const bDest = b.destacado && b.destacado_hasta && b.destacado_hasta > now
      if (aDest && !bDest) return -1
      if (!aDest && bDest) return 1
      if (aDest && bDest) return b.destacado_hasta.localeCompare(a.destacado_hasta)
      return b.creado_en.localeCompare(a.creado_en)
    }).map((p: any) => ({
      ...p,
      // Pre-computar flags para evitar hydration mismatch en cliente
      _isFeatured: !!(p.destacado && p.destacado_hasta && p.destacado_hasta > now),
    }))

    return { products: sorted, count: count ?? 0, ok: true }
  } catch (e) {
    console.error('[catalogo] Falló la carga inicial de productos:', e)
    return { products: [], count: 0, ok: false }
  }
}

export default async function CatalogoPage() {
  // Fetch en servidor ANTES de renderizar
  const { products: initialProducts, count: initialCount, ok } = await getInitialProducts()

  // El diccionario se resuelve también en el servidor para poder renderizar el
  // esqueleto (Suspense) con los mismos textos que la página hidratada.
  const t = await getTranslations('catalog')

  // ✅ Suspense boundary necesario para useSearchParams()
  // El fallback era `undefined`: si el stream tardaba (Supabase lento en 3G/4G,
  // que es el caso normal en móvil) el usuario veía la página en blanco.
  return (
    <Suspense fallback={<CatalogoSkeleton label={t('loading')} />}>
      <CatalogoClient
        initialProducts={initialProducts}
        initialCount={initialCount}
        initialOk={ok}
      />
    </Suspense>
  )
}

/**
 * Esqueleto con la MISMA estructura del catálogo real (filtros + grid) para
 * que el paso del fallback al contenido no mueva el layout (CLS) y para que
 * el móvil nunca muestre una pantalla vacía mientras llega el RSC.
 */
function CatalogoSkeleton({ label }: { label: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-32 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ISR: cache catalog for 10 minutes
export const revalidate = 600
