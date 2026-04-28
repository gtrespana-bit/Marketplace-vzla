import Link from 'next/link'

const categorias = [
  { id: 'vehiculos', nombre: 'Vehículos', icon: '🚗', desc: 'Carros, motos y más' },
  { id: 'tecnologia', nombre: 'Tecnología', icon: '💻', desc: 'Celulares, laptops, consolas' },
  { id: 'moda', nombre: 'Moda', icon: '👗', desc: 'Ropa, calzado, accesorios' },
  { id: 'hogar', nombre: 'Hogar', icon: '🏠', desc: 'Muebles, electrodomésticos' },
  { id: 'herramientas', nombre: 'Herramientas', icon: '🔧', desc: 'Herramientas y equipos' },
  { id: 'otros', nombre: 'Otros', icon: '📦', desc: 'De todo un poco' },
]

export default async function HomePage() {
  // Datos de ejemplo hasta conectar Supabase
  const productos: any[] = []

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-blue via-blue-900 to-brand-dark">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Compra y vende en
            <span className="text-brand-yellow"> Venezuela</span> 🇻🇪
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Publica <strong className="text-white">gratis</strong>. Contacta directo. Sin complicaciones.
          </p>

          {/* Buscador */}
          <form action="/buscar" method="GET" className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="¿Qué estás buscando?"
                className="flex-1 py-4 px-6 rounded-xl text-gray-800 text-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button
                type="submit"
                className="pulse-cta bg-brand-yellow text-brand-blue px-8 rounded-xl font-bold text-lg hover:bg-yellow-400 transition shadow-xl"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* CTA */}
          <div className="mt-6">
            <Link
              href="/publicar"
              className="inline-block bg-white/10 backdrop-blur text-white border border-white/30 px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition"
            >
              📢 Publica tu aviso gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-blue-200 text-sm">
            <div>
              <span className="text-2xl font-bold text-white">+1,200</span>
              <p>Productos publicados esta semana</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">+5,000</span>
              <p>Usuarios registrados</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">100%</span>
              <p>Gratis para publicar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          ¿Qué estás buscando?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.id}`}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-2 hover:border-brand-yellow transition border border-transparent group"
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-bold text-gray-800 text-sm">{cat.nombre}</span>
              <span className="block text-xs text-gray-500 mt-1">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      {productos && productos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🌟 Destacados</h2>
            <Link href="/catalogo?destacado=true" className="text-brand-blue font-medium hover:underline text-sm">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.map((p: any) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recientes */}
      {productos && productos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🕐 Recién publicados</h2>
            <Link href="/catalogo" className="text-brand-blue font-medium hover:underline text-sm">
              Ver catálogo completo →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.slice(0, 8).map((p: any) => (
              <ProductoCard key={`rec-${p.id}`} producto={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA sección */}
      <section className="bg-brand-yellow py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-4">
            ¿Tienes algo para vender?
          </h2>
          <p className="text-brand-blue/80 text-lg mb-8">
            Publica gratis en segundos. Miles de compradores te esperan.
          </p>
          <Link
            href="/publicar"
            className="inline-block bg-brand-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition shadow-lg"
          >
            🚀 Publica ahora — Es gratis
          </Link>
        </div>
      </section>
    </div>
  )
}

function ProductoCard({ producto }: { producto: any }) {
  return (
    <Link
      href={`/producto/${producto.id}`}
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block ${
        producto.destacado ? 'featured-card' : 'border border-gray-100'
      }`}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
        {producto.destacado && (
          <span className="absolute top-2 left-2 bg-brand-yellow text-brand-blue text-xs font-bold px-2 py-1 rounded">
            ⭐ Destacado
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{producto.titulo}</h3>
        <p className="text-xl font-black text-brand-blue mt-1">
          ${producto.precio_usd?.toLocaleString() ?? 'Gratis'}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{producto.estado}</span>
          {producto.ubicacion_ciudad && <span>📍 {producto.ubicacion_ciudad}</span>}
        </div>
      </div>
    </Link>
  )
}
