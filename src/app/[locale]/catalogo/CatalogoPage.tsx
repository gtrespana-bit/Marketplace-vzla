'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import LocalLink from '@/components/LocalLink'
import Image from 'next/image'
import { Search, ChevronRight, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { categoriasData } from '@/lib/categorias'
import UbicacionSelector from '@/components/UbicacionSelector'
import { useBridge } from '@/components/IntlBridge'

type Producto = {
  id: string
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
}

const PLACEHOLDER_IMAGES = [
  '/placeholder-product.webp',
]

const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

function getPlaceholderImage(titulo: string) {
  return PLACEHOLDER_IMAGES[Math.abs(titulo.charCodeAt(0)) % PLACEHOLDER_IMAGES.length]
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

function ProductCard({ p, priority = false, t }: { p: Producto; priority?: boolean; t: (key: string) => string }) {
  const isBoosted = p.boosteado_en != null
  // Usar flag pre-computado del servidor para evitar hydration mismatch
  // Si no existe (datos frescos del cliente), calcular en el cliente
  const isFeatured = (p as any)._isFeatured !== undefined
    ? (p as any)._isFeatured
    : !!(p.destacado && p.destacado_hasta && new Date(p.destacado_hasta) > new Date())
  const isPromoted = isBoosted || isFeatured

  const imgUrl = p.imagen_url || getPlaceholderImage(p.titulo)

  return (
    <LocalLink href={`/producto/${p.id}`} className={`bg-white rounded-xl overflow-hidden transition-all duration-200 group block border ${isPromoted ? 'border-2 border-brand-accent shadow-md hover:shadow-xl hover:-translate-y-1' : 'border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gray-200'}`}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-brand-accent text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            ⭐ {t('product.featured')}
          </div>
        )}
        {isBoosted && !isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            ⚡ <span className="text-white">Boost</span>
          </div>
        )}
        <Image
          src={imgUrl}
          alt={p.titulo}
          width={400}
          height={400}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          decoding="async"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={(e) => {
            // ✅ CORREGIDO: Previene loop infinito
            const target = e.target as HTMLImageElement
            if (!target.src.includes('/placeholder-product.webp')) {
              target.src = '/placeholder-product.webp'
            }
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-primary transition-colors">{p.titulo}</h3>
        <p className="text-xl font-black text-brand-primary mt-1">${Number(p.precio_usd || 0).toLocaleString()}</p>
        {p.vendedor_verificado && (
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-1">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {t('product.verified')}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">{p.ubicacion_ciudad || p.ubicacion_estado || 'Venezuela'}</p>
      </div>
    </LocalLink>
  )
}

export default function CatalogoClient({ initialProducts = [], initialCount = 0 }: CatalogoPageProps) {
  const { t } = useBridge()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const categoria = searchParams.get('categoria') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const marca = searchParams.get('marca') || ''
  const q = searchParams.get('q') || ''
  const precioMin = searchParams.get('precioMin') || ''
  const precioMax = searchParams.get('precioMax') || ''
  const ubicacionEstado = searchParams.get('estado') || ''
  const ubicacionCiudad = searchParams.get('ciudad') || ''

  const hasActiveFilters = !!(categoria || subcategoria || marca || q || precioMin || precioMax || ubicacionEstado || ubicacionCiudad)
  const [productos, setProductos] = useState<Producto[]>(hasActiveFilters ? [] : initialProducts)
  const [loading, setLoading] = useState(hasActiveFilters)
  const [totalCount, setTotalCount] = useState(hasActiveFilters ? 0 : initialCount)
  const isFirstRender = useRef(true)

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
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (!hasActiveFilters) return
    }

    let cancelled = false
    setLoading(true)

    async function fetchProductos() {
      let query = supabase
        .from('productos')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')

      if (categoria) {
        const { data: catRow } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', categoria)
          .single()
        if (catRow) {
          query = query.eq('categoria_id', catRow.id)
        }
      }

      if (subcategoria) {
        query = query.eq('subcategoria', subcategoria)
      }

      if (marca) {
        query = query.eq('marca', marca)
      }

      if (q) {
        query = query.textSearch('search_vector', q, { config: 'spanish', type: 'plain' })
      }

      if (ubicacionCiudad) {
        query = query.eq('ubicacion_ciudad', ubicacionCiudad)
      } else if (ubicacionEstado) {
        query = query.eq('ubicacion_estado', ubicacionEstado)
      }

      if (precioMin) {
        query = query.gte('precio_usd', parseFloat(precioMin))
      }
      if (precioMax) {
        query = query.lte('precio_usd', parseFloat(precioMax))
      }

      query = query.order('creado_en', { ascending: false }).limit(200)

      const { data, count, error } = await query
      if (!cancelled) {
        if (!error) {
          const now = new Date().toISOString()
          const sorted = (data as Producto[]).sort((a, b) => {
            const aBoost = a.boosteado_en || null
            const bBoost = b.boosteado_en || null
            if (aBoost && !bBoost) return -1
            if (!aBoost && bBoost) return 1
            if (aBoost && bBoost) return bBoost.localeCompare(aBoost)
            const aDest = a.destacado && a.destacado_hasta && a.destacado_hasta > now
            const bDest = b.destacado && b.destacado_hasta && b.destacado_hasta > now
            if (aDest && !bDest) return -1
            if (!aDest && bDest) return 1
            if (aDest && bDest) return b.destacado_hasta!.localeCompare(a.destacado_hasta!)
            return b.creado_en.localeCompare(a.creado_en)
          })
          setProductos(sorted)
          setTotalCount(count ?? 0)
        } else {
          console.error('Error fetching:', error)
          setProductos([])
          setTotalCount(0)
        }
        setLoading(false)
      }
    }

    fetchProductos()
    return () => { cancelled = true }
  }, [categoria, subcategoria, marca, q, precioMin, precioMax, ubicacionEstado, ubicacionCiudad, hasActiveFilters])

  const tituloMostrar = q
    ? t('catalog.resultsFor').replace('{q}', q)
    : subcategoria
      ? t('catalog.subcategories.' + subcategoria)
      : cat
        ? t('catalog.categories.' + categoria)
        : t('catalog.allProducts')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" suppressHydrationWarning>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <LocalLink href="/" className="hover:text-brand-primary">{t('catalog.breadcrumb')}</LocalLink>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">{t('catalog.title')}</span>
        {categoria && (<><ChevronRight size={14} /><span className="text-gray-900 font-semibold">{cat?.icon} {t('catalog.categories.' + categoria)}</span></>)}
        {subcategoria && (<><ChevronRight size={14} /><span className="text-gray-900 font-semibold">{t('catalog.subcategories.' + subcategoria)}</span></>)}
        {q && (<><ChevronRight size={14} /><span>{t('catalog.searchLabel')}: &ldquo;{q}&rdquo;</span></>)}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🔍 {t('catalog.filters')}</h3>

            <div className="mb-4">
              <label htmlFor="filter-categoria" className="block text-sm font-bold text-gray-900 mb-1.5">{t('catalog.category')}</label>
              <select id="filter-categoria" value={categoria} onChange={e => setParam('categoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                <option value="">{t('catalog.all')}</option>
                {Object.entries(categoriasData).map(([key, c]) => (
                  <option key={key} value={key}>{c.icon} {t('catalog.categories.' + key)}</option>
                ))}
              </select>
            </div>

            {subs.length > 0 && (
              <div className="mb-4">
                <label htmlFor="filter-subcategoria" className="block text-sm font-bold text-gray-900 mb-1.5">{t('catalog.subcategory')}</label>
                <select id="filter-subcategoria" value={subcategoria} onChange={e => setParam('subcategoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                  <option value="">{t('catalog.allSubs')}</option>
                  {subs.map(s => (
                    <option key={s.label} value={s.label}>{s.icon} {t('catalog.subcategories.' + s.label)}</option>
                  ))}
                </select>
              </div>
            )}

            {allMarcas.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="filter-marca" className="block text-sm font-bold text-gray-900 mb-1.5">{t('catalog.brandLabel')}</label>
                  {marca && (
                    <button onClick={() => setParam('marca', '')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <XCircle size={12} /> {t('catalog.remove')}
                    </button>
                  )}
                </div>
                <select id="filter-marca" value={marca} onChange={e => setParam('marca', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                  <option value="">{t('catalog.allBrands')}</option>
                  {allMarcas.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="filter-precio-min" className="block text-sm font-bold text-gray-900 mb-1.5">{t('catalog.priceUsd')}</label>
              <div className="flex gap-2">
                <input
                  id="filter-precio-min"
                  type="number"
                  value={precioMin}
                  onChange={e => setParam('precioMin', e.target.value)}
                  placeholder={t('catalog.min')}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
                <input
                  type="number"
                  value={precioMax}
                  onChange={e => setParam('precioMax', e.target.value)}
                  placeholder={t('catalog.max')}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            </div>

            {(categoria || subcategoria || marca || q || precioMin || precioMax) && (
              <button onClick={() => router.push(pathname)} className="w-full text-sm text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1">
                <XCircle size={14} /> {t('catalog.clearFilters')}
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tituloMostrar}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? t('common.loading') : t('catalog.results').replace('{count}', String(totalCount))}
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('catalog.empty')}</h3>
              <p className="text-gray-500 mb-4">{t('catalog.emptyCta')}</p>
              <LocalLink href="/publicar" className="inline-block bg-brand-accent text-brand-primary px-6 py-3 rounded-lg font-bold hover:bg-accent/90 transition">
                {t('catalog.publishFree')}
              </LocalLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {productos.map((p, index) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  t={t}
                  priority={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}