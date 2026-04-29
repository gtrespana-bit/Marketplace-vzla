'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronRight, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { categoriasData } from '@/lib/categorias'

const estadosVenezuela = [
  'Distrito Capital', 'Miranda', 'Carabobo', 'Lara', 'Zulia',
  'Aragua', 'Anzoategui', 'Bolivar', 'Merida', 'Tachira',
  'Trujillo', 'Portuguesa', 'Barinas', 'Apure', 'Guarico',
  'Cojedes', 'Yaracuy', 'Sucre', 'Monagas', 'Nueva Esparta',
  'Amazonas', 'Delta Amacuro', 'Vargas',
]

type Producto = {
  id: string
  titulo: string
  precio_usd: number
  estado: string
  imagen_url: string | null
  ubicacion_ciudad: string | null
  ubicacion_estado: string | null
  creado_en: string
  visitas: number
  subcategoria: string | null
  boosteado_en: string | null
  destacado: boolean
  destacado_hasta: string | null
}

function ProductCard({ p }: { p: Producto }) {
  const isBoosted = p.boosteado_en != null
  const isFeatured = p.destacado && p.destacado_hasta && new Date(p.destacado_hasta) > new Date()
  const isPromoted = isBoosted || isFeatured

  return (
    <Link href={`/producto/${p.id}`} className={`bg-white rounded-xl overflow-hidden hover:shadow-lg transition group block border ${isPromoted ? 'border-2 border-brand-yellow shadow-sm' : 'border-gray-100 shadow-sm'}`}>
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
        {p.imagen_url ? (
          <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📦</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{p.titulo}</h3>
        <p className="text-xl font-black text-brand-blue mt-1">${Number(p.precio_usd || 0).toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">{p.estado} · {p.ubicacion_ciudad || 'Venezuela'}</p>
      </div>
    </Link>
  )
}

export default function BuscarClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query = searchParams.get('q') || ''
  const categoria = searchParams.get('categoria') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const marca = searchParams.get('marca') || ''
  const estadoProd = searchParams.get('estado') || ''
  const ubicacion = searchParams.get('ubicacion') || ''
  const precioMin = searchParams.get('precio_min') || ''
  const precioMax = searchParams.get('precio_max') || ''
  const orden = searchParams.get('orden') || ''

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [resultCount, setResultCount] = useState(0)

  const cat = categoriasData[categoria]
  const subs = cat ? cat.subs : []
  const allMarcas = subs.flatMap((s) => s.marcas || []).filter((v, i, a) => a.indexOf(v) === i).sort()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key === 'categoria') params.delete('subcategoria')
    router.push('/buscar?' + params.toString())
  }

  const clearAll = () => router.push('/buscar')

  // Query Supabase when query or filters change
  useEffect(() => {
    if (!query && !categoria && !subcategoria && !marca && !estadoProd && !ubicacion && !precioMin && !precioMax) {
      setProductos([])
      setResultCount(0)
      return
    }

    let cancelled = false
    setLoading(true)

    async function buscar() {
      let sq = supabase.from('productos').select('*', { count: 'exact' }).eq('activo', true).or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')

      // Text search
      if (query) sq = sq.ilike('titulo', `%${query}%`)

      // Categoria
      if (categoria) {
        const { data: catRow } = await supabase.from('categorias').select('id').eq('nombre', categoria).single()
        if (catRow) sq = sq.eq('categoria_id', catRow.id)
      }

      // Subcategoria
      if (subcategoria) sq = sq.eq('subcategoria', subcategoria)

      // Marca
      if (marca) sq = sq.eq('marca', marca)

      // Estado
      if (estadoProd) sq = sq.eq('estado', estadoProd)

      // Ubicacion
      if (ubicacion) sq = sq.eq('ubicacion_estado', ubicacion)

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
              return b.creado_en.localeCompare(a.creado_en)
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
  }, [query, categoria, subcategoria, marca, estadoProd, ubicacion, precioMin, precioMax, orden])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand-blue">Inicio</Link>
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
                <select value={categoria} onChange={(e) => setParam('categoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                  <option value="">Todas</option>
                  {Object.entries(categoriasData).map(([key, c]) => (
                    <option key={key} value={key}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              {/* Subcategoria */}
              {subs.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">Subcategoria</label>
                  <select value={subcategoria} onChange={(e) => setParam('subcategoria', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
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
                  <select value={marca} onChange={(e) => setParam('marca', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                    <option value="">Todas</option>
                    {allMarcas.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Estado */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Estado</label>
                <div className="space-y-1.5">
                  {['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos'].map((e) => (
                    <label key={e} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={estadoProd === e}
                        onChange={(ev) => setParam('estado', ev.target.checked ? e : '')}
                        className="rounded text-brand-blue"
                      />
                      {e}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ubicacion */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Ubicacion</label>
                <select value={ubicacion} onChange={(e) => setParam('ubicacion', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
                  <option value="">Todo Venezuela</option>
                  {estadosVenezuela.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
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
                <select value={orden} onChange={(e) => setParam('orden', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow">
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
              <div className="relative flex-1">
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Que estas buscando?"
                  autoFocus={query === ''}
                  className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-900"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button type="submit" className="bg-brand-yellow text-brand-blue px-6 rounded-lg font-bold hover:bg-yellow-400 transition">Buscar</button>
            </form>
          </div>

          {query && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {loading ? 'Buscando...' : `${resultCount} resultado${resultCount !== 1 ? 's' : ''} para &ldquo;<strong>${query}</strong>&rdquo;`}
              </p>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                productos.length === 0 ? (
                  <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
                    <Search size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500">Intenta con otros filtros o una busqueda mas amplia</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {productos.map((p) => <ProductCard key={p.id} p={p} />)}
                  </div>
                )
              )}
            </>
          )}

          {!query && !categoria && !subcategoria && !marca && !estadoProd && !ubicacion && !precioMin && !precioMax && (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Que quieres encontrar?</h3>
              <p className="text-gray-500">Escribe algo en la barra de busqueda para empezar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
