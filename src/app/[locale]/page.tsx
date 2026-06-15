import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Zap, Eye, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BotonDescargarApp } from '@/components/BotonDescargarApp'
import { getTranslations } from 'next-intl/server'

const PLACEHOLDER_IMAGES = ['/placeholder-product.webp']

function getPlaceholderImage(titulo: string) {
  return PLACEHOLDER_IMAGES[Math.abs(titulo.charCodeAt(0)) % PLACEHOLDER_IMAGES.length]
}

async function getDestacados(limit = 8) {
  try {
    const { data, error } = await supabase.rpc('obtener_destacados_home', { p_limite: limit })
    if (!error && data) return data as any[]

    const { data: data2 } = await supabase
      .from('productos')
      .select('id, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, destacado, destacado_hasta')
      .eq('estado', 'activo')
      .eq('destacado', true)
      .order('destacado_hasta', { ascending: false })
      .limit(limit)
    return data2 || []
  } catch (e) {
    console.error('Error fetching destacados:', e)
    return []
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const destacados = await getDestacados()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-blue-700 bg-white hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t('hero.explore')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <BotonDescargarApp />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            {t('featured.title')}
          </h2>
          <Link href="/catalogo" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            {t('featured.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {destacados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">{t('featured.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destacados.map((producto: any) => (
              <Link
                key={producto.id}
                href={`/producto/${producto.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={producto.imagen_url || getPlaceholderImage(producto.titulo)}
                    alt={producto.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {producto.destacado && (
                    <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {t('featured.badge')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {producto.titulo}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">${producto.precio_usd}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {producto.ubicacion_ciudad || 'Venezuela'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8" />
            <h2 className="text-3xl font-bold">{t('cta.title')}</h2>
          </div>
          <p className="text-xl text-indigo-100 mb-8">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/publicar"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            {t('cta.button')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Seller Dashboard CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            {t('dashboard.subtitle')}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white text-lg font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            {t('dashboard.button')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export const revalidate = 120