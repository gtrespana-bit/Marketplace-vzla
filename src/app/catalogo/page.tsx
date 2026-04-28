import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Catálogo — Compra y Venta en Venezuela | Todo Anuncios',
  description: 'Explora miles de productos disponibles. Carros, tecnología, moda, hogar y más.',
}

export default function CatalogoPage({
  searchParams,
}: {
  searchParams: { categoria?: string; estado?: string; ubicacion?: string; q?: string }
}) {
  const { categoria, estado, q } = searchParams

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-blue">Inicio</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">Catálogo</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filtros */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <SidebarFilters />
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {q ? `Resultados para "${q}"` : categoria ? `🏷️ ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}` : 'Todos los productos'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Mostrando resultados de todo Venezuela</p>
              </div>
              <form action="/buscar" method="GET" className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="Buscar en catálogo..."
                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button type="submit" className="bg-brand-yellow text-brand-blue px-4 rounded-lg font-bold text-sm hover:bg-yellow-400 transition">
                  Buscar
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductoCard key={i} index={i} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                  n === 1 ? 'bg-brand-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button className="w-10 h-10 rounded-lg font-medium text-sm bg-white text-gray-700 hover:bg-gray-50 transition">→</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarFilters() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
      <h3 className="font-bold text-lg text-gray-900 mb-4">🔍 Filtros</h3>

      {/* Estado */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">Estado</label>
        <div className="space-y-1.5">
          {['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos'].map((e) => (
            <label key={e} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="estado" value={e} className="rounded text-brand-blue" />
              {e}
            </label>
          ))}
        </div>
      </div>

      {/* Ubicación */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">Ubicación</label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium" id="ubicacion">
          <option value="">Todo Venezuela</option>
          <option>D.M. Capital</option><option>Miranda</option><option>Carabobo</option>
          <option>Lara</option><option>Zulia</option><option>Aragua</option>
          <option>Anzoátegui</option><option>Bolívar</option><option>Mérida</option>
          <option>Táchira</option><option>Trujillo</option><option>Portuguesa</option>
          <option>Barinas</option><option>Apure</option><option>Guárico</option>
          <option>Cojedes</option><option>Yaracuy</option><option>Sucre</option>
          <option>Monagas</option><option>Nueva Esparta</option><option>Amazonas</option>
          <option>Delta Amacuro</option><option>Vargas</option>
        </select>
      </div>

      {/* Rango de precio */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">Precio (USD)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium" />
          <input type="number" placeholder="Max" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium" />
        </div>
      </div>

      {/* Ordenar */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">Ordenar por</label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium" id="orden">
          <option>Relevancia</option>
          <option>Más recientes</option>
          <option>Precio: menor a mayor</option>
          <option>Precio: mayor a menor</option>
          <option>Más populares</option>
        </select>
      </div>

      <button className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-bold hover:bg-blue-900 transition text-sm">
        Aplicar filtros
      </button>
    </div>
  )
}

function ProductoCard({ index }: { index: number }) {
  const items = [
    { titulo: 'iPhone 15 Pro Max 256GB', precio: 850, estado: 'Como nuevo', ciudad: 'Caracas', img: 'https://picsum.photos/seed/iphone/400/400' },
    { titulo: 'Toyota Corolla 2020 Automático', precio: 15000, estado: 'Usado', ciudad: 'Valencia', img: 'https://picsum.photos/seed/car/400/400' },
    { titulo: 'Sala Modular 3 puestos', precio: 350, estado: 'Nuevo', ciudad: 'Maracaibo', img: 'https://picsum.photos/seed/sofa/400/400' },
    { titulo: 'Nike Air Max 270 Talla 42', precio: 80, estado: 'Nuevo', ciudad: 'Caracas', img: 'https://picsum.photos/seed/shoes/400/400' },
    { titulo: 'PS5 Digital Edition + 2 juegos', precio: 400, estado: 'Como nuevo', ciudad: 'Barquisimeto', img: 'https://picsum.photos/seed/ps5/400/400' },
    { titulo: 'Lavadora Samsung 18kg', precio: 280, estado: 'Bueno', ciudad: 'Mérida', img: 'https://picsum.photos/seed/washer/400/400' },
    { titulo: 'MacBook Air M2 2023', precio: 900, estado: 'Nuevo', ciudad: 'Caracas', img: 'https://picsum.photos/seed/mac/400/400' },
    { titulo: 'Bicicleta Montañera R29', precio: 150, estado: 'Usado', ciudad: 'Maracay', img: 'https://picsum.photos/seed/bike/400/400' },
    { titulo: 'TV Samsung 55" 4K Smart', precio: 350, estado: 'Como nuevo', ciudad: 'San Cristóbal', img: 'https://picsum.photos/seed/tv/400/400' },
  ]
  const item = items[index % items.length]
  return (
    <a href={`/producto/${index}`} className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block ${index === 0 ? 'featured-card' : 'border border-gray-100'}`}>
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img src={item.img} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {index === 0 && <span className="absolute top-2 left-2 bg-brand-yellow text-brand-blue text-xs font-bold px-2 py-1 rounded">⭐ Destacado</span>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{item.titulo}</h3>
        <p className="text-xl font-black text-brand-blue mt-1">${item.precio.toLocaleString()}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{item.estado}</span>
          <span>📍 {item.ciudad}</span>
        </div>
      </div>
    </a>
  )
}
