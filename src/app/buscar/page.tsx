import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Buscar — Todo Anuncios',
  description: 'Busca productos en el marketplace venezolano',
}

export default function BuscarPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string; estado?: string }
}) {
  const query = searchParams.q || ''

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-blue">Inicio</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">
          {query ? `Búsqueda: "${query}"` : 'Buscar'}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="font-bold text-lg mb-4">🔍 Refinar búsqueda</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 font-bold mb-1.5">Estado</label>
                {['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos'].map((e) => (
                  <label key={e} className="flex items-center gap-2 text-sm mt-1.5">
                    <input type="checkbox" defaultChecked={searchParams.estado === e} className="rounded text-brand-blue" />
                    {e}
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 font-bold mb-1.5">Ubicación</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" id="bus-ubicacion">
                  <option value="">Todo Venezuela</option>
                  <option>Distrito Capital</option>
                  <option>Miranda</option>
                  <option>Carabobo</option>
                  <option>Lara</option>
                  <option>Zulia</option>
                  <option>Aragua</option>
                  <option>Anzoátegui</option>
                  <option>Bolívar</option>
                  <option>Mérida</option>
                  <option>Táchira</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 font-bold mb-1.5">Precio (USD)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Mín" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input type="number" placeholder="Máx" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 font-bold mb-1.5">Ordenar</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" id="bus-orden">
                  <option>Relevancia</option>
                  <option>Más recientes</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                </select>
              </div>

              <button className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-bold hover:bg-blue-900 transition text-sm">
                Aplicar
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <form action="/buscar" method="GET" className="flex gap-2">
              <div className="relative flex-1">
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="¿Qué estás buscando?"
                  autoFocus
                  className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button type="submit" className="bg-brand-yellow text-brand-blue px-6 rounded-lg font-bold hover:bg-yellow-400 transition">
                Buscar
              </button>
            </form>
          </div>

          {query && (
            <>
              <p className="text-sm text-gray-500 mb-4">Resultados para "<strong>{query}</strong>"</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block border border-gray-100">
                    <div className="aspect-square bg-gray-100">
                      <img src={`https://picsum.photos/seed/s${i}/400/400`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">Resultado para &ldquo;{query}&rdquo; #{i + 1}</h3>
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Qué quieres encontrar?</h3>
              <p className="text-gray-500">Escribe algo en la barra de búsqueda para empezar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
