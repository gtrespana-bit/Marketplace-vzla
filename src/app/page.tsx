import Link from 'next/link'
import { Search, ArrowRight, Star, Zap, Eye, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

async function getDestacados(limit = 8) {
  try {
    const { data, error } = await supabase
      .rpc('obtener_destacados_home', { p_limite: limit })
    
    if (!error && data) return data as any[]

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
  
  const now = new Date().toISOString()
  return (data || [])
    .sort((a, b) => {
      const aBoost = a.boosteado_en || null
      const bBoost = b.boosteado_en || null
      if (aBoost && !bBoost) return -1
      if (!aBoost && bBoost) return 1
      if (aBoost && bBoost) return bBoost.localeCompare(aBoost)
      
      const aDest = a.destacado && a.destacado_hasta > now
      const bDest = b.destacado && b.destacado_hasta > now
      if (aDest && !bDest) return -1
      if (!aDest && bDest) return 1
      if (aDest && bDest) return b.destacado_hasta.localeCompare(a.destacado_hasta)
      
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
      <section className="bg-gradient-to-br from-brand-blue via-blue-800 to-[#00247a] py-16 md:py-24 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">
            Vende rápido
            <br />
            <span className="text-brand-yellow">en Venezuela</span> 🇻🇪
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-3 max-w-2xl mx-auto">
            Publica gratis y empieza a recibir mensajes.
            <br />
            <span className="text-white/90 font-medium">
              ¿Quieres vender aún más rápido? Destaca tu anuncio y <span className="text-brand-yellow font-bold">llega a miles más</span>.
            </span>
          </p>

          {/* Badge de impacto */}
          <div className="inline-flex items-center gap-2 bg-brand-yellow/15 border border-brand-yellow/30 rounded-full px-5 py-2 mb-8">
            <Zap size={16} className="text-brand-yellow" />
            <span className="text-sm font-semibold text-white">
              Los anuncios destacados se venden <span className="text-brand-yellow font-black">3x más rápido</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20"
            >
              <span>Publicar Gratis</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/creditos"
              className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition"
            >
              <Eye size={20} />
              <span>Ver Cómo Destacar</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
            <div><p className="text-3xl font-black text-brand-yellow">+130</p><p className="text-xs text-blue-300 mt-1">Productos activos</p></div>
            <div><p className="text-3xl font-black text-brand-yellow">+5K</p><p className="text-xs text-blue-300 mt-1">Usuarios</p></div>
            <div><p className="text-3xl font-black text-brand-yellow">$1</p><p className="text-xs text-blue-300 mt-1">Destacarlo desde</p></div>
          </div>
        </div>
      </section>

      {/* ============ VENTAS DESTACADAS ============ */}
      {destacados.length > 0 ? (
        <section className="relative">
          {/* Banner de incentivo - pegado arriba */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-y border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-brand-blue" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">¿Quieres aparecer aquí?</p>
                  <p className="text-xs text-gray-600">Destaca tu publicación desde $1 y multiplica tus ventas</p>
                </div>
              </div>
              <Link href="/creditos" className="flex items-center gap-1 bg-brand-yellow text-brand-blue px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-400 transition shrink-0">
                Ver paquetes <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Grid de destacados */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-black text-gray-900">⚡ Ventas Destacadas</h2>
              <span className="bg-brand-yellow/20 text-brand-blue text-xs font-bold px-2.5 py-1 rounded-full">Los que pagan por visibilidad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {destacados.map((p) => (
                <ProductCard key={p.id} p={p} highlighted />
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* No hay destacados aún — banner educativo */
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={28} className="text-brand-blue" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Sé el primero en destacar tu anuncio</h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-2">
              Los productos destacados aparecen aquí, en la página principal, y llegan a miles más compradores.
            </p>
            <p className="text-brand-blue font-bold mb-6">Desde solo $1 USD por 12 horas</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/publicar" className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition">
                Publicar Gratis
              </Link>
              <Link href="/creditos" className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition">
                Ver Paquetes de Créditos <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ POTENCIAR TU VENTA ============ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-brand-dark rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Potencia tu publicación 💥</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Elige cómo quieres que más compradores vean tu anuncio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Boost */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group hover:border-brand-yellow/50 transition">
              <div className="w-12 h-12 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={24} className="text-brand-yellow" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Boost</h3>
              <p className="text-3xl font-black text-brand-yellow mb-2">1 crédito</p>
              <p className="text-sm text-gray-400 mb-4">Sube tu publicación al #1 de la lista al instante</p>
              <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-300">
                📊 El más barato · Para aparecer arriba <strong>ya</strong>
              </div>
            </div>

            {/* Destacado 24h — highlighted */}
            <div className="bg-brand-yellow rounded-xl p-6 text-center relative shadow-lg shadow-yellow-500/20 transform scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-full">
                MÁS POPULAR
              </div>
              <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-brand-blue" />
              </div>
              <h3 className="font-bold text-brand-blue text-lg mb-1">Destacado 24h</h3>
              <p className="text-3xl font-black text-brand-blue mb-2">6 créditos</p>
              <p className="text-sm text-brand-blue/70 mb-4">Tu anuncio en la página principal todo un día</p>
              <div className="bg-brand-blue/10 rounded-lg p-3 text-sm text-brand-blue">
                <TrendingUp size={14} className="inline mr-1" /> <strong>$2 USD</strong> · Visibilidad máxima
              </div>
            </div>

            {/* Destacado 48h */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group hover:border-brand-yellow/50 transition">
              <div className="w-12 h-12 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye size={24} className="text-brand-yellow" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Destacado 48h</h3>
              <p className="text-3xl font-black text-brand-yellow mb-2">10 créditos</p>
              <p className="text-sm text-gray-400 mb-4">48 horas en la página principal — máximo impacto</p>
              <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-300">
                📊 <strong>$4 USD</strong> · Dos días completos de visibilidad
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/creditos" className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition">
              Comprar Créditos <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
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
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/publicar" className="inline-flex items-center gap-2 bg-brand-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition shadow-lg">
              🚀 Publica ahora — Es gratis
              <ArrowRight size={20} />
            </Link>
            <Link href="/creditos" className="inline-flex items-center gap-2 bg-white text-brand-blue px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg">
              ⚡ Destacar mi anuncio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
