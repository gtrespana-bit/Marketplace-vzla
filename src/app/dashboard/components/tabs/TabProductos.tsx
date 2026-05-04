"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Package, X, Pause, Play, Edit, Zap, Star, CheckCircle2, ArrowLeft, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TabProductos({
  productos,
  onBoost,
  onDestacar,
  userId,
}: {
  productos: any[]
  onBoost: (m: { productId: string; titulo: string }) => void
  onDestacar: (m: { productId: string; titulo: string }) => void
  userId: string
}) {
  const [vendidoModal, setVendidoModal] = useState<string | null>(null)
  const [vendidoPaso, setVendidoPaso] = useState<'tipo' | 'comprador' | 'reseña' | 'confirmado'>('tipo')
  const [interesados, setInteresados] = useState<any[]>([])
  const [compradorInfo, setCompradorInfo] = useState<{ id: string; nombre: string } | null>(null)
  const [cargandoVendidos, setCargandoVendidos] = useState(false)
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [rating, setRating] = useState(5)
  const [comentarioResena, setComentarioResena] = useState('')

  // Abrir modal de vendido
  const abrirVendido = async (productoId: string) => {
    setVendidoModal(productoId)
    setVendidoPaso('tipo')
    setCompradorInfo(null)
    setInteresados([])
    setRating(5)
    setComentarioResena('')

    if (!userId) return
    setCargandoVendidos(true)
    try {
      const res = await fetch(`/api/admin/marcar-vendido?productoId=${productoId}&userId=${userId}`)
      const data = await res.json()
      if (data.ok && data.interesados) setInteresados(data.interesados)
    } catch {
      // fail silently
    }
    setCargandoVendidos(false)
  }

  // Marcar como vendido (simple — sin comprador, sin reseña)
  const marcarVendidoSimple = async (productoId: string, vendidoEn: string) => {
    const res = await fetch('/api/admin/marcar-vendido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId, userId, vendidoEn }),
    })
    if (!res.ok) {
      const d = await res.json()
      alert('Error: ' + d.error)
      return
    }
    setVendidoPaso('confirmado')
  }

  // Seleccionar comprador → ir a "¿quieres dejar reseña?"
  const seleccionarComprador = (comprador: { userId: string; nombre: string }) => {
    setCompradorInfo({ id: comprador.userId, nombre: comprador.nombre })
    setVendidoPaso('reseña')
  }

  // Marcar vendido con comprador pero SIN reseña
  const venderSinResena = async () => {
    if (!vendidoModal || !compradorInfo) return
    const res = await fetch('/api/admin/marcar-vendido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productoId: vendidoModal,
        userId,
        vendidoEn: 'plataforma',
        compradorId: compradorInfo.id,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      alert('Error: ' + d.error)
      return
    }
    setVendidoPaso('confirmado')
  }

  // Enviar reseña al comprador
  const enviarResena = async () => {
    if (!vendidoModal || !compradorInfo) return
    setEnviandoResena(true)

    // Primero marcar como vendido con comprador
    const res1 = await fetch('/api/admin/marcar-vendido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productoId: vendidoModal,
        userId,
        vendidoEn: 'plataforma',
        compradorId: compradorInfo.id,
      }),
    })

    if (!res1.ok) {
      const d = await res1.json()
      setEnviandoResena(false)
      alert('Error al marcar vendido: ' + d.error)
      return
    }

    // Ahora enviar la reseña
    const res2 = await fetch('/api/admin/enviar-resena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: vendidoModal,
        evaluador_id: userId,
        evaluado_id: compradorInfo.id,
        puntuacion: rating,
        comentario: comentarioResena.trim() || null,
      }),
    })

    setEnviandoResena(false)

    const data2 = await res2.json()
    if (!res2.ok) {
      // Si la reseña falla pero el vendido sí fue, mostrar confirmado de todos modos
      console.warn('Reseña falló:', data2.error)
    }

    setVendidoPaso('confirmado')
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Package size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes publicaciones</h3>
        <p className="text-gray-500 mb-6">Publica tu primer producto en segundos. ¡Es gratis!</p>
        <Link href="/publicar" className="inline-block bg-brand-accent text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-accent/90 transition">Publicar ahora</Link>
      </div>
    )
  }

  const now = new Date().toISOString()

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-4">Mis publicaciones</h3>
      </div>
      <div className="space-y-3">
        {productos.map((p) => {
          const isBoosted = p.boosteado_en != null
          const isFeatured = p.destacado && p.destacado_hasta && p.destacado_hasta > now
          const isVendido = p.vendido === true
          return (
            <div key={p.id} className={`group flex items-center gap-4 p-3 rounded-lg border border-gray-100 transition ${isVendido ? 'bg-green-50/50 border-green-200' : 'hover:bg-gray-50'}`}>
              <Link href={`/producto/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                  )}
                  {isVendido && (
                    <div className="absolute inset-0 bg-green-600/70 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">VENDIDO</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate group-hover:text-brand-primary transition">
                    {isBoosted && '⚡ '}{isFeatured && !isBoosted && '⭐ '}{p.titulo}
                  </h4>
                  <p className="text-sm text-brand-primary font-bold">${p.precio_usd?.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>👀 {p.visitas || 0} vistas</span>
                    {isVendido
                      ? <span className="text-green-700 font-semibold">✅ Vendido</span>
                      : p.activo
                        ? '✅ Activo'
                        : '⏸️ Pausado'
                    }
                    {isFeatured && (
                      <span className="text-brand-primary">⭐ Hasta {new Date(p.destacado_hasta).toLocaleDateString('es-VE')}</span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/producto/editar/${p.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition text-brand-primary" title="Editar">
                  <Edit size={16} />
                </Link>
                {p.activo && !isVendido && (
                  <button
                    onClick={() => abrirVendido(p.id)}
                    className="p-2 hover:bg-green-100 rounded-lg transition text-green-700 font-bold"
                    title="Marcar como Vendido"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
                <button
                  onClick={async () => {
                    const ns = !p.activo
                    await supabase.from('productos').update({ activo: ns }).eq('id', p.id)
                    window.location.reload()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title={p.activo ? 'Pausar' : 'Activar'}
                >
                  {p.activo ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={() => onBoost({ productId: p.id, titulo: p.titulo })} className="p-2 hover:bg-yellow-50 rounded-lg transition text-yellow-600" title="Boost">
                  <Zap size={16} />
                </button>
                <button onClick={() => onDestacar({ productId: p.id, titulo: p.titulo })} className="p-2 hover:bg-yellow-50 rounded-lg transition text-brand-primary" title="Destacar">
                  <Star size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('¿Eliminar esta publicacion permanentemente?')) {
                      await supabase.from('productos').delete().eq('id', p.id)
                      window.location.reload()
                    }
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                  title="Eliminar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL MARCAR COMO VENDIDO */}
      {vendidoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              {vendidoPaso !== 'tipo' ? (
                <button onClick={() => setVendidoPaso('tipo')} className="flex items-center gap-1 text-sm text-brand-primary hover:underline">
                  <ArrowLeft size={16} /> Atrás
                </button>
              ) : <div />}
              <button onClick={() => setVendidoModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* PASO 1: ¿Cómo se vendió? */}
            {vendidoPaso === 'tipo' && (
              <>
                <h3 className="text-lg font-bold mb-2">¿Cómo se vendió?</h3>
                <p className="text-sm text-gray-500 mb-6">Esto marca tu anuncio como vendido y ya no aparecerá activo.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (interesados.length > 0) {
                        setVendidoPaso('comprador')
                      } else {
                        marcarVendidoSimple(vendidoModal, 'plataforma')
                      }
                    }}
                    className="w-full text-left p-4 border-2 border-green-200 bg-green-50 rounded-xl hover:bg-green-100 transition"
                  >
                    <p className="font-bold text-green-800">🤝 Vendido en esta plataforma</p>
                    <p className="text-xs text-green-600 mt-1">
                      {interesados.length > 0
                        ? `${interesados.length} persona(s) te contactaron por este producto`
                        : 'No hubo mensajes por este producto'
                      }
                    </p>
                  </button>
                  <button
                    onClick={() => marcarVendidoSimple(vendidoModal, 'otra_pagina')}
                    className="w-full text-left p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
                  >
                    <p className="font-bold text-blue-800">🌐 Vendido en otro lugar</p>
                    <p className="text-xs text-blue-600 mt-1">Facebook, WhatsApp, en persona, etc.</p>
                  </button>
                  <button
                    onClick={() => marcarVendidoSimple(vendidoModal, 'no_especificado')}
                    className="w-full text-left p-4 border-2 border-gray-200 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <p className="font-bold text-gray-700">🤫 Prefiero no decir</p>
                    <p className="text-xs text-gray-500 mt-1">Solo marca el anuncio como vendido</p>
                  </button>
                </div>
              </>
            )}

            {/* PASO 2: ¿A quién le vendiste? */}
            {vendidoPaso === 'comprador' && (
              <>
                <h3 className="text-lg font-bold mb-2">¿A quién le vendiste?</h3>
                <p className="text-sm text-gray-500 mb-4">Selecciona a la persona que te contactó por este producto.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cargandoVendidos ? (
                    <p className="text-center text-gray-400 py-8">Cargando...</p>
                  ) : interesados.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">Nadie te contactó por este producto</p>
                  ) : (
                    <>
                      {interesados.map((inter) => (
                        <button
                          key={inter.userId}
                          onClick={() => seleccionarComprador(inter)}
                          className="w-full text-left p-3 border rounded-xl hover:bg-green-50 hover:border-green-200 transition"
                        >
                          <p className="font-semibold text-gray-900">{inter.nombre}</p>
                          {inter.ultimoMensaje && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">"{inter.ultimoMensaje}"</p>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setCompradorInfo({ id: '', nombre: '' })
                          setVendidoPaso('reseña')
                        }}
                        className="w-full text-center p-3 text-sm text-gray-500 hover:text-brand-primary hover:underline"
                      >
                        Omitir (no fue ninguno de estos)
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* PASO 3: ¿Quieres dejar reseña al comprador? */}
            {vendidoPaso === 'reseña' && (
              <>
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold">¡Venta registrada!</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    ¿Quieres dejarle una reseña a{' '}
                    <span className="text-brand-primary">
                      {compradorInfo && compradorInfo.nombre ? compradorInfo.nombre : 'este comprador'}
                    </span>
                    ?
                  </p>
                  <div className="flex justify-center mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} onClick={() => setRating(i)} className="hover:scale-110 transition">
                          <Star size={28} className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400">{['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'][rating - 1]}</p>
                </div>
                <textarea
                  value={comentarioResena}
                  onChange={e => setComentarioResena(e.target.value)}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  maxLength={300}
                  placeholder="¿Algo que quieras comentar? (opcional)"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{comentarioResena.length}/300</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={venderSinResena}
                    className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Omitir reseña
                  </button>
                  <button
                    onClick={enviarResena}
                    disabled={enviandoResena}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition disabled:opacity-50"
                  >
                    <Send size={14} /> {enviandoResena ? 'Enviando...' : 'Enviar reseña'}
                  </button>
                </div>
              </>
            )}

            {/* PASO 4: Confirmación */}
            {vendidoPaso === 'confirmado' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">¡Vendido!</h3>
                <p className="text-gray-500 mb-6">Tu anuncio ya está marcado como vendido.</p>
                <button
                  onClick={() => { setVendidoModal(null); window.location.reload() }}
                  className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
