import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Zap, Eye, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BotonDescargarApp } from '@/components/BotonDescargarApp'

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

async function getCategorias() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, slug, icono')
      .order('orden', { ascending: true })
      .limit(8)
    
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Error fetching categorias:', e)
    return []
  }
}

export default async function HomePage() {
  const destacados = await getDestacados()
  const categorias = await getCategorias()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compra y vende de todo en Venezuela
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            La plataforma más segura y rápida para encontrar lo que necesitas o darle salida a lo que ya no usas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/publicar" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Zap className="w-5 h-5 mr-2" />
              Publicar gratis
            </Link>
            <Link 
              href="/explorar" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors border border-blue-400"
            >
              <Eye className="w-5 h-5 mr-2" />
              Explorar productos
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Categorías populares
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categorias.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">{cat.icono || '📦'}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600">
                  {cat.nombre}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Productos destacados
            </h2>
            <Link href="/destacados" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {destacados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destacados.map((prod: any) => (
                <Link 
                  key={prod.id} 
                  href={`/producto/${prod.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="relative aspect-square bg-gray-200">
                    {prod.imagen_url ? (
                      <Image 
                        src={prod.imagen_url} 
                        alt={prod.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                    {prod.destacado && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1" /> Destacado
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {prod.titulo}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">
                        ${Number(prod.precio_usd || 0).toLocaleString('es-VE')}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {prod.ubicacion_ciudad || 'Venezuela'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 mb-4">Aún no hay productos destacados.</p>
              <Link href="/publicar" className="text-blue-600 hover:underline font-medium">
                ¡Sé el primero en destacar tu producto!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Descargar App */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Lleva VendeT en tu bolsillo</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Descarga nuestra aplicación para recibir notificaciones instantáneas, chatear con vendedores y publicar productos desde cualquier lugar.
          </p>
          <BotonDescargarApp variant="light" />
        </div>
      </section>

      {/* Seller Onboarding */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Quieres vender más?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Destaca tus productos, obtén el badge de verificado y llega a miles de compradores en toda Venezuela.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ir a mi panel de vendedor
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export const revalidate = 120