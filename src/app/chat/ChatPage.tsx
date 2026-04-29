'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Avatar from '@/components/Avatar'
import { Send, ArrowLeft, Search, User } from 'lucide-react'

type Conversacion = {
  id: string
  user1_id: string
  user2_id: string
  producto_id: string | null
  ultimo_mensaje: string | null
  ultimo_mensaje_en: string | null
  creado_en: string
  otro_nombre: string
  otro_foto: string | null
  producto_titulo: string | null
  no_leidos: number
}

type Mensaje = {
  id: string
  conversacion_id: string
  remitente_id: string
  destinatario_id: string | null
  contenido: string
  leido: boolean
  creado_en: string
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d`
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

/** Debounce helper */
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }) as T
}

export default function ChatPageClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productoId = searchParams?.get('producto_id')
  const vendedorId = searchParams?.get('vendedor_id')

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [convId, setConvId] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  const mensajesEndRef = useRef<HTMLDivElement>(null)
  const convLoadedRef = useRef(false)

  // ─── Auth guard ───
  useEffect(() => {
    if (loading) return // esperar a que cargue la sesión
    if (!user) router.push('/login')
  }, [user, loading, router])

  // ─── Scroll al final ───
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // ─── Cargar conversaciones (BATCH, no N+1) ───
  const cargarConversaciones = useCallback(async () => {
    if (!user) return

    const { data: convs } = await supabase
      .from('conversaciones')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('ultimo_mensaje_en', { ascending: false })

    if (!convs || convs.length === 0) {
      setConversaciones([])
      setLoading(false)
      convLoadedRef.current = true
      return []
    }

    // Collect all IDs
    const otroIds = [...new Set(convs.map(c =>
      c.user1_id === user.id ? c.user2_id : c.user1_id
    ))]
    const prodIds = [...new Set(convs.filter(c => c.producto_id).map(c => c.producto_id))]

    // 3 queries en paralelo
    const [perfilesRes, productosRes, unreadRes] = await Promise.all([
      supabase.from('perfiles').select('id, nombre, foto_perfil_url').in('id', otroIds),
      prodIds.length > 0
        ? supabase.from('productos').select('id, titulo').in('id', prodIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from('mensajes')
        .select('conversacion_id')
        .eq('destinatario_id', user.id)
        .eq('leido', false)
        .in('conversacion_id', convs.map(c => c.id)),
    ])

    const perfilMap = new Map<string, { nombre: string; foto: string | null }>()
    perfilesRes.data?.forEach(p => perfilMap.set(p.id, { nombre: p.nombre || 'Usuario', foto: p.foto_perfil_url || null }))

    const prodMap = new Map<string, string>()
    productosRes.data?.forEach(p => prodMap.set(p.id, p.titulo || ''))

    const unreadMap = new Map<string, number>()
    unreadRes.data?.forEach((m: { conversacion_id: string }) => {
      unreadMap.set(m.conversacion_id, (unreadMap.get(m.conversacion_id) || 0) + 1)
    })

    const enriched: Conversacion[] = convs.map(c => {
      const otroId = c.user1_id === user.id ? c.user2_id : c.user1_id
      const p = perfilMap.get(otroId)
      return {
        ...c,
        otro_nombre: p?.nombre || 'Usuario',
        otro_foto: p?.foto || null,
        producto_titulo: c.producto_id ? (prodMap.get(c.producto_id) || null) : null,
        no_leidos: unreadMap.get(c.id) || 0,
      }
    })

    setConversaciones(enriched)
    setLoading(false)
    convLoadedRef.current = true
    return enriched
  }, [user])

  useEffect(() => { cargarConversaciones() }, [cargarConversaciones])

  // ─── Realtime: conversaciones (debounced para evitar spam) ───
  useEffect(() => {
    if (!user) return
    const debounced = debounce(() => cargarConversaciones(), 500)
    const sub = supabase
      .channel('conv-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversaciones' }, () => debounced())
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [user, cargarConversaciones])

  // ─── Realtime: mensajes de la conversación actual ───
  useEffect(() => {
    if (!convId || !user) return
    const userId = user.id
    const sub = supabase
      .channel(`msg-rt-${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `conversacion_id=eq.${convId}` },
        (payload) => {
          const nuevo = payload.new as Mensaje
          // Si es de otro usuario, aparece; si es mio, reemplaza el temp si existe
          setMensajes(prev => {
            const yaExiste = prev.some(m => m.id === nuevo.id)
            if (yaExiste) return prev
            // Si viene de otro usuario
            if (nuevo.remitente_id !== userId) {
              // Marcar como leido
              supabase.from('mensajes').update({ leido: true }).eq('id', nuevo.id)
              // Sidebar refresh
              cargarConversaciones()
              return [...prev, nuevo]
            }
            // Es mio → reemplazar temp
            const sinTemp = prev.filter(m => !m.id.startsWith('t-'))
            return [...sinTemp, nuevo]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [convId, cargarConversaciones])

  // ─── Auto-iniciar conv desde URL (producto → escribir al vendedor) ───
  useEffect(() => {
    if (!user || !productoId || !vendedorId || vendedorId === user.id) return
    // Esperar a que convLoadedRef esté true
    if (!convLoadedRef.current) return

    const ya = conversaciones.find(c =>
      c.producto_id === productoId &&
      (
        (c.user1_id === user.id && c.user2_id === vendedorId) ||
        (c.user1_id === vendedorId && c.user2_id === user.id)
      )
    )
    if (ya) {
      setConvId(ya.id)
      setShowMobileChat(true)
      cargarMensajes(ya.id)
      return
    }

    // No existe → crear
    const crear = async () => {
      const { data } = await supabase
        .from('conversaciones')
        .insert({ user1_id: user.id, user2_id: vendedorId, producto_id: productoId })
        .select()
        .single()
      if (data) {
        setConvId(data.id)
        setShowMobileChat(true)
        await cargarConversaciones()
        cargarMensajes(data.id)
      }
    }
    crear()
  }, [user, productoId, vendedorId, conversaciones])

  // ─── Cargar mensajes ───
  const cargarMensajes = useCallback(async (id: string) => {
    if (!user) return
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', id)
      .order('creado_en', { ascending: true })

    if (data) {
      setMensajes(data)
      // Marcar leidos
      const noLeidos = data.filter(m => m.remitente_id !== user.id && !m.leido)
      if (noLeidos.length > 0) {
        supabase
          .from('mensajes')
          .update({ leido: true })
          .in('id', noLeidos.map(m => m.id))
      }
    }
  }, [user])

  // ─── Seleccionar conversacion ───
  const seleccionarConv = async (id: string) => {
    setConvId(id)
    setShowMobileChat(true)
    await cargarMensajes(id)
  }

  // ─── Enviar mensaje ───
  const enviarMensaje = async () => {
    if (!texto.trim() || !convId || !user || enviando) return
    setEnviando(true)

    const contenido = texto.trim()
    const conv = conversaciones.find(c => c.id === convId)
    if (!conv) { setEnviando(false); return }

    const destinatarioId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id

    // Optimistic: aparece inmediatamente
    const tempMsg: Mensaje = {
      id: `t-${Date.now()}`,
      conversacion_id: convId,
      remitente_id: user.id,
      destinatario_id: destinatarioId,
      contenido,
      leido: true,
      creado_en: new Date().toISOString(),
    }
    setMensajes(prev => [...prev, tempMsg])
    setTexto('')

    const { error } = await supabase.from('mensajes').insert({
      conversacion_id: convId,
      remitente_id: user.id,
      destinatario_id: destinatarioId,
      contenido,
    })

    if (error) {
      // Rollback el mensaje temp
      setMensajes(prev => prev.filter(m => m.id !== tempMsg.id))
      console.error('Error enviando mensaje:', error)
    } else {
      // Refresh sidebar para actualizar ultimo_mensaje
      setConversaciones(prev => prev.map(c =>
        c.id === convId ? { ...c, ultimo_mensaje: contenido, ultimo_mensaje_en: new Date().toISOString() } : c
      ))
    }

    setEnviando(false)
  }

  // ─── Render ───
  if (!user) return null

  const filtradas = conversaciones.filter(c =>
    c.otro_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.producto_titulo?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
  )

  const convActual = conversaciones.find(c => c.id === convId)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💬 Mensajes</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* ─── Sidebar ─── */}
          <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100`}>
            <div className="p-3 border-b">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar conversacion..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-brand-yellow outline-none transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <User size={48} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No hay conversaciones</p>
                  <p className="text-sm text-gray-400 mt-1">Envia un mensaje a un vendedor</p>
                </div>
              ) : (
                filtradas.map(c => (
                  <button
                    key={c.id}
                    onClick={() => seleccionarConv(c.id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 transition text-left ${convId === c.id ? 'bg-blue-50 border-l-2 border-l-brand-blue' : ''}`}
                  >
                    <Avatar nombre={c.otro_nombre} fotoUrl={c.otro_foto} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800 text-sm truncate">{c.otro_nombre}</p>
                        {c.ultimo_mensaje_en && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(c.ultimo_mensaje_en)}</span>
                        )}
                      </div>
                      {c.producto_titulo && (
                        <p className="text-xs text-brand-blue truncate">{c.producto_titulo}</p>
                      )}
                      <p className="text-sm text-gray-500 truncate mt-0.5">{c.ultimo_mensaje || 'Sin mensajes'}</p>
                    </div>
                    {c.no_leidos > 0 && (
                      <span className="bg-brand-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{c.no_leidos}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ─── Chat area ─── */}
          <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {!convId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-medium">Selecciona una conversacion</p>
                <p className="text-sm mt-1">O escribe a un vendedor desde un producto</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b bg-white">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <Avatar nombre={convActual?.otro_nombre || ''} fotoUrl={convActual?.otro_foto} size="sm" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{convActual?.otro_nombre}</p>
                    {convActual?.producto_titulo && (
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{convActual.producto_titulo}</p>
                    )}
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {mensajes.map(m => {
                    const esMio = m.remitente_id === user?.id
                    return (
                      <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          esMio
                            ? 'bg-brand-blue text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}>
                          <p className="text-sm break-words">{m.contenido}</p>
                          <p className={`text-[10px] mt-1 ${esMio ? 'text-blue-200' : 'text-gray-400'}`}>
                            {formatHora(m.creado_en)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={mensajesEndRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 p-3 border-t bg-white">
                  <input
                    type="text"
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        enviarMensaje()
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-yellow transition"
                    disabled={enviando}
                  />
                  <button
                    onClick={enviarMensaje}
                    disabled={!texto.trim() || enviando}
                    className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
