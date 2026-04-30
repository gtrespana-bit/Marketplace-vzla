'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { MapPin, Tag, MessageCircle, Phone, Mail, Share2, Heart, ChevronRight, Shield, Clock, Star, X, Send } from 'lucide-react'
import Avatar from '@/components/Avatar'
import ReportarButton from '@/components/ReportarButton'
import BadgeVerificado from '@/components/BadgeVerificado'

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

  // Contact methods from product (new per-publication setting) or fallback to seller profile
  const metodos = producto.metodos_contacto || {
    chat: true,
    whatsapp: vendedor?.whatsapp_disponible || false,
    telefono: vendedor?.telefono_visible || false,
    email: vendedor?.email_visible || false,
  }

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

            {/* Botones de contacto - según métodos de la publicación */}
            <div className="space-y-2">
              {metodos.chat && (
                <button onClick={handleContacto} className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2">
                  <MessageCircle size={18} /> Chat del marketplace
                </button>
              )}
              {metodos.whatsapp && vendedor?.telefono && (
                <a href={`https://wa.me/${vendedor.telefono?.replace(/\s+/g, '')}`} target="_blank" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                  💚 WhatsApp
                </a>
              )}
              {metodos.telefono && vendedor?.telefono && (
                <a href={`tel:${vendedor.telefono}`} className="w-full border py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Phone size={18} /> Llamar
                </a>
              )}
              {metodos.email && (
                <a href={`mailto:${vendedor.email}`} className="w-full border py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Mail size={18} /> Email
                </a>
              )}
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
