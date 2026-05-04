'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { MapPin, ChevronRight } from 'lucide-react'

interface Props {
  ciudadSlug: string
  ciudadNombre: string
  categoriaSlug: string
  categoriaNombre: string
}

const CATEGORIA_MAP: Record<string, string> = {
  vehiculos: 'vehiculos',
  'tecnologia': 'tecnologia',
  moda: 'moda',
  hogar: 'hogar',
  herramientas: 'herramientas',
  materiales: 'materiales',
  'repuestos': 'repuestos',
  otros: 'otros',
}

export default function LandingCategoria({ ciudadSlug, ciudadNombre, categoriaSlug, categoriaNombre }: Props) {
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('productos')
      .select('id, titulo, precio_usd, estado, imagen_url, ubicacion_ciudad, subcategoria, destacado, destacado_hasta')
      .eq('activo', true)
      .eq('ubicacion_ciudad', ciudadNombre)
      .eq('subcategoria', categoriaSlug)
      .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
      .order('creado_en', { ascending: false })
      .limit(24)
      .then(({ data }) => setProductos(data || []))
  }, [categoriaSlug, ciudadNombre])

  // Categorias relacionadas para la ciudad
  const categoriasRelacionadas = Object.entries(CATEGORIA_MAP)
    .filter(([k]) => k !== categoriaSlug)
    .map(([k, v]) => ({ slug: k, nombre: CATEGORIA_NAMES[k] || k }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand-primary">Inicio</Link>
        <ChevronRight size={14} />
        <Link href={`/${ciudadSlug}`} className="hover:text-brand-primary">{ciudadNombre}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">{categoriaNombre}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
        {categoriaNombre} en {ciudadNombre}
      </h1>
      <p className="text-gray-500 mb-6">
        Anuncios de {categoriaNombre.toLowerCase()} en {ciudadNombre}. Publica gratis.
      </p>

      {/* Categorias en esta ciudad */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categoriasRelacionadas.map((cat) => (
          <Link key={cat.slug} href={`/${ciudadSlug}/${cat.slug}`} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-brand-primary hover:text-white transition">
            {cat.nombre} en {ciudadNombre}
          </Link>
        ))}
      </div>

      {productos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p: any) => (
            <Link key={p.id} href={`/producto/${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition group block">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {p.destacado && new Date(p.destacado_hasta) > new Date() && (
                  <div className="absolute top-2 left-2 z-10 bg-brand-accent text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Destacado</div>
                )}
                {p.imagen_url ? (
                  <Image src={p.imagen_url} alt={p.titulo} width={300} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl"></div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{p.titulo}</h3>
                <p className="text-lg font-black text-brand-primary mt-1">${Number(p.precio_usd || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{p.estado} · {p.subcategoria}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl mb-2">No hay {categoriaNombre.toLowerCase()} en {ciudadNombre} todavía</p>
          <p className="mb-4">¡Sé el primero en publicar!</p>
          <Link href="/publicar" className="inline-block bg-brand-primary text-white px-6 py-3 rounded-lg font-bold">Publicar gratis</Link>
        </div>
      )}
    </div>
  )
}

const CATEGORIA_NAMES: Record<string, string> = {
  vehiculos: 'Vehículos',
  tecnologia: 'Tecnología',
  moda: 'Moda',
  hogar: 'Hogar',
  herramientas: 'Herramientas',
  materiales: 'Materiales',
  repuestos: 'Repuestos',
  otros: 'Otros',
}
