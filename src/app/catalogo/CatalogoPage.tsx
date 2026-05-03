'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronRight, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { categoriasData } from '@/lib/categorias'
import UbicacionSelector from '@/components/UbicacionSelector'

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

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85482e?w=400&h=400&fit=crop&q=60',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop&q=60',
]

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

function ProductCard({ p }: { p: Producto }) {
  const isBoosted = p.boosteado_en != null
  const isFeatured = p.destacado && p.destacado_hasta && new Date(p.destacado_hasta) > new Date()
  const isPromoted = isBoosted || isFeatured

  
  const imgUrl = p.imagen_url || getPlaceholderImage(p.titulo)

  return (
    <Link href={`/producto/${p.id}`} className={`bg-white rounded-xl overflow-hidden transition-all duration-200 group block border ${isPromoted ? 'border-2 border-brand-yellow shadow-md hover:shadow-xl hover:-translate-y-1' : 'border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gray-200'}`}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-brand-yellow text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            ⭐ Destacado
          </div>
        )}
        {isBoosted && !isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            ⚡ Boost
          </div>
        )}
        <Image src={imgUrl} alt={p.titulo} width={400} height={400} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage(p.titulo) }} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-blue transition-colors">{p.titulo}</h3>
        <p className="text-xl font-black text-brand-blue mt-1">${Number(p.precio_usd || 0).toLocaleString()}</p>
        {p.vendedor_verificado && (
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-1">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Verificado
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">{p.ubicacion_ciudad || p.ubicacion_estado || 'Venezuela'}</p>
      </div>
    </Link>
  )
}

export default function CatalogoClient() {
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

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const cat = categoriasData[categoria]
  const subs = cat ? cat.subs : []
  const allMarcas = subs.flatMap(s => s.marcas || []).filter((v, i, a) => a.indexOf(v) === i).sort()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key === 'categoria') params.delete('subcategoria')
    router.push(`${pathname}?${params.toString()}`)
  }

  // Query Supabase
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetchProductos() {
      let query = supabase
        .from('productos')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')

      // Categoria filter
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

      // Subcategoria
      if (subcategoria) {
        query = query.eq('subcategoria', subcategoria)
      }

      // Marca
      if (marca) {
        query = query.eq('marca', marca)
      }

      // Text search
      if (q) {
        query = query.ilike('titulo', `%${ q}%`)
      }

      // Ubicacin
      if (ubicacionCiudad) {
        query = query.eq('ubicacion_ciudad', ubicacionCiudad)
      } else if (ubicacionEstado) {
        query = query.eq('ubicacion_estado', ubicacionEstado)
      }

      // Ubicacion
      if (ubicacionCiudad) {
        query = query.eq('ubicacion_ciudad', ubicacionCiudad)
      } else if (ubicacionEstado) {
        query = query.eq('ubicacion_estado', ubicacionEstado)
      }

      // Rango de precio
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
          // Sort: boost > destacado vigente > por fecha
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
  }, [categoria, subcategoria, marca, q, precioMin, precioMax, ubicacionEstado, ubicacionCiudad])

  const tituloMostrar = q
    ? `Resultados para "${q}"`
    : subcategoria
      ? subcategoria
      : cat
        ? cat.label
        : 'Todos los productos'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand-blue">Inicio</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">Catálogo</span>
        {categoria && (<><ChevronRight size={14} /><span className="text-gray-900 font-semibold">{cat?.icon} {cat?.label}</span></>)}
        {subcategoria && (<><ChevronRight size={14} /><span className="text-gray-900 font-semibold">{subcategoria}</span></>)}
        {q && (<><ChevronRight size={14} /><span>Buscar: &ldquo;{q}&rdquo;</span></>)}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filtros */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🔍 Filtros</h3>

            {/* Categoría */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Categoría</label>
              <select value={categoria} onChange={e => setParam('categoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                <option value="">Todas</option>
                {Object.entries(categoriasData).map(([key, c]) => (
                  <option key={key} value={key}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            {subs.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Subcategoría</label>
                <select value={subcategoria} onChange={e => setParam('subcategoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                  <option value="">Todas</option>
                  {subs.map(s => (
                    <option key={s.label} value={s.label}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Marca */}
            {allMarcas.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Marca</label>
                  {marca && (
                    <button onClick={() => setParam('marca', '')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <XCircle size={12} /> Quitar
                    </button>
                  )}
                </div>
                <select value={marca} onChange={e => setParam('marca', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                  <option value="">Todas las marcas</option>
                  {allMarcas.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rango de precio */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">💰 Precio (USD)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={precioMin}
                  onChange={e => setParam('precioMin', e.target.value)}
                  placeholder="Min"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <input
                  type="number"
                  value={precioMax}
                  onChange={e => setParam('precioMax', e.target.value)}
                  placeholder="Max"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              </div>
            </div>

            {/* Clear filters */}
            {(categoria || subcategoria || marca || q || precioMin || precioMax) && (
              <button onClick={() => router.push(pathname)} className="w-full text-sm text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1">
                <XCircle size={14} /> Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tituloMostrar}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? 'Buscando...' : `${totalCount} resultado${totalCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              <form action="/buscar" method="GET" className="flex gap-2 w-full sm:w-auto">
                <input name="q" defaultValue={q} placeholder="Buscar..." className="w-full sm:w-60 border rounded-lg px-4 py-2 text-sm" />
                <button type="submit" className="bg-brand-yellow text-brand-blue px-4 rounded-lg font-bold text-sm hover:bg-yellow-400">Buscar</button>
              </form>
            </div>
          </div>

          {/* Ubicacion selector */}
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">No hay productos en esta categoría</h3>
              <p className="text-gray-500 mb-4">Sé el primero en publicar aquí</p>
              <Link href="/publicar" className="inline-block bg-brand-yellow text-brand-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
                Publicar gratis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {productos.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
