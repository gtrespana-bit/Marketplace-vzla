'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { MapPin, Tag, MessageCircle, Phone, Mail, Share2, Heart, ChevronRight, Shield, Clock, Star, X, Send } from 'lucide-react'
import Avatar from '@/components/Avatar'
import ReportarButton from '@/components/ReportarButton'
import BadgeVerificado from '@/components/BadgeVerificado'
import ImageGallery from '@/components/ImageGallery'

function formatarWhatsapp(telefono: string): string {
  // Limpiar y convertir a formato internacional Venezuela (+58)
  const limpio = telefono.replace(/[^0-9]/g, '')
  // Si empieza con 0, quitarlo
  const sinCero = limpio.startsWith('0') ? limpio.slice(1) : limpio
  // Si no empieza con 58, añadirlo
  return sinCero.startsWith('58') ? sinCero : '58' + sinCero
}

// Helper component for star rating
function StarRating({ value, onChange, size = 24, readonly = false }: { value: number; onChange?: (v: number) => void; size?: number; readonly?: boolean }) {
  return (
    <div className={`flex gap-1 ${readonly ? '' : 'cursor-pointer'}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          disabled={readonly}
          className={readonly ? 'cursor-default' : 'hover:scale-110 transition'}
        >
          <Star
            size={size}
            className={i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}

export default function ProductoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const slug = params?.slug as string
  const searchParams = useSearchParams()
  const esNuevaPublicacion = searchParams.get('nuevo') === '1'
  
  // Auto-remove ?nuevo=1 from URL after showing banner
  useEffect(() => {
    if (esNuevaPublicacion && window.location.search.includes('nuevo=1')) {
      if (window.history.replaceState) {
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname)
        }, 5000)
      }
    }
  }, [esNuevaPublicacion])

  const [producto, setProducto] = useState<any>(null)
  const [vendedor, setVendedor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalResenas, setTotalResenas] = useState(0)
  const [mostrarResena, setMostrarResena] = useState(false)
  const [rating, setRating] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [esFavorito, setEsFavorito] = useState(false)
  const [toggleandoFav, setToggleandoFav] = useState(false)

  useEffect(() => {
    if (!slug) return

    async function load() {
      const { data: prod, error: prodErr } = await supabase
        .from('productos')
        .select('*')
        .eq('id', slug)
        .eq('activo', true)
        .or('estado_moderacion.is.null,estado_moderacion.eq.aprobado')
        .single()

      if (prodErr || !prod) {
        setError(prodErr?.message || 'No encontrado')
        setLoading(false)
        return
      }
      setProducto(prod)

      // Fetch seller (include id + verificado)
      const { data: v } = await supabase
        .from('perfiles')
        .select('id, nombre, telefono, ciudad, estado, whatsapp_disponible, telefono_visible, email_visible, foto_perfil_url, verificado')
        .eq('id', prod.user_id)
        .single()
      if (v) setVendedor(v)

      // Reseñas count
      const { count: rc } = await supabase
        .from('resenas')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_id', prod.user_id)
      setTotalResenas(rc || 0)

      // Check si es favorito del usuario actual
      if (user) {
        const { count } = await supabase
          .from('favoritos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('producto_id', prod.id)
        setEsFavorito((count || 0) > 0)
      }
      // Increment views (fire and forget)
      supabase.from('productos').update({ visitas: (prod.visitas || 0) + 1 }).eq('id', prod.id).then(() => {})

      setLoading(false)
    }
    load()
  }, [slug])

  const handleContacto = () => {
    if (authLoading) return // espera a que cargue la sesión
    if (!user) {
      router.push(`/login?redirect=/producto/${slug}`)
      return
    }
    router.push(`/chat?producto_id=${producto.id}&vendedor_id=${producto.user_id}`)
  }

  const toggleFavorito = async () => {
    if (authLoading) return
    if (!user) { router.push(`/login?redirect=/producto/${slug}`); return }
    if (toggleandoFav) return
    setToggleandoFav(true)
    if (esFavorito) {
      await supabase.from('favoritos').delete().eq('user_id', user.id).eq('producto_id', producto.id)
      setEsFavorito(false)
    } else {
      await supabase.from('favoritos').insert({ user_id: user.id, producto_id: producto.id })
      setEsFavorito(true)
    }
    setToggleandoFav(false)
  }

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

  // ====== SUCCESS BANNER (primera publicacion) ======
  const SuccessBanner = () => esNuevaPublicacion ? (
    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <h3 className="font-bold text-green-800 text-lg">¡Publicado con éxito! 🎉</h3>
          <p className="text-green-700 text-sm mt-1">Tu anuncio ya es visible para miles de compradores en Venezuela.</p>
          <p className="text-green-600 text-xs mt-2 font-bold">Publicación 100% GRATIS · 0 comisiones · Siempre</p>
        </div>
      </div>
    </div>
  ) : null

  // Contact methods: per-product settings, or fallback to profile
  const mc = producto.metodos_contacto
  const mcConfigured = mc && Object.keys(mc).length > 0
  // Use per-product phone if configured, otherwise profile phone
  const contactPhone = mcConfigured ? (mc.telefono || mc.whatsapp || '') : (vendedor?.telefono || '')
  const metodos = {
    chat: true,
    whatsapp: contactPhone.trim().length > 0,
    telefono: mcConfigured ? !!(mc.telefono && mc.telefono.trim()) : false,
    email: mcConfigured ? !!(mc.email && vendedor?.email) : !!(vendedor?.email),
  }

  const imagenes = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes
    : producto.imagen_url ? [producto.imagen_url] : []

  const precioBs = producto.precio_usd ? Math.round(producto.precio_usd * 36).toLocaleString() : ''

  // WhatsApp link
  let whatsappLink = ''
  if (contactPhone.trim()) {
    const t = contactPhone.replace(/[^0-9]/g, '')
    const t2 = t.startsWith('0') ? t.slice(1) : t
    const finalPhone = t2.startsWith('58') ? t2 : '58' + t2
    whatsappLink = 'https://wa.me/' + finalPhone + '?text=' + encodeURIComponent('Hola, vi tu publicacion de "' + producto.titulo + '" en Todo Anuncios. Esta disponible?')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Success banner */}
      <SuccessBanner />
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 overflow-x-auto hide-scrollbar">
        <Link href="/" className="hover:text-brand-blue flex-shrink-0">Inicio</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link href="/catalogo" className="hover:text-brand-blue flex-shrink-0">Catalogo</Link>
        {producto.subcategoria && (
          <>
            <ChevronRight size={14} className="flex-shrink-0" />
            <span className="capitalize flex-shrink-0">{producto.subcategoria}</span>
          </>
        )}
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-800 font-medium truncate flex-shrink-0">{producto.titulo}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: imagenes + descripcion */}
        <div className="lg:col-span-2 space-y-6">
          {imagenes.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <ImageGallery images={imagenes} alt={producto.titulo} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="aspect-square md:aspect-[16/10] bg-gray-100 flex items-center justify-center">
                <Tag size={48} className="text-gray-300" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{producto.titulo}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge-trust">{producto.estado}</span>
              {producto.marca && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{producto.marca}</span>}
              {producto.subcategoria && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm capitalize">{producto.subcategoria}</span>}
            </div>
            {producto.descripcion && (
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{producto.descripcion}</p>
            )}
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
              <span className="flex items-center gap-1">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx={12} cy={12} r={3} />
                </svg> {producto.visitas || 0} vistas
              </span>
            </div>

            {vendedor && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <Link href={`/vendedor/${vendedor.id}`} className="flex items-center gap-3 hover:bg-gray-100 rounded-xl p-1 -m-1 transition">
                  <Avatar nombre={vendedor.nombre || 'Vendedor'} fotoUrl={vendedor.foto_perfil_url} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{vendedor.nombre || 'Vendedor'}</p>
                      {vendedor.verificado && <BadgeVerificado size="sm" />}
                    </div>
                    {vendedor.ciudad && <p className="text-xs text-gray-500">{vendedor.ciudad}{vendedor.estado ? `, ${vendedor.estado}` : ''}</p>}
                  </div>
                </Link>
                {/* Reseñas mini-resumen */}
                {totalResenas > 0 && (
                  <div className="flex items-center gap-1 mt-2 ml-0">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{totalResenas} reseña{totalResenas !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {/* Botón de reseña — solo el comprador real */}
                {user && user.id !== producto.user_id && (
                  <button
                    onClick={() => setMostrarResena(true)}
                    className="text-xs text-brand-blue hover:underline mt-2"
                  >
                    {totalResenas === 0 ? 'Dejar primera reseña →' : 'Escribir reseña →'}
                  </button>
                )}
              </div>
            )}

            {/* Botones de contacto */}
            <div className="space-y-3">
              {/* Botones principales - Chat + WhatsApp */}
              <div className="grid grid-cols-2 gap-2">
                {metodos.chat && (
                  <button onClick={handleContacto} className="bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 text-sm">
                    <MessageCircle size={18} /> Chat
                  </button>
                )}
                {metodos.whatsapp && whatsappLink && (
                  <a href={whatsappLink} target="_blank" className="bg-[#25D366] text-white py-3 rounded-xl font-bold hover:brightness-90 transition flex items-center justify-center gap-2 text-sm">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
              </div>
              {/* Botones secundarios */}
              <div className="grid grid-cols-2 gap-2">
                {metodos.telefono && contactPhone && (
                  <a href={`tel:${contactPhone}`} className="border py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm">
                    <Phone size={16} /> Llamar
                  </a>
                )}
                {metodos.email && (
                  <a href={`mailto:${vendedor.email}`} className="border py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm">
                    <Mail size={16} /> Email
                  </a>
                )}
              </div>
            </div>

            {(producto.ubicacion_ciudad || producto.ubicacion_estado) && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t">
                <MapPin size={16} /> {producto.ubicacion_ciudad}
                {producto.ubicacion_ciudad && producto.ubicacion_estado ? ', ' : ''}
                {producto.ubicacion_estado}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={toggleFavorito}
                disabled={toggleandoFav}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition ${
                  esFavorito
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart size={16} className={esFavorito ? 'fill-red-600' : ''} />
                {esFavorito ? 'Guardado' : 'Guardar'}
              </button>
              <button
                onClick={() => navigator.share?.({ title: producto.titulo, url: window.location.href })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <Share2 size={16} /> Compartir
              </button>
              <ReportarButton productoId={producto.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Dejar reseña */}
      {mostrarResena && user && vendedor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Reseña para {vendedor.nombre || 'el vendedor'}</h3>
              <button onClick={() => setMostrarResena(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-2">¿Cómo fue tu experiencia?</p>
            <StarRating value={rating} onChange={setRating} size={32} />

            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 mt-4 resize-none"
              placeholder="Cuéntanos tu experiencia (opcional)..."
            />
            <p className="text-xs text-gray-400 mt-1">{comentario.length}/500</p>

            <button
              onClick={async () => {
                if (!user || !producto || !vendedor) return
                setEnviandoResena(true)
                const { error: err } = await supabase
                  .from('resenas')
                  .insert({
                    producto_id: producto.id,
                    vendedor_id: vendedor.id,
                    comprador_id: user.id,
                    puntuacion: rating,
                    comentario: comentario.trim() || null,
                  })

                setEnviandoResena(false)
                if (err) {
                  alert('Error al enviar la reseña: ' + err.message)
                } else {
                  setMostrarResena(false)
                  setComentario('')
                  setRating(5)
                  setTotalResenas(prev => prev + 1)
                }
              }}
              disabled={enviandoResena}
              className="w-full mt-4 bg-brand-blue text-white py-2.5 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> {enviandoResena ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
