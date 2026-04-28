'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronRight, XCircle } from 'lucide-react'
import { categoriasData } from '@/lib/categorias'

export default function CatalogoClient() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const categoria = searchParams.get('categoria') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const marca = searchParams.get('marca') || ''
  const q = searchParams.get('q') || ''

  const cat = categoriasData[categoria]
  const subs = cat ? cat.subs : []

  // Collect all marcas from current category
  const allMarcas = subs.flatMap(s => s.marcas || []).filter((v, i, a) => a.indexOf(v) === i).sort()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key === 'categoria') params.delete('subcategoria')
    router.push(`${pathname}?${params.toString()}`)
  }

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

            {/* Marca — ahora es select, no input */}
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
          </div>
        </aside>

        {/* Resultados */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {q ? `Resultados para "${q}"` : subcategoria || (cat ? cat.label : 'Todos los productos')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Mostrando resultados de todo Venezuela</p>
              </div>
              <form action="/buscar" method="GET" className="flex gap-2 w-full sm:w-auto">
                <input name="q" defaultValue={q} placeholder="Buscar..." className="w-full sm:w-60 border rounded-lg px-4 py-2 text-sm" />
                <button type="submit" className="bg-brand-yellow text-brand-blue px-4 rounded-lg font-bold text-sm hover:bg-yellow-400">Buscar</button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              { t: 'iPhone 15 Pro Max 256GB', p: 850, e: 'Como nuevo', c: 'Caracas', i: 'https://picsum.photos/seed/iphone/400/400' },
              { t: 'Toyota Corolla 2020', p: 15000, e: 'Usado', c: 'Valencia', i: 'https://picsum.photos/seed/car/400/400' },
              { t: 'Sala Modular 3 puestos', p: 350, e: 'Nuevo', c: 'Maracaibo', i: 'https://picsum.photos/seed/sofa/400/400' },
              { t: 'Nike Air Max 270', p: 80, e: 'Nuevo', c: 'Caracas', i: 'https://picsum.photos/seed/shoes/400/400' },
              { t: 'PS5 Digital Edition', p: 400, e: 'Como nuevo', c: 'Barquisimeto', i: 'https://picsum.photos/seed/ps5/400/400' },
              { t: 'Lavadora Samsung 18kg', p: 280, e: 'Bueno', c: 'Mérida', i: 'https://picsum.photos/seed/washer/400/400' },
              { t: 'MacBook Air M2', p: 900, e: 'Nuevo', c: 'Caracas', i: 'https://picsum.photos/seed/mac/400/400' },
              { t: 'Bicicleta R29', p: 150, e: 'Usado', c: 'Maracay', i: 'https://picsum.photos/seed/bike/400/400' },
              { t: 'TV Samsung 55"', p: 350, e: 'Como nuevo', c: 'San Cristóbal', i: 'https://picsum.photos/seed/tv/400/400' },
            ].map((item, idx) => (
              <a key={idx} href={`/producto/${idx}`} className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block ${idx === 0 ? 'featured-card' : 'border border-gray-100'}`}>
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img src={item.i} alt={item.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  {idx === 0 && <span className="absolute top-2 left-2 bg-brand-yellow text-brand-blue text-xs font-bold px-2 py-1 rounded">⭐</span>}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{item.t}</h3>
                  <p className="text-xl font-black text-brand-blue mt-1">${item.p.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.e} · {item.c}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
