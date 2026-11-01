'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LocalLink from '@/components/LocalLink'
import Image from 'next/image'
import { Search, ChevronRight, XCircle } from 'lucide-react'
import { categoriasData } from '@/lib/categorias'
import UbicacionSelector from '@/components/UbicacionSelector'
import { Pagination } from '@/components/Pagination'
import { OptimizedProductGrid } from '@/components/OptimizedProductGrid'
import { CatalogFilters } from '@/components/CatalogFilters'
import { useProductPagination } from '@/hooks/useProductPagination'
import { useProductLoader } from '@/hooks/useProductLoader'
import { CATALOG_PAGE_SIZE } from '@/lib/catalog-pagination'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { usePrefetch } from '@/hooks/usePrefetch'
import { productUrl } from '@/lib/product-url'

type Producto = {
  id: string
  slug?: string | null
  titulo: string
  precio_usd: number
  estado: string
  imagen_url: string | null
  ubicacion_ciudad: string | null
  ubicacion_estado: string | null
  creado_en: string
  subcategoria: string | null
  boosteado_en: string | null
  destacado: boolean
  destacado_hasta: string | null
  vendedor_verificado: boolean | null
}

interface CatalogoPageProps {
  initialProducts?: Producto[]
  initialCount?: number
  /**
   * `false` cuando la carga server-side falló (Supabase caído, timeout de la
   * función en Vercel, o red del usuario). En ese caso NO hay que mostrar
   * "no hay productos": hay que decírselo al usuario y ofrecer reintentar.
   */
  initialOk?: boolean
}

