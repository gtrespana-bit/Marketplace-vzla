import Link from 'next/link'
import { Search, ArrowRight, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

async function getDestacados(limit = 8) {
  try {
    // Try the RPC function first
    const { data, error } = await supabase
      .rpc('obtener_destacados_home', { p_limite: limit })
    
    if (!error && data) return data as any[]

    // Fallback to direct query if RPC not available yet
    const { data: data2 } = await supabase
      .from('productos')
      .select('id, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, destacado, destacado_hasta')
      .eq('activo', true)
      .eq('destacado', true)
      .gt('destacado_hasta', new Date().toISOString())
      .order('destacado_hasta', { ascending: false })
      .limit(limit)
    
    return data2 || []
  } catch {
    return []
  }
}

async function getRecentProducts(limit = 8) {
  const { data, error } = await supabase
    .from('productos')
    .select('id, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, creado_en, boosteado_en, destacado, destacado_hasta')
    .eq('activo', true)
    .limit(50)
  
  if (error) return []
  
  // Sort client-side: boost > destacado vigente > normal by date
  const now = new Date().toISOString()
  return (data || [])
    .sort((a, b) => {
      // 1. Boost activos (más reciente primero)
      const aBoost = a.boosteado_en || null
      const bBoost = b.boosteado_en || null
      if (aBoost && !bBoost) return -1
      if (!aBoost && bBoost) return 1
      if (aBoost && bBoost) return bBoost.localeCompare(aBoost)
      
      // 2. Destacados vigentes
      const aDest = a.destacado && a.destacado_hasta > now
      const bDest = b.destacado && b.destacado_hasta > now
      if (aDest && !bDest) return -1
      if (!aDest && bDest) return 1
      if (aDest && bDest) return b.destacado_hasta.localeCompare(a.destacado_hasta)
      
      // 3. Por fecha (más nuevo primero)
      return (b.creado_en || '').localeCompare(a.creado_en || '')
    })
    .slice(0, limit)
}

function ProductCard({ p, highlighted = false }: { p: any; highlighted?: boolean }) {
  return (
    <Link
      href={`/producto/${p.id}`}
      className={`bg-white rounded-xl overflow-hidden transition group block border ${
        highlighted
          ? 'border-2 border-brand-yellow shadow-lg shadow-yellow-50 hover:shadow-brand-yellow/20'
          : 'shadow-sm border-gray-100 hover:shadow-lg'
      }`}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {highlighted && (
          <div className="absolute top-2 left-2 z-10 bg-brand-yellow text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={10} /> Destacado
          </div>
        )}
        {p.imagen_url ? (
          <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
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

export default async function HomePage() {
  const destacados = await getDestacados()
  const productos = await getRecentProducts()

  return (
    <div className="bg-gray-50">
      {/* ============ HERO ============ */}
      <section className="bg-brand-blue py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Lo que buscas,
            <br />
            <span className="text-brand-yellow">está aquí</span> 🇻🇪
          </h1>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Compra y vende de todo — carros, tecnología, moda, hogar. <strong className="text-white">Sin comisiones.</strong> Directo. Fácil.
          </p>

          <form action="/buscar" method="GET" className="max-w-2xl mx-auto mb-6">
            <div className="bg-white rounded-2xl shadow-2xl p-1.5 flex gap-1.5">
              <input
                type="text"
                name="q"
                placeholder="¿Qué estás buscando?"
                className="flex-1 py-3.5 px-5 text-gray-800 text-lg focus:outline-none rounded-xl"
              />
              <button
                type="submit"
                className="bg-brand-yellow text-brand-blue px-8 rounded-xl font-bold text-lg hover:bg-yellow-400 transition flex items-center gap-2"
              >
                <Search size={20} />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['iPhone 15', 'Toyota 4Runner', 'Nike Air Max', 'PS5', 'Bera 150', 'MacBook'].map((q) => (
              <a key={q} href={`/buscar?q=${encodeURIComponent(q)}`} className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm text-white transition font-medium">
                {q}
              </a>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
            <div><p className="text-3xl font-black text-brand-yellow">+5K</p><p className="text-xs text-blue-300 mt-1">Usuarios</p></div>
            <div><p className="text-3xl font-black text-brand-yellow">+12K</p><p className="text-xs text-blue-300 mt-1">Publicaciones</p></div>
            <div><p className="text-3xl font-black text-brand-yellow">100%</p><p className="text-xs text-blue-300 mt-1">Gratis</p></div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Explora por categoría</h2>
        <p className="text-gray-500 mb-8">Encuentra lo que necesitas en segundos</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { id: 'vehiculos', nombre: 'Vehículos', icon: '🚗', desc: 'Carros, motos' },
            { id: 'tecnologia', nombre: 'Tecnología', icon: '💻', desc: 'Celulares, laptops' },
            { id: 'moda', nombre: 'Moda', icon: '👗', desc: 'Ropa, calzado' },
            { id: 'hogar', nombre: 'Hogar', icon: '🏠', desc: 'Muebles, electro' },
            { id: 'herramientas', nombre: 'Herramientas', icon: '🔧', desc: 'Manuales, eléctricas' },
            { id: 'otros', nombre: 'Otros', icon: '📦', desc: 'De todo un poco' },
          ].map((cat) => (
            <Link key={cat.id} href={`/catalogo?categoria=${cat.id}`} className="bg-white rounded-2xl p-6 text-center shadow-sm border hover:border-brand-yellow transition hover:shadow-lg group">
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-gray-900 text-sm">{cat.nombre}</span>
              <span className="block text-xs text-gray-400 mt-1 truncate">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ DESTACADOS ============ */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">⭐ Destacados</h2>
            <Link href="/creditos" className="text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1">
              ¿Quieres aparecer aquí? <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {destacados.map((p) => (
              <ProductCard key={p.id} p={p} highlighted />
            ))}
          </div>
        </section>
      )}

      {/* ============ PRODUCTOS RECIENTES ============ */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🕐 Agregados recientemente</h2>
          <Link href="/catalogo" className="text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {productos.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm border">
            <p className="text-xl font-bold text-gray-800 mb-2">Aún no hay publicaciones</p>
            <p className="text-gray-500 mb-6">Sé el primero en publicar algo</p>
            <Link href="/publicar" className="inline-block bg-brand-yellow text-brand-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
              Publicar gratis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.map((p) => {
              const isHighlighted = (p.destacado && p.destacado_hasta > new Date().toISOString()) || p.boosteado_en
              return (
                <ProductCard key={p.id} p={p} highlighted={isHighlighted} />
              )
            })}
          </div>
        )}
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-brand-yellow py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-brand-blue mb-4">¿Tienes algo para vender?</h2>
          <p className="text-brand-blue/80 text-lg mb-8">Publica gratis en segundos. Miles de compradores te esperan.</p>
          <Link href="/publicar" className="inline-flex items-center gap-2 bg-brand-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition shadow-lg">
            🚀 Publica ahora — Es gratis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
