import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Catálogo — Compra y Venta en Venezuela | Todo Anuncios',
  description: 'Explora miles de productos disponibles. Carros, tecnología, moda, hogar y más.',
}

// Datos de filtros por categoría
const filtrosPorCategoria: Record<string, { label: string; options: string[] }[]> = {
  vehiculos: [
    { label: 'Marca', options: ['Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Jeep', 'Mitsubishi', 'Mazda', 'Renault', 'Peugeot', 'Suzuki', 'Volkswagen', 'Yamaha', 'Bera', 'Empire', 'Venom'] },
    { label: 'Año desde', options: Array.from({ length: 30 }, (_, i) => String(2026 - i)) },
    { label: 'Transmisión', options: ['Automática', 'Manual', 'CVT'] },
    { label: 'Combustible', options: ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'] },
  ],
  tecnologia: [
    { label: 'Marca', options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG', 'Sony', 'Asus', 'Lenovo', 'HP', 'Dell', 'Microsoft', 'PlayStation', 'Xbox', 'Nintendo'] },
    { label: 'Almacenamiento', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
    { label: 'RAM', options: ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB'] },
  ],
  moda: [
    { label: 'Marca', options: ['Nike', 'Adidas', 'Zara', 'H&M', 'Puma', 'New Balance', 'Gucci', 'Louis Vuitton', 'Calvin Klein', 'Tommy Hilfiger', 'Levi\'s'] },
    { label: 'Talla', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'] },
  ],
  hogar: [
    { label: 'Marca', options: ['Samsung', 'LG', 'Mabe', 'Daewoo', 'Whirlpool', 'Indurama', 'Oster', 'Philips'] },
  ],
  herramientas: [
    { label: 'Marca', options: ['DeWalt', 'Makita', 'Bosch', 'Stanley', 'Truper', 'Black+Decker', 'Milwaukee'] },
  ],
  otros: [],
}

const anos = Array.from({ length: 30 }, (_, i) => String(2026 - i))

export default function CatalogoPage({
  searchParams,
}: {
  searchParams: { categoria?: string; estado?: string; ubicacion?: string; q?: string; marca?: string; modelo?: string; ano?: string }
}) {
  const { categoria, estado, ubicacion, q, marca } = searchParams
  const filtrosActivos = categoria ? filtrosPorCategoria[categoria] || [] : []

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
        <aside className="w-full lg:w-72 flex-shrink-0">
          <SidebarFilters categoria={categoria} filtrosActivos={filtrosActivos} />
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {q ? `Resultados para "${q}"` : categoria ? getCatIcon(categoria) + ' ' + categoria.charAt(0).toUpperCase() + categoria.slice(1) : 'Todos los productos'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Mostrando resultados de todo Venezuela</p>
              </div>
              <form action="/buscar" method="GET" className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="Buscar en catálogo..."
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-800"
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

function SidebarFilters({ categoria, filtrosActivos }: { categoria?: string; filtrosActivos: { label: string; options: string[] }[] }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
      <h3 className="font-bold text-lg text-gray-900 mb-4">🔍 Filtros</h3>

      {/* Filtros por categoría */}
      {filtrosActivos.length > 0 && (
        <div className="space-y-4 mb-4 pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide">
            Filtros por categoría
          </p>
          {filtrosActivos.map((filtro) => (
            <div key={filtro.label}>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">{filtro.label}</label>
              <select
                name={filtro.label.toLowerCase()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium bg-white"
              >
                <option value="">Todos</option>
                {filtro.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

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
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium bg-white" id="ubicacion">
          <option value="">Todo Venezuela</option>
          <option>D.M. Capital</option><option>Miranda</option><option>Carabobo</option>
          <option>Lara</option><option>Zulia</option><option>Aragua</option>
          <option>Anzoátegui</option><option>Bolívar</option><option>Mérida</option>
          <option>Táchira</option><option>Trujillo</option><option>Portuguesa</option>
          <option>Barinas</option><option>Apure</option><option>Guárico</option>
          <option>Cojedes</option><option>Yaracuy</option><option>Sucre</option>
          <option>Monagas</option><option>Nueva Esparta</option>
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
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium bg-white" id="orden">
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
        <h3 className="font-semibold text-gray-900 truncate">{item.titulo}</h3>
        <p className="text-xl font-black text-brand-blue mt-1">${item.precio.toLocaleString()}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{item.estado}</span>
          <span>📍 {item.ciudad}</span>
        </div>
      </div>
    </a>
  )
}

function getCatIcon(cat: string): string {
  const icons: Record<string, string> = { vehiculos: '🚗', tecnologia: '💻', moda: '👗', hogar: '🏠', herramientas: '🔧', otros: '📦' }
  return icons[cat] || '📦'
}
