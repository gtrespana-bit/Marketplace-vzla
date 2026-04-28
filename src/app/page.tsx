'use client'

import Link from 'next/link'
import { Search, ArrowRight, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import categoriasConfig from '@/lib/categorias'

const categorias = Object.entries(categoriasConfig).map(([key, cfg]) => ({
  id: key,
  nombre: key.charAt(0).toUpperCase() + key.slice(1),
  icon: cfg.icon,
  desc: cfg.tipos.slice(0, 3).join(', '),
}))

const popularSearches = [
  { emoji: '📱', text: 'iPhone 15 Pro Max' },
  { emoji: '🚗', text: 'Toyota 4Runner 2015' },
  { emoji: '👟', text: 'Nike Air Max' },
  { emoji: '💻', text: 'MacBook Pro M2' },
  { emoji: '🏠', text: 'Sala Modular' },
  { emoji: '🎮', text: 'PS5' },
  { emoji: '🏍️', text: 'Bera 150' },
  { emoji: '🔄', text: 'Samsung S24' },
]

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>(['iPhone 15', 'Toyota 4Runner', 'PS5'])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(search.trim())}`
    }
  }

  const addToHistory = (term: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(p => p !== term)
      return [term, ...filtered].slice(0, 5)
    })
  }

  const getAutocomplete = () => {
    if (!search.trim()) return []
    return popularSearches.filter(s => s.text.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
  }

  const suggestions = getAutocomplete()

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero-gradient relative">
        {/* Decorative elements */}
        <div className="absolute top-20 right-8 w-32 h-32 border border-yellow-400/20 rounded-full"></div>
        <div className="absolute top-40 right-40 w-16 h-16 border border-red-400/20 rounded-full"></div>
        <div className="absolute bottom-20 left-8 w-24 h-24 border border-blue-300/10 rounded-lg rotate-45"></div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          {/* Trust bar at top */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-blue-200 animate-on-scroll">
            <span className="flex items-center gap-1">🛡️ Plataforma segura</span>
            <span className="flex items-center gap-1">✅ Sin comisiones por venta</span>
            <span className="flex items-center gap-1">📢 Publicar es 100% gratis</span>
            <span className="flex items-center gap-1">🇻🇪 Hecho para Venezuela</span>
          </div>

          {/* Main heading */}
          <div className="text-center mb-8 animate-on-scroll">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
              Lo que buscas,
              <br />
              <span className="text-brand-yellow">está aquí</span> 🇻🇪
            </h1>
            <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">
              Compra y vende de todo — carros, tecnología, moda, hogar. <strong className="text-white">Sin comisiones.</strong> Directo. Fácil.
            </p>
          </div>

          {/* Search bar */}
          <div ref={searchRef} className="max-w-2xl mx-auto mb-6 animate-on-scroll delay-1 relative">
            <form onSubmit={handleSearch}>
              <div className={`bg-white rounded-2xl shadow-2xl p-1.5 transition-all ${searchFocused ? 'ring-2 ring-brand-yellow' : ''}`}>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="¿Qué estás buscando?"
                    className="flex-1 py-3.5 px-5 text-gray-800 text-lg focus:outline-none rounded-xl"
                  />
                  <button
                    type="submit"
                    className="pulse-cta bg-brand-yellow text-brand-blue px-8 rounded-xl font-bold text-lg hover:bg-yellow-400 transition flex items-center gap-2 flex-shrink-0"
                  >
                    <Search size={20} />
                    <span className="hidden sm:inline">Buscar</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Dropdown: history or autocomplete */}
            {(searchFocused || search) && (search.length > 0 || searchHistory.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {search.trim() && suggestions.length > 0 ? (
                  suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setSearch(s.text); addToHistory(s.text); setSearchFocused(false); window.location.href = `/buscar?q=${encodeURIComponent(s.text)}` }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-left text-gray-800 transition"
                    >
                      <span>{s.emoji}</span>
                      <span>{s.text}</span>
                      <ArrowRight size={14} className="ml-auto text-gray-400" />
                    </button>
                  ))
                ) : searchHistory.length > 0 ? (
                  <>
                    <p className="px-5 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wide">Búsquedas recientes</p>
                    {searchHistory.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearch(h); addToHistory(h); setSearchFocused(false); window.location.href = `/buscar?q=${encodeURIComponent(h)}` }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 text-left text-gray-700 text-sm transition"
                      >
                        <Search size={14} className="text-gray-400" />
                        {h}
                      </button>
                    ))}
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap justify-center gap-2 animate-on-scroll delay-2">
            <span className="text-blue-300 text-sm mr-2 flex items-center">Popular:</span>
            {popularSearches.slice(0, 6).map((s) => (
              <a
                key={s.text}
                href={`/buscar?q=${encodeURIComponent(s.text)}`}
                className="chip-search text-sm"
              >
                {s.emoji} {s.text}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-8 animate-on-scroll delay-3">
            <Link href="/publicar" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition">
              📢 Publica tu aviso gratis
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-lg mx-auto animate-on-scroll delay-4 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-brand-yellow">+5K</p>
              <p className="text-xs text-blue-300 mt-1">Usuarios</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-brand-yellow">+12K</p>
              <p className="text-xs text-blue-300 mt-1">Publicaciones</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-brand-yellow">100%</p>
              <p className="text-xs text-blue-300 mt-1">Gratis</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section className="max-w-7xl mx-auto px-4 py-16 animate-on-scroll">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Explora por categoría</h2>
        <p className="text-gray-500 mb-8">Encuentra lo que necesitas en segundos</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.id}`}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg border border-transparent hover:border-brand-yellow transition-all group card-hover"
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-gray-900 text-sm block">{cat.nombre}</span>
              <span className="block text-xs text-gray-400 mt-1 truncate">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ TIPOS DE VEHÍCULOS ============ */}
      <section className="bg-white py-16 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">🚗 Vehículos</h2>
          <p className="text-gray-500 mb-8">Filtra por tipo — encuentra exactamente lo que buscas</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {categoriasConfig.vehiculos.tipos.map((tipo) => (
              <a key={tipo} href={`/catalogo?categoria=vehiculos&tipo=${tipo}`} className="bg-gray-50 hover:bg-blue-50 hover:border-blue-200 rounded-xl p-4 text-center border border-gray-100 hover:border-blue-200 transition card-hover group">
                <span className="text-2xl block mb-2">{getVehIcon(tipo)}</span>
                <p className="text-xs font-bold text-gray-700 group-hover:text-brand-blue transition truncate">{tipo}</p>
              </a>
            ))}
          </div>

          {/* Marcas populares */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-3 font-semibold">Marcas populares</p>
            <div className="flex flex-wrap gap-2">
              {['Toyota', 'Ford', 'Chevrolet', 'Honda', 'Hyundai', 'Kia', 'BMW', 'Nissan', 'Yamaha', 'Bera'].map((m) => (
                <a key={m} href={`/catalogo?categoria=vehiculos&marca=${m}`} className="px-4 py-2 bg-gray-100 hover:bg-brand-yellow hover:text-brand-blue rounded-full text-xs font-medium text-gray-600 transition">
                  {m}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRODUCTOS DESTACADOS ============ */}
      <section className="max-w-7xl mx-auto px-4 py-4 animate-on-scroll">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">🌟 Destacados</h2>
          <a href="/catalogo?destacado=true" className="text-brand-blue font-semibold hover:underline text-sm flex items-center gap-1">
            Ver todos <ChevronRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </section>

      {/* ============ POR QUÉ TODO ANUNCIOS ============ */}
      <section className="bg-brand-blue py-20 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">¿Por qué <span className="text-brand-yellow">Todo Anuncios</span>?</h2>
          <p className="text-center text-blue-200 mb-12 max-w-xl mx-auto">Porque Venezuela merece una alternativa real para comprar y vender</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🆓', titulo: 'Siempre gratis', desc: 'Publicar no cuesta nada. Nunca te pediremos comisión por vender tu producto.' },
              { icon: '💚', titulo: 'WhatsApp integrado', desc: 'Contacta directo por WhatsApp. Sin intermediarios, sin complicaciones.' },
              { icon: '💵', titulo: 'Precios en USD', desc: 'Así se comercia en Venezuela. Sin conversiones confusas.' },
              { icon: '🛡️', titulo: 'Compra seguro', desc: 'Sistema de verificación, reseñas y reportes para tu protección.' },
            ].map((item) => (
              <div key={item.titulo} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition card-hover">
                <span className="text-4xl block mb-4">{item.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{item.titulo}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONFIANZA ============ */}
      <section className="bg-gray-50 py-16 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-12">Seguridad que se nota</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔒', titulo: 'Datos protegidos', desc: 'Tu información personal solo está visible cuando tú lo decides.' },
              { icon: '⚠️', titulo: 'Publicaciones reportables', desc: 'Cualquier usuario puede reportar contenido fraudulento o inapropiado.' },
              { icon: '⭐', titulo: 'Sistema de reputación', desc: 'Los vendedores tienen puntuación visible. Compra con confianza.' },
            ].map((item) => (
              <div key={item.titulo} className="text-center">
                <span className="text-5xl block mb-4">{item.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.titulo}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-brand-yellow py-20 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-brand-blue mb-4">
            ¿Tienes algo para vender?
          </h2>
          <p className="text-brand-blue/80 text-lg mb-8 max-w-xl mx-auto">
            Publica gratis en segundos. Miles de compradores te esperan.
          </p>
          <Link href="/publicar" className="inline-flex items-center gap-2 bg-brand-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition shadow-lg">
            🚀 Publica ahora — Es gratis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function getVehIcon(tipo: string) {
  const icons: Record<string, string> = {
    'Carros': '🚗',
    'Camionetas/SUV': '🚙',
    'Motos': '🏍️',
    'Camiones': '🚛',
    'Furgonetas': '🚐',
    'Autobuses': '🚌',
    'Repuestos y Accesorios': '⚙️',
  }
  return icons[tipo] || '🚗'
}

function ProductCardSkeleton() {
  return (
    <a href="/producto/1" className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group block card-hover border border-gray-100">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img src={`https://picsum.photos/seed/p${Math.random()}/400/400`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <div className="p-4">
        <div className="h-4 skeleton skeleton-text w-3/4"></div>
        <div className="h-7 skeleton skeleton-price mt-3 w-1/2"></div>
        <div className="flex items-center justify-between mt-2">
          <div className="h-3 skeleton w-12"></div>
          <div className="h-3 skeleton w-16"></div>
        </div>
      </div>
    </a>
  )
}
