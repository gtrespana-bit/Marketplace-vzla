'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Avatar from '@/components/Avatar'
import { Send, ArrowLeft, Search, User, AlertCircle, RotateCcw } from 'lucide-react'

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

function deduplicate(convs: Conversacion[]): Conversacion[] {
  // Group by (user_pair, producto_id) — keep the most recent one
  const keyOf = (c: Conversacion) => {
    const sorted = [c.user1_id, c.user2_id].sort().join('|')
    return `${sorted}|${c.producto_id ?? 'null'}`
  }
  const map = new Map<string, Conversacion>()
  for (const c of convs) {
    const k = keyOf(c)
    const existing = map.get(k)
    if (!existing || (c.ultimo_mensaje_en || '') >= (existing.ultimo_mensaje_en || '')) {
      map.set(k, c)
    }
  }
  return Array.from(map.values())
}

export default function ChatPageClient() {
  const { user, loading: authLoading } = useAuth()
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
  const [sendError, setSendError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  const mensajesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const userRef = useRef(user)
  userRef.current = user

  // ─── Auth guard ───
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/login')
  }, [user, authLoading, router])

  // ─── Scroll automático inteligente — SOLO el contenedor del chat ───
  // Scrollea al final solo si el usuario ya estaba cerca del fondo
  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef.current
    if (!el) return
    setTimeout(() => {
      el.scrollTop = el.scrollHeight
    }, 50)
  }, [])

  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight
    }
  }, [mensajes])

  // ─── Cargar conversaciones (una sola vez, no se re-ejecuta) ───
  const loadConversaciones = useCallback(async () => {
    const uid = userRef.current
    if (!uid) return

    const { data: convs, error } = await supabase
      .from('conversaciones')
      .select('*')
      .or(`user1_id.eq.${uid.id},user2_id.eq.${uid.id}`)
      .order('ultimo_mensaje_en', { ascending: false })

    if (error) {
      console.error('Error loading convs:', error)
      setLoading(false)
      return
    }

    if (!convs || convs.length === 0) {
      setConversaciones([])
      setLoading(false)
      return
    }

    const otroIds = [...new Set(convs.map(c => c.user1_id === uid.id ? c.user2_id : c.user1_id))]
    const prodIds = [...new Set(convs.filter(c => c.producto_id).map(c => c.producto_id as string))]

    const [perfilesRes, productosRes, unreadRes] = await Promise.all([
      supabase.from('perfiles').select('id, nombre, foto_perfil_url').in('id', otroIds),
      prodIds.length > 0
        ? supabase.from('productos').select('id, titulo').in('id', prodIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from('mensajes')
        .select('conversacion_id')
        .eq('destinatario_id', uid.id)
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
      const otroId = c.user1_id === uid.id ? c.user2_id : c.user1_id
      const p = perfilMap.get(otroId)
      return {
        ...c,
        otro_nombre: p?.nombre || 'Usuario',
        otro_foto: p?.foto || null,
        producto_titulo: c.producto_id ? (prodMap.get(c.producto_id) || null) : null,
        no_leidos: unreadMap.get(c.id) || 0,
      }
    })

    // Deduplicate in case DB has dups
    const deduped = deduplicate(enriched)
    setConversaciones(deduped)
    setLoading(false)

    // If URL has productoId/vendedorId, try to find or create the conv
    if (productoId && vendedorId && vendedorId !== uid.id) {
      const match = deduped.find(c =>
        c.producto_id === productoId &&
        ((c.user1_id === uid.id && c.user2_id === vendedorId) ||
         (c.user1_id === vendedorId && c.user2_id === uid.id))
      )
      if (match) {
        setConvId(match.id)
        setShowMobileChat(true)
        loadMensajesSilent(match.id)
      } else {
        // No conv exists — create one by sending a placeholder message through the trigger
        const { data: newConv, error: insErr } = await supabase
          .from('conversaciones')
          .insert({
            user1_id: uid.id < vendedorId ? uid.id : vendedorId,
            user2_id: uid.id < vendedorId ? vendedorId : uid.id,
            producto_id: productoId,
          })
          .select()
          .single()

        if (insErr?.code === '23505') {
          // Constraint violation — refetch to get existing
          await loadConversaciones()
          return
        }
        if (newConv) {
          setConvId(newConv.id)
          setShowMobileChat(true)
          const refreshed = deduped.map(c => ({
            ...c,
            otro_nombre: newConv.user1_id === uid.id
              ? (perfilMap.get(newConv.user2_id)?.nombre || 'Usuario')
              : (perfilMap.get(newConv.user1_id)?.nombre || 'Usuario'),
          }))
          setConversaciones([
            {
              id: newConv.id,
              user1_id: newConv.user1_id,
              user2_id: newConv.user2_id,
              producto_id: newConv.producto_id,
              ultimo_mensaje: null,
              ultimo_mensaje_en: new Date().toISOString(),
              creado_en: newConv.creado_en,
              otro_nombre: newConv.user1_id === uid.id
                ? (perfilMap.get(newConv.user2_id)?.nombre || 'Usuario')
                : (perfilMap.get(newConv.user1_id)?.nombre || 'Usuario'),
              otro_foto: null,
              producto_titulo: prodMap.get(productoId) || null,
              no_leidos: 0,
            },
            ...refreshed,
          ])
          loadMensajesSilent(newConv.id)
        }
      }
    }
  }, [])

  // Load once on mount
  useEffect(() => {
    if (authLoading || !user) return
    loadConversaciones()
  }, [user, authLoading, loadConversaciones])

  // ─── Realtime sidebar update ───
  useEffect(() => {
    if (!user) return
    const sub = supabase
      .channel('conv-rt')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversaciones' },
        (payload) => {
          const updated = payload.new as any
          // Enrich and update sidebar
          setConversaciones(prev => {
            // Check if this conv affects current user
            if (updated.user1_id !== user.id && updated.user2_id !== user.id) return prev

            const otherId = updated.user1_id === user.id ? updated.user2_id : updated.user1_id
            // Find existing
            const idx = prev.findIndex(c => c.id === updated.id)
            if (idx >= 0) {
              const newConvs = [...prev]
              newConvs[idx] = { ...newConvs[idx], ultimo_mensaje: updated.ultimo_mensaje, ultimo_mensaje_en: updated.ultimo_mensaje_en }
              // Move to top if updated
              const [item] = newConvs.splice(idx, 1)
              newConvs.unshift(item)
              return newConvs
            }
            return prev
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversaciones' },
        (payload) => {
          const newConv = payload.new as any
          if (newConv.user1_id !== user.id && newConv.user2_id !== user.id) return
          // Add to sidebar without full refetch
          setConversaciones(prev => {
            const exists = prev.some(c => c.id === newConv.id)
            if (exists) return prev
            return [{
              ...newConv,
              otro_nombre: 'Nuevo',
              otro_foto: null,
              producto_titulo: null,
              no_leidos: 0,
            }, ...prev]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [user])

  // ─── Cargar mensajes ───
  const loadMensajesSilent = useCallback(async (id: string) => {
    const uid = userRef.current
    if (!uid) return

    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', id)
      .order('creado_en', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    if (data) {
      setMensajes(data)
      // Mark as read
      const unread = data.filter(m => m.remitente_id !== uid.id && !m.leido)
      if (unread.length > 0) {
        supabase.from('mensajes').update({ leido: true }).in('id', unread.map(m => m.id))
      }
    }
  }, [])

  // ─── Realtime mensajes (canal separado que persiste) ───
  useEffect(() => {
    if (!user) return

    // Subscribe to ALL message inserts for user's conversations
    const sub = supabase
      .channel('all-msg-rt')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        async (payload) => {
          const nuevo = payload.new as Mensaje
          const uid = userRef.current
          if (!uid) return

          // Get the conversation for this message
          const { data: conv } = await supabase
            .from('conversaciones')
            .select('*')
            .eq('id', nuevo.conversacion_id)
            .single()

          if (!conv || (conv.user1_id !== uid.id && conv.user2_id !== uid.id)) return

          // If this is from the other user, mark as read
          if (nuevo.remitente_id !== uid.id) {
            supabase.from('mensajes').update({ leido: true }).eq('id', nuevo.id)
          }

          // If this is for the currently open conversation, add to messages
          if (nuevo.conversacion_id === convId) {
            setMensajes(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === nuevo.id)) return prev
              // If it's our own message, remove any temp messages (optimistic)
              const withoutTemp = nuevo.remitente_id === uid.id
                ? prev.filter(m => !m.id.startsWith('t-'))
                : prev
              return [...withoutTemp, nuevo]
            })
          }

          // Update sidebar
          setConversaciones(prev => {
            const idx = prev.findIndex(c => c.id === nuevo.conversacion_id)
            if (idx < 0) return prev
            const updated = [...prev]
            const item = { ...updated[idx] }
            item.ultimo_mensaje = nuevo.contenido
            item.ultimo_mensaje_en = nuevo.creado_en
            // Increment unread if from other user
            if (nuevo.remitente_id !== uid.id && nuevo.conversacion_id !== convId) {
              item.no_leidos = (item.no_leidos || 0) + 1
            }
            // Move to top
            updated.splice(idx, 1)
            updated.unshift(item)
            return updated
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [convId])

  // ─── Seleccionar conversacion ───
  const seleccionarConv = async (id: string) => {
    // Clear unread
    setConversaciones(prev =>
      prev.map(c => c.id === id ? { ...c, no_leidos: 0 } : c)
    )
    setConvId(id)
    setShowMobileChat(true)
    setSendError(null)
    await loadMensajesSilent(id)
  }

  // ─── Reintentar envio fallido ───
  const retrySend = useCallback(async (contenido: string) => {
    if (!convId || !user || enviando) return
    setSendError(null)
    setEnviando(true)

    const conv = conversaciones.find(c => c.id === convId)
    if (!conv) { setEnviando(false); return }

    const destinatarioId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id

    // Optimistic
    const tempMsg: Mensaje = {
      id: `t-${Date.now()}`,
      conversacion_id: convId,
      remitente_id: user.id,
      destinatario_id: destinatarioId,
      contenido,
      leido: true,
      creado_en: new Date().toISOString(),
    }
    setMensajes(prev => [...prev.filter(m => m.id !== tempMsg.id), tempMsg])
    setTexto('')

    const startTime = Date.now()
    const { data, error } = await supabase
      .from('mensajes')
      .insert({
        conversacion_id: convId,
        remitente_id: user.id,
        destinatario_id: destinatarioId,
        contenido,
      })
      .select()
      .single()

    // Minimum delay so user sees the transition
    const elapsed = Date.now() - startTime
    if (elapsed < 300) await new Promise(r => setTimeout(r, 300 - elapsed))

    if (error) {
      setSendError(error.message)
      setMensajes(prev => prev.filter(m => m.id !== tempMsg.id))
      console.error('Error sending message:', error)
    } else if (data) {
      // Realtime will add the confirmed message, remove temp
      setSendError(null)
    }
    setEnviando(false)
  }, [convId, user, conversaciones, enviando])

  // ─── Enviar mensaje ───
  const enviarMensaje = async () => {
    const msg = texto.trim()
    if (!msg || !convId || !user || enviando) return
    setSendError(null)
    await retrySend(msg)
  }

  // ─── Loading ───
  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">💬 Mensajes</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-12 h-12 border-4 border-brand-yellow border-t-brand-blue rounded-full animate-spin mx-auto mb-3" />
            <p>Cargando mensajes...</p>
          </div>
        </div>
      </div>
    )
  }

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
                  <p className="text-gray-500 font-medium">{conversaciones.length === 0 ? 'No hay conversaciones' : 'Sin resultados'}</p>
                  <p className="text-sm text-gray-400 mt-1">Envia un mensaje a un vendedor desde cualquier producto</p>
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
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {mensajes.map(m => {
                    const esMio = m.remitente_id === user?.id
                    const isTemp = m.id.startsWith('t-')
                    return (
                      <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          esMio
                            ? isTemp
                              ? 'bg-blue-400 text-white rounded-br-sm'
                              : 'bg-brand-blue text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}>
                          <p className="text-sm break-words">{m.contenido}</p>
                          <p className={`text-[10px] mt-1 ${esMio ? 'text-blue-200' : 'text-gray-400'}`}>
                            {isTemp ? 'Enviando...' : formatHora(m.creado_en)}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {/* Error de envio */}
                  {sendError && (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-red-700">
                        <AlertCircle size={16} />
                        <span>Error al enviar</span>
                        <button
                          onClick={() => {
                            // Re-enviar el ultimo mensaje fallido
                            const lastMsg = mensajes[mensajes.length - 1]
                            if (lastMsg && lastMsg.remitente_id === user?.id) {
                              retrySend(lastMsg.contenido)
                            }
                          }}
                          className="ml-2 flex items-center gap-1 text-brand-blue font-medium hover:underline"
                        >
                          <RotateCcw size={14} /> Reintentar
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={mensajesEndRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 p-3 border-t bg-white">
                  <input
                    type="text"
                    value={texto}
                    onChange={e => {
                      setTexto(e.target.value)
                      setSendError(null)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        enviarMensaje()
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand-yellow transition disabled:opacity-50"
                    disabled={enviando}
                  />
                  <button
                    onClick={enviarMensaje}
                    disabled={!texto.trim() || enviando}
                    className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
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
