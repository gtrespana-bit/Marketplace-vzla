'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Zap, Eye, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { BotonDescargarApp } from '@/components/BotonDescargarApp'

const PLACEHOLDER_IMAGES = ['/placeholder-product.webp']

function getPlaceholderImage(titulo: string) {
  return PLACEHOLDER_IMAGES[Math.abs(titulo.charCodeAt(0)) % PLACEHOLDER_IMAGES.length]
}

function formatPrecio(precio: number | null) {
  if (precio === null || precio === undefined) return 'Consultar'
  return `$${precio.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function ProductoCard({ producto }: { producto: any }) {
  const { t } = useLanguage()
  const imagen = producto.imagen_url && producto.imagen_url.length > 0
    ? (Array.isArray(producto.imagen_url) ? producto.imagen_url[0] : producto.imagen_url)
    : getPlaceholderImage(producto.titulo || '')
  const href = `/producto/${producto.id}`

  return (
    <Link href={href} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imagen}
          alt={producto.titulo || 'Producto'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 shadow-md">
            <Star size={10} fill="white" /> {t('home.featured', 'DESTACADO')}
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors">{producto.titulo}</h3>
        <p className="text-brand-primary font-bold text-lg">{formatPrecio(producto.precio_usd)}</p>
        {producto.ubicacion_ciudad && (
          <p className="text-gray-400 text-xs mt-auto pt-1">{producto.ubicacion_ciudad}</p>
        )}
      </div>
    </Link>
  )
}

export function HomePageClient({ destacados }: { destacados: any[] }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-primary via-brand-primary to-brand-accent text-brand-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {t('home.hero.title1', 'Compra y vende en')} <span className="text-white">{t('home.hero.title2', 'Venezuela')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              {t('home.hero.subtitle', 'El marketplace hecho para ti. Publica gratis, contacta directo, vende rápido. Los mejores clasificados online de Venezuela.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalogo" className="bg-brand-dark text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg">
                {t('home.hero.explore', 'Explorar Catálogo')} <ArrowRight size={20} />
              </Link>
              <Link href="/publicar" className="bg-white/90 text-brand-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg">
                {t('home.hero.publish', 'Publicar Gratis')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('home.categories', 'Categorías de Clasificados en Venezuela')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {[
            { nombre: t('cat.vehiculos', 'Vehículos'), slug: 'vehiculos', icon: '🚗' },
            { nombre: t('cat.tecnologia', 'Tecnología'), slug: 'tecnologia', icon: '📱' },
            { nombre: t('cat.moda', 'Moda'), slug: 'moda', icon: '👕' },
            { nombre: t('cat.hogar', 'Hogar'), slug: 'hogar', icon: '🏠' },
            { nombre: t('cat.herramientas', 'Herramientas'), slug: 'herramientas', icon: '🔧' },
            { nombre: t('cat.deportes', 'Deportes'), slug: 'deportes', icon: '⚽' },
            { nombre: t('cat.inmuebles', 'Inmuebles'), slug: 'inmuebles', icon: '🏢' },
            { nombre: t('cat.servicios', 'Servicios'), slug: 'servicios', icon: '🛠️' },
            { nombre: t('cat.otros', 'Otros'), slug: 'otros', icon: '📦' },
          ].map((cat) => (
            <Link key={cat.slug} href={`/catalogo?categoria=${cat.slug}`} className="bg-white rounded-xl p-3 text-center hover:shadow-md transition-all hover:scale-105 border border-gray-100 group">
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-xs font-medium text-gray-700 group-hover:text-brand-primary transition-colors">{cat.nombre}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl">
                <Star className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('home.featuredProducts', 'Productos Destacados en Venezuela')}</h2>
            </div>
            <Link href="/catalogo?destacados=true" className="text-brand-primary font-semibold hover:underline inline-flex items-center gap-1">
              {t('home.viewAll', 'Ver todos')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {destacados.map((producto: any) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {/* Cómo Funciona */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{t('home.howItWorks', '¿Cómo funciona VendeT.online?')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="text-brand-primary" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">{t('home.step1.title', 'Publica tu producto gratis')}</h3>
              <p className="text-gray-600">{t('home.step1.desc', 'Sube fotos, ponle precio y describe lo que vendes. Sin comisiones.')}</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-brand-primary" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">{t('home.step2.title', 'Contacta directo')}</h3>
              <p className="text-gray-600">{t('home.step2.desc', 'Chatea con compradores o vendedores sin intermediarios en Venezuela.')}</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-brand-primary" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">{t('home.step3.title', 'Vende rápido')}</h3>
              <p className="text-gray-600">{t('home.step3.desc', 'Destaca tu anuncio para llegar a más personas y vender más rápido.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Destacar */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 text-white text-center">
          <Star className="mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-black mb-4">{t('home.cta.title', '¿Quieres vender más rápido en Venezuela?')}</h2>
          <p className="text-lg mb-8 opacity-90">{t('home.cta.subtitle', 'Destaca tu producto y llega a miles de compradores potenciales en todo el país.')}</p>
          <Link href="/publicar" className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg">
            {t('home.cta.button', 'Destacar mi anuncio')}
          </Link>
        </div>
      </section>

      {/* Botón Descargar App */}
      <BotonDescargarApp />
    </div>
  )
}