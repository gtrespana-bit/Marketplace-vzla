'use client'

import Link from 'next/link'
import { Search, ChevronRight, XCircle, Loader2 } from 'lucide-react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { categoriasData } from '@/lib/categorias'
import UbicacionSelector from '@/components/UbicacionSelector'

type Producto = {
  id: string
  titulo: string
  precio_usd: number | null
  estado: string
  imagen_url: string | null
  ubicacion_ciudad: string | null
  ubicacion_estado: string | null
  creado_en: string
  visitas: number
  subcategoria: string | null
  boosteado_en: string | null
  destacado: boolean | null
  destacado_hasta: string | null
  vendedor_verificado: boolean | null
  descripcion?: string
}

// Imágenes placeholder genéricas cuando no hay imagen
const PLACEHOLDER_IMAGES = [
  '/placeholder-product.png',
]

function getPlaceholderImage(titulo: string) {
  return PLACEHOLDER_IMAGES[Math.abs(titulo.charCodeAt(0)) % PLACEHOLDER_IMAGES.length]
}

function ProductCard({ p }: { p: Producto }) {
  const isBoosted = p.boosteado_en != null
  const isFeatured = p.destacado && p.destacado_hasta && new Date(p.destacado_hasta) > new Date()
  const isPromoted = isBoosted || isFeatured
  const imgUrl = p.imagen_url || getPlaceholderImage(p.titulo)

  return (
    <Link
      href={`/producto/${p.id}`}
      className={`bg-white rounded-xl overflow-hidden transition-all duration-200 group block border
        ${isPromoted
          ? 'border-2 border-brand-accent shadow-md hover:shadow-xl hover:-translate-y-1'
          : 'border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gray-200'
        }`}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-brand-accent text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            ⭐ Destacado
          </div>
        )}
        {isBoosted && !isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            ⚡ Boost
          </div>
        )}
        <Image
          src={imgUrl}
          alt={p.titulo}
          width={300}
          height={300}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-primary transition-colors">
          {p.titulo}
        </h3>
        <p className="text-xl font-black text-brand-primary mt-1">
          ${Number(p.precio_usd || 0).toLocaleString()}
        </p>
        {p.vendedor_verificado && (
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full mt-1">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Verificado
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1 truncate">
          {p.ubicacion_ciudad
            ? `${p.ubicacion_ciudad} · ${p.estado}`
            : p.estado}
        </p>
      </div>
    </Link>
  )
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

export default function BuscarClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query = searchParams.get('q') || ''
  const categoria = searchParams.get('categoria') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const marca = searchParams.get('marca') || ''
  const condicion = searchParams.get('condicion') || ''
  const ubicacionEstado = searchParams.get('estado') || ''
  const ubicacionCiudad = searchParams.get('ciudad') || ''
  const precioMin = searchParams.get('precio_min') || ''
  const precioMax = searchParams.get('precio_max') || ''
  const orden = searchParams.get('orden') || ''

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [resultCount, setResultCount] = useState(0)

  const cat = categoriasData[categoria]
  const subs = cat ? cat.subs : []
  const allMarcas = subs.flatMap((s) => s.marcas || []).filter((v, i, a) => a.indexOf(v) === i).sort()

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key === 'categoria') params.delete('subcategoria')
    router.push('/buscar?' + params.toString())
  }, [searchParams, router])

  const clearAll = () => router.push('/buscar')

  // Query Supabase when query or filters change
  useEffect(() => {
    // Always query — show all products if no filters, or filtered results if filters set
    let cancelled = false
    setLoading(true)

    async function buscar() {
      let sq = supabase
        .from('productos')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')

      // Full-text search usando search_vector (tsvector indexado)
      if (query) {
        sq = sq.textSearch('search_vector', query, { config: 'spanish', type: 'plain' })
      }

      // Categoria
      if (categoria) {
        const { data: catRow } = await supabase.from('categorias').select('id').eq('nombre', categoria).single()
        if (catRow) sq = sq.eq('categoria_id', catRow.id)
      }

      // Subcategoria
      if (subcategoria) sq = sq.eq('subcategoria', subcategoria)

      // Marca
      if (marca) sq = sq.eq('marca', marca)

      // Condicion del producto
      if (condicion) sq = sq.eq('estado', condicion)

      // Ubicacion
      if (ubicacionCiudad) {
        sq = sq.eq('ubicacion_ciudad', ubicacionCiudad)
      } else if (ubicacionEstado) {
        sq = sq.eq('ubicacion_estado', ubicacionEstado)
      }

      // Precio
      if (precioMin) sq = sq.gte('precio_usd', parseFloat(precioMin))
      if (precioMax) sq = sq.lte('precio_usd', parseFloat(precioMax))

      // Orden: por defecto reciente (luego mezclamos boost/destacados)
      if (orden === 'precio_asc') sq = sq.order('precio_usd', { ascending: true })
      else if (orden === 'precio_desc') sq = sq.order('precio_usd', { ascending: false })
      else sq = sq.order('creado_en', { ascending: false })

      const { data, count, error } = await sq
      if (!cancelled) {
        if (!error) {
          // Sort: boost > destacado vigente > por fecha (solo si no ordenan por precio)
          let sorted = data as Producto[]
          if (orden !== 'precio_asc' && orden !== 'precio_desc') {
            const now = new Date().toISOString()
            sorted = sorted.sort((a, b) => {
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
              return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
            })
          }
          setResultCount(count ?? 0)
          setProductos(sorted)
        } else {
          console.error('Error buscando:', error)
          setResultCount(0)
          setProductos([])
        }
        setLoading(false)
      }
    }

    buscar()
    return () => { cancelled = true }
  }, [query, categoria, subcategoria, marca, condicion, ubicacionEstado, ubicacionCiudad, precioMin, precioMax, orden])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand-primary">Inicio</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">Buscar</span>
        {query && (<><ChevronRight size={14} /><span className="text-gray-900 font-semibold">&ldquo;{query}&rdquo;</span></>)}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filtros */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Filtros</h3>
              {searchParams.toString() && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <XCircle size={12} /> Limpiar todo
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Categoría</label>
                <select value={categoria} onChange={(e) => setParam('categoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                  <option value="">Todas</option>
                  {Object.entries(categoriasData).map(([key, c]) => (
                    <option key={key} value={key}>{c.label} {c.icon}</option>
                  ))}
                </select>
              </div>

              {/* Subcategoria */}
              {subs.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Subcategoria</label>
                  <select value={subcategoria} onChange={(e) => setParam('subcategoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <option value="">Todas</option>
                    {subs.map((s) => (
                      <option key={s.label} value={s.label}>{s.icon} {s.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Marca */}
              {allMarcas.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">Marca</label>
                    {marca && (
                      <button onClick={() => setParam('marca', '')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                        <XCircle size={12} /> Quitar
                      </button>
                    )}
                  </div>
                  <select value={marca} onChange={(e) => setParam('marca', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <option value="">Todas</option>
                    {allMarcas.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Condicion del producto */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Condición</label>
                <div className="space-y-1.5">
                  {['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos'].map((e) => (
                    <label key={e} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={condicion === e}
                        onChange={(ev) => setParam('condicion', ev.target.checked ? e : '')}
                        className="rounded text-brand-primary"
                      />
                      {e}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ubicacion */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-gray-900 mb-3">📍 Ubicación</h4>
                <UbicacionSelector
                  estado={ubicacionEstado}
                  ciudad={ubicacionCiudad}
                  onChange={(estado, ciudad) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (estado) params.set('estado', estado); else params.delete('estado')
                    if (ciudad) params.set('ciudad', ciudad); else params.delete('ciudad')
                    router.push('/buscar?' + params.toString())
                  }}
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Precio (USD)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={precioMin}
                    onChange={(e) => setParam('precio_min', e.target.value)}
                    placeholder="Min"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white"
                  />
                  <input
                    type="number"
                    value={precioMax}
                    onChange={(e) => setParam('precio_max', e.target.value)}
                    placeholder="Max"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white"
                  />
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Ordenar</label>
                <select value={orden} onChange={(e) => setParam('orden', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent">
                  <option value="">Relevancia</option>
                  <option value="reciente">Mas recientes</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <form action="/buscar" method="GET" className="flex gap-2">
              {/* Campos ocultos para preservar filtros actuales al buscar */}
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              {subcategoria && <input type="hidden" name="subcategoria" value={subcategoria} />}
              {marca && <input type="hidden" name="marca" value={marca} />}
              {condicion && <input type="hidden" name="condicion" value={condicion} />}
              {ubicacionEstado && <input type="hidden" name="estado" value={ubicacionEstado} />}
              {ubicacionCiudad && <input type="hidden" name="ciudad" value={ubicacionCiudad} />}
              {precioMin && <input type="hidden" name="precio_min" value={precioMin} />}
              {precioMax && <input type="hidden" name="precio_max" value={precioMax} />}
              {orden && <input type="hidden" name="orden" value={orden} />}
              <div className="relative flex-1">
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Que estas buscando?"
                  autoFocus={query === ''}
                  className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white text-gray-900"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button type="submit" className="bg-brand-accent text-brand-primary px-6 rounded-lg font-bold hover:bg-accent/90 transition shrink-0">Buscar</button>
            </form>
          </div>

          {true && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {loading ? 'Buscando...' : `${resultCount} resultado${resultCount !== 1 ? 's' : ''}${query ? ` para &ldquo;<strong>${query}</strong>&rdquo;` : ''}`}
              </p>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                productos.length === 0 ? (
                  <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
                    <Search size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500">Intenta con otros filtros o una busqueda mas amplia.</p>
                    {query && (
                      <p className="text-sm text-gray-400 mt-1">Prueba buscando: <button onClick={() => setParam('q', '')} className="text-brand-primary hover:underline">mostrar todos los productos</button></p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {productos.map((p) => <ProductCard key={p.id} p={p} />)}
                  </div>
                )
              )}
            </>
          )}

          {!query && !categoria && !subcategoria && !marca && !condicion && !ubicacionEstado && !ubicacionCiudad && !precioMin && !precioMax && productos.length > 0 && (
            <p className="text-sm text-gray-500 mb-4">Mostrando todos los productos ({resultCount} resultados)</p>
          )}
        </div>
      </div>
    </div>
  )
}