export default function CatalogoClient({ initialProducts = [], initialCount = 0, initialOk = true }: CatalogoPageProps) {
  const tc = useTranslations('catalog')
  const tp = useTranslations('product')
  const tcm = useTranslations('common')
  // Universal translator function (supports any namespace with variables)
  const t = (key: string, vars?: Record<string, string | number>) => {
    const parts = key.split('.')
    const ns = parts[0]
    const rest = parts.slice(1).join('.')
    if (ns === 'catalog') return tc(rest, vars as any)
    if (ns === 'product') return tp(rest, vars as any)
    if (ns === 'common') return tcm(rest, vars as any)
    return key
  }
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // Usar hook de paginación
  const { currentPage, itemsPerPage, goToPage } = useProductPagination({ itemsPerPage: CATALOG_PAGE_SIZE })

  const categoria = searchParams.get('categoria') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const marca = searchParams.get('marca') || ''
  const q = searchParams.get('q') || ''
  const precioMin = searchParams.get('precioMin') || ''
  const precioMax = searchParams.get('precioMax') || ''
  const ubicacionEstado = searchParams.get('estado') || ''
  const ubicacionCiudad = searchParams.get('ciudad') || ''

  const hasActiveFilters = !!(categoria || subcategoria || marca || q || precioMin || precioMax || ubicacionEstado || ubicacionCiudad)

  // Carga real por página desde el servidor (range()).
  const { productos: loadedProductos, loading, error, totalCount: loaderTotalCount, loadPage } = useProductLoader();
  const { prefetchPage } = usePrefetch();

  // Durante la primera renderización SSR (página 1 sin filtros) usamos los
  // productos servidos por el servidor. En cuanto se navega o se filtran, se
  // pasa a los productos cargados desde el cliente (server-driven por página).
  const [useServerData, setUseServerData] = useState(false)

  // ¿Mostramos los iniciales del SSR o los cargados por página?
  const showInitialSSR = !useServerData && !hasActiveFilters && currentPage === 1
  const productosToShow = showInitialSSR ? initialProducts : loadedProductos
  const totalCountToUse = showInitialSSR ? initialCount : loaderTotalCount

  // Firma de filtros para detectar cambios y resetear la página.
  const filterSig = [categoria, subcategoria, marca, q, precioMin, precioMax, ubicacionEstado, ubicacionCiudad].join('|')
  const prevFilterSig = useRef(filterSig)

  // ⚠️ MÓVIL — CAUSA RAÍZ DEL "el catálogo no carga":
  // Si el render del servidor fallaba (Supabase lento → timeout de la función
  // serverless, o error transitorio), `initialProducts` llegaba VACÍO y el
  // cliente pintaba "No hay productos en esta categoría" sin hacer ni una
  // sola petición. En escritorio se disimula porque la sesión/wifi tolera el
  // fallo; en móvil (3G/4G + cold start) es el caso habitual.
  //
  // Ahora, si el servidor falló, el cliente REINTENTA la misma consulta por su
  // cuenta (antes de que el usuario toque nada) y, si también falla, muestra
  // un estado de error con botón de reintentar en lugar de un catálogo "vacío".
  const [initialServerFailed, setInitialServerFailed] = useState(!initialOk)
  const [hydrated, setHydrated] = useState(false)
  // `initialOk === false` se renderiza como error también en el HTML del
  // servidor: es preferible "no pudimos cargar, reintentar" a un esqueleto
  // eterno cuando el usuario no ejecuta JS o la hidratación tarda.
  const ssrFailed = !initialOk

  useEffect(() => {
    setHydrated(true)
  }, [])

  const filtersPayload = {
    categoria,
    subcategoria,
    marca,
    q,
    precioMin,
    precioMax,
    ubicacionEstado,
    ubicacionCiudad
  }

  // Autorrecuperación: si el SSR vino sin datos, pedimos la página al cliente.
  // (Se ejecuta una sola vez por fallo; `loadPage` es estable.)
  useEffect(() => {
    if (!initialServerFailed) return
    setInitialServerFailed(false)
    setUseServerData(true)
    loadPage({ page: 1, pageSize: itemsPerPage, filters: filtersPayload })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServerFailed])

  // totalPages se calcula con el total REAL (totalCount), no con las filas
  // cargadas. Así la paginación es correcta aunque solo se cargue una página.
  const totalPages = Math.max(1, Math.ceil(totalCountToUse / itemsPerPage))

  const cat = categoriasData[categoria]
  const subs = cat ? cat.subs : []
  const allMarcas = subs.flatMap(s => s.marcas || []).filter((v, i, a) => a.indexOf(v) === i).sort()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key === 'categoria') params.delete('subcategoria')
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    // Si cambian los filtros y no estamos en la página 1, resetear a la página 1.
    if (prevFilterSig.current !== '' && prevFilterSig.current !== filterSig && currentPage !== 1) {
      prevFilterSig.current = filterSig
      goToPage(1)
      return
    }
    prevFilterSig.current = filterSig

    // Durante la primera renderización SSR (página 1 sin filtros) usamos los
    // productos del servidor; no hace falta recargar.
    if (!hasActiveFilters && currentPage === 1 && !useServerData) {
      return
    }

    setUseServerData(true)
    loadPage({
      page: currentPage,
      pageSize: itemsPerPage,
      filters: {
        categoria,
        subcategoria,
        marca,
        q,
        precioMin,
        precioMax,
        ubicacionEstado,
        ubicacionCiudad
      }
    });
  }, [filterSig, currentPage, itemsPerPage, hasActiveFilters, useServerData, goToPage, loadPage, categoria, subcategoria, marca, q, precioMin, precioMax, ubicacionEstado, ubicacionCiudad]);

  // Precargar la siguiente página cuando sea apropiado
  useEffect(() => {
    if (!loading && productosToShow.length > 0 && totalPages > currentPage) {
      // Precargar la siguiente página después de un breve retraso
      const prefetchTimer = setTimeout(() => {
        prefetchPage(
          currentPage + 1,
          itemsPerPage,
          {
            categoria,
            subcategoria,
            marca,
            q,
            precioMin,
            precioMax,
            ubicacionEstado,
            ubicacionCiudad
          }
        );
      }, 2000); // Precargar después de 2 segundos para permitir la carga completa de la página actual

      return () => clearTimeout(prefetchTimer);
    }
  }, [currentPage, totalPages, loading, productosToShow.length, categoria, subcategoria, marca, q, precioMin, precioMax, ubicacionEstado, ubicacionCiudad, itemsPerPage, prefetchPage]);

  const tituloMostrar = q
    ? t('catalog.resultsFor', { q })
    : subcategoria
      ? t('catalog.subcategories.' + subcategoria)
      : cat
        ? t('catalog.categories.' + categoria)
        : t('catalog.allProducts')

  // Generar breadcrumbs jerárquicos con schema.org
  const breadcrumbs = [
    { label: t('catalog.breadcrumb'), href: '/' },
    { label: t('catalog.title'), href: '/catalogo' }
  ]
  
  if (categoria && cat) {
    breadcrumbs.push({ 
      label: `${cat.icon} ${t('catalog.categories.' + categoria)}`, 
      href: `/categoria/${categoria}`
    })
  }
  
  if (subcategoria) {
    breadcrumbs.push({ 
      label: t('catalog.subcategories.' + subcategoria), 
      href: '' // Página actual
    })
  }
  
  if (q) {
    breadcrumbs.push({ 
      label: `${t('catalog.searchLabel')}: "${q}"`, 
      href: '' // Página actual
    })
  }
  
  // Schema.org BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label.replace(/^[^ ]+ /, ''), // Remover emoji del nombre para schema
      item: item.href ? `https://vendet.online${item.href}` : undefined
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs visuales */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-gray-500" />}
              {item.href ? (
                <LocalLink 
                  href={item.href} 
                  className="hover:text-brand-primary transition"
                >
                  {item.label}
                </LocalLink>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <CatalogFilters
            categoria={categoria}
            subcategoria={subcategoria}
            marca={marca}
            precioMin={precioMin}
            precioMax={precioMax}
            ubicacionEstado={ubicacionEstado}
            ubicacionCiudad={ubicacionCiudad}
            t={t}
          />
        </aside>

        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tituloMostrar}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? t('common.loading') : t('catalog.results', { count: totalCountToUse || 0 })}
                </p>
              </div>
              <form action="/buscar" method="GET" className="flex gap-2 w-full sm:w-auto">
                <input name="q" defaultValue={q} placeholder={`${t('common.search')}...`} className="w-full sm:w-60 border rounded-lg px-4 py-2 text-sm" />
                <button type="submit" className="bg-brand-primary text-white px-4 rounded-lg font-bold text-sm hover:bg-brand-dark transition">{t('common.search')}</button>
              </form>
            </div>
          </div>

          <div className="mb-4">
            <UbicacionSelector
              estado={ubicacionEstado}
              ciudad={ubicacionCiudad}
              onChange={(estado, ciudad) => {
                const params = new URLSearchParams(searchParams.toString())
                if (estado) params.set('estado', estado); else params.delete('estado')
                if (ciudad) params.set('ciudad', ciudad); else params.delete('ciudad')
                router.push(`${pathname}?${params.toString()}`)
              }}
            />
          </div>

          {(error || ssrFailed) && (
            <div className="bg-white border border-red-200 rounded-xl p-8 mb-4 text-center shadow-sm" role="alert">
              <XCircle size={40} className="text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t('catalog.offlineTitle')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('catalog.retryHint')}</p>
              <button
                onClick={() => loadPage({ page: currentPage, pageSize: itemsPerPage, filters: filtersPayload })}
                className="inline-block bg-brand-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-accent/90 transition"
              >
                {t('catalog.offlineCta')}
              </button>
              {/* Diagnóstico solo para desarrollo: en producción no exponemos
                  mensajes internos de Supabase al usuario. */}
              {process.env.NODE_ENV !== 'production' && (
                <p className="mt-3 text-xs text-gray-400 break-words">{error}</p>
              )}
            </div>
          )}

          {loading ? (
            <LoadingIndicator count={6} />
          ) : !error && productosToShow.length === 0 && !hydrated ? (
            // Antes de hidratar no sabemos si el catálogo está realmente vacío:
            // mostramos el mismo esqueleto del SSR en vez de "no hay productos".
            <LoadingIndicator count={6} />
          ) : !error && productosToShow.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-16 text-center shadow-sm border">
              <Search size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('catalog.empty')}</h3>
              <p className="text-gray-500 mb-4">{t('catalog.emptyCta')}</p>
              <LocalLink href="/publicar" className="inline-block bg-brand-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-accent/90 transition">
                {t('catalog.publishFree')}
              </LocalLink>
            </div>
          ) : (
            <OptimizedProductGrid
              productos={productosToShow}
              t={t}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>

      {/* Componente de paginación optimizado */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalCountToUse} 
      />
    </div>
    </>
  )
}