'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MapPin, Tag, MessageCircle, Phone, Mail, Share2, Heart, ChevronRight, Shield, Clock } from 'lucide-react'

export default function ProductoPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [producto, setProducto] = useState<any>(null)
  const [vendedor, setVendedor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    async function load() {
      const { data: prod, error: prodErr } = await supabase
        .from('productos')
        .select('*')
        .eq('id', slug)
        .eq('activo', true)
        .single()

      if (prodErr || !prod) {
        setError(prodErr?.message || 'No encontrado')
        setLoading(false)
        return
      }
      setProducto(prod)

      // Fetch seller
      const { data: v } = await supabase
        .from('perfiles')
        .select('nombre, telefono, ciudad, estado, whatsapp_disponible, telefono_visible, email_visible')
        .eq('id', prod.user_id)
        .single()
      if (v) setVendedor(v)

      // Increment views
      supabase.from('productos').update({ visitas: (prod.visitas || 0) + 1 }).eq('id', prod.id).then(() => {})

      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
        <div className="bg-gray-200 rounded-2xl h-96" />
      </div>
    </div>
  )

  if (error || !producto) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
      <p className="text-gray-500 mb-8">{error}</p>
      <Link href="/" className="inline-block bg-brand-blue text-white px-8 py-3 rounded-lg font-bold">Volver al inicio</Link>
    </div>
  )

  const imagenes = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes
    : producto.imagen_url ? [producto.imagen_url] : []

  const precioBs = producto.precio_usd ? Math.round(producto.precio_usd * 36).toLocaleString() : ''

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 overflow-x-auto hide-scrollbar">
        <Link href="/" className="hover:text-brand-blue flex-shrink-0">Inicio</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link href="/catalogo" className="hover:text-brand-blue flex-shrink-0">Catalogo</Link>
        {producto.subcategoria && (<><ChevronRight size={14} className="flex-shrink-0" /><span className="capitalize flex-shrink-0">{producto.subcategoria}</span></>)}
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-800 font-medium truncate flex-shrink-0">{producto.titulo}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: imagenes + descripcion */}
        <div className="lg:col-span-2 space-y-6">
          {imagenes.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="aspect-square md:aspect-[16/10] bg-gray-100">
                <img src={imagenes[0]} alt={producto.titulo} className="w-full h-full object-cover" />
              </div>
              {imagenes.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
                  {imagenes.map((img: string, i: number) => (
                    <button key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 hover:border-brand-yellow transition">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="aspect-square md:aspect-[16/10] bg-gray-100 flex items-center justify-center"><Tag size={48} className="text-gray-300" /></div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{producto.titulo}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge-trust">{producto.estado}</span>
              {producto.marca && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{producto.marca}</span>}
              {producto.subcategoria && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm capitalize">{producto.subcategoria}</span>}
            </div>
            {producto.descripcion && <p className="text-gray-600 whitespace-pre-line leading-relaxed">{producto.descripcion}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="font-bold text-brand-blue mb-3 flex items-center gap-2"><Shield size={18} /> Compra seguro</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <li>Encuentrate al vendedor en un lugar publico</li>
              <li>Verifica el producto antes de pagar</li>
              <li>Nunca envies dinero por adelantado</li>
              <li>Desconfia de precios demasiado bajos</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: precio + contacto */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-20">
            <p className="text-4xl font-black text-brand-blue">${Number(producto.precio_usd || 0).toLocaleString()}</p>
            {precioBs && <p className="text-sm text-gray-500 mt-1">Bs. {precioBs} (tasa ref.)</p>}

            <div className="flex items-center gap-4 text-xs text-gray-500 my-4 pb-4 border-b">
              <span className="flex items-center gap-1"><Clock size={14} /> Publicado</span>
              <span className="flex items-center gap-1"><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg> {producto.visitas || 0} vistas</span>
            </div>

            {vendedor && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg">{vendedor.nombre?.charAt(0) || '?'}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{vendedor.nombre || 'Vendedor'}</p>
                    {vendedor.ciudad && <p className="text-xs text-gray-500">{vendedor.ciudad}, {vendedor.estado}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Link href={`/chat?producto_id=${producto.id}&vendedor_id=${producto.user_id}`} className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2"><MessageCircle size={18} /> Enviar mensaje</Link>
              {vendedor?.whatsapp_disponible && vendedor?.telefono && (
                <a href={`https://wa.me/${vendedor.telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition text-center">WhatsApp directo</a>
              )}
              {vendedor?.telefono_visible && vendedor?.telefono && (
                <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"><Phone size={18} /> {vendedor.telefono}</button>
              )}
            </div>

            {(producto.ubicacion_ciudad || producto.ubicacion_estado) && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t"><MapPin size={16} /> {producto.ubicacion_ciudad}{producto.ubicacion_ciudad && producto.ubicacion_estado ? ', ' : ''}{producto.ubicacion_estado}</div>
            )}

            <div className="flex gap-2 mt-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"><Heart size={16} /> Guardar</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"><Share2 size={16} /> Compartir</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
