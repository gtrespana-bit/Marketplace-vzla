'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import BadgeVerificado from '@/components/BadgeVerificado'
import Avatar from '@/components/Avatar'
import { MapPin, Phone, Mail, MessageSquare, Star, ArrowLeft, ShoppingBag, Calendar } from 'lucide-react'

export default function VendedorPage() {
  const params = useParams()
  const router = useRouter()
  const vendedorId = params.id as string

  const [vendedor, setVendedor] = useState<any>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])
  const [promedio, setPromedio] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVendedor() {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', vendedorId)
        .single()

      if (!perfil) {
        router.push('/')
        return
      }

      setVendedor(perfil)

      // Productos activos
      const { data: prods } = await supabase
        .from('productos')
        .select('id, titulo, precio_usd, imagen_url, categoria_id, subcategoria')
        .eq('user_id', vendedorId)
        .eq('activo', true)
        .order('creado_en', { ascending: false })
        .limit(12)

      setProductos(prods || [])

      // Reseñas (las que recibe el vendedor)
      const { data: res } = await supabase
        .from('resenas')
        .select('*')
        .eq('vendedor_id', vendedorId)
        .order('creado_en', { ascending: false })

      if (res) {
        setResenas(res)
        if (res.length > 0) {
          const avg = res.reduce((sum, r) => sum + r.puntuacion, 0) / res.length
          setPromedio(Math.round(avg * 10) / 10)
        }
      }

      setLoading(false)
    }
    loadVendedor()
  }, [vendedorId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!vendedor) return null

  // Métodos de contacto (genéricos del perfil, si hay)
  const tieneWhatsApp = vendedor.whatsapp_disponible && vendedor.telefono
  const tieneTelefono = vendedor.telefono_disponible && vendedor.telefono
  const tieneEmail = vendedor.email_disponible && vendedor.email_publico

  const estrellasRender = (rating: number, size = 16) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Perfil del vendedor */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar nombre={vendedor.nombre || 'Vendedor'} fotoUrl={vendedor.foto_perfil_url} size="xl" />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {vendedor.nombre || 'Vendedor'}
              {vendedor.verificado && <BadgeVerificado size="md" />}
            </h1>

            {(vendedor.ciudad || vendedor.estado) && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin size={14} /> {[vendedor.ciudad, vendedor.estado].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Rating */}
            {resenas.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {estrellasRender(promedio, 18)}
                <span className="text-sm font-bold text-gray-700">{promedio.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({resenas.length} reseña{resenas.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Contacto */}
            <div className="flex flex-wrap gap-2 mt-4">
              {tieneWhatsApp && (
                <a
                  href={`https://wa.me/${vendedor.telefono?.replace(/\s+/g, '')}`}
                  target="_blank"
                  className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  💚 WhatsApp
                </a>
              )}
              {tieneTelefono && (
                <a
                  href={`tel:${vendedor.telefono}`}
                  className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  <Phone size={14} /> Llamar
                </a>
              )}
              {tieneEmail && vendedor.email_publico && (
                <a
                  href={`mailto:${vendedor.email_publico}`}
                  className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  <Mail size={14} /> Email
                </a>
              )}
              <button
                onClick={() => router.push(`/chat?vendedor=${vendedorId}`)}
                className="flex items-center gap-1.5 bg-brand-blue text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
              >
                <MessageSquare size={14} /> Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      {resenas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Star size={20} className="text-yellow-400 fill-yellow-400" />
            Reseñas ({resenas.length})
          </h2>
          <div className="space-y-4">
            {resenas.map(r => (
              <div key={r.id} className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {estrellasRender(r.puntuacion, 14)}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(r.creado_en).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {r.comentario && <p className="text-sm text-gray-600">{r.comentario}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos del vendedor */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag size={20} />
          Publicaciones de {vendedor.nombre || 'este vendedor'} ({productos.length})
        </h2>

        {productos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-2" />
            <p>No tiene publicaciones activas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productos.map(p => (
              <Link key={p.id} href={`/producto/${p.id}`} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition group">
                <div className="aspect-square bg-gray-100">
                  {p.imagen_url ? (
                    <Image src={p.imagen_url} alt={p.titulo} width={400} height={400} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin foto</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{p.titulo}</h3>
                  <p className="text-brand-blue font-bold mt-1">${p.precio_usd?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
