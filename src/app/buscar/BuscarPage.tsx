'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronRight, XCircle } from 'lucide-react'
import { categoriasData } from '@/lib/categorias'

const estadosVenezuela = [
  'Distrito Capital', 'Miranda', 'Carabobo', 'Lara', 'Zulia',
  'Aragua', 'Anzoategui', 'Bolivar', 'Merida', 'Tachira',
  'Trujillo', 'Portuguesa', 'Barinas', 'Apure', 'Guarico',
  'Cojedes', 'Yaracuy', 'Sucre', 'Monagas', 'Nueva Esparta',
  'Amazonas', 'Delta Amacuro', 'Vargas',
]

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

  const cat = categoriasData[categoria]
  const subs = cat ? cat.subs : []
  const allMarcas = subs.flatMap((s) => s.marcas || []).filter((v, i, a) => a.indexOf(v) === i).sort()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value) else params.delete(key)
    if (key === 'categoria') params.delete('subcategoria')
    router.push(`/buscar?${params.toString()}`)
  }

  const clearAll = () => router.push('/buscar')

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
                Resultados para &ldquo;<strong>{query}</strong>&rdquo; (datos de ejemplo)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block border border-gray-100">
                    <div className="aspect-square bg-gray-100">
                      <img src={`https://picsum.photos/seed/s${i}/400/400`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 truncate">Resultado para &ldquo;{query}&rdquo; #{i + 1}</h3>
                      <p className="text-xl font-black text-brand-blue mt-1">${(50 + i * 100).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2">Resultado de ejemplo</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!query && (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
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
