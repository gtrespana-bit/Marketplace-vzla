'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
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
  producto_titulo: string | null
  no_leidos: number
}

type Mensaje = {
  id: string
  conversacion_id: string
  remitente_id: string
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
  if (diffMin < 60) return `hace ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `hace ${diffD}d`
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productoId = searchParams?.get('producto_id') ?? null
  const vendedorId = searchParams?.get('vendedor_id') ?? null

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [convId, setConvId] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  const mensajesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !session) router.push('/login')
  }, [authLoading, session, router])

  // Scroll al final
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Cargar conversaciones
  const cargarConversaciones = useCallback(async () => {
    if (!user) return
    // Fetch conversaciones where user participates
    const { data: convs, error } = await supabase
      .from('conversaciones')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('ultimo_mensaje_en', { ascending: false })

    if (error || !convs) { setLoading(false); return }

    // For each conv, get other user info and unread count
    const enriched: Conversacion[] = await Promise.all(convs.map(async (c: any) => {
      const otroId = c.user1_id === user.id ? c.user2_id : c.user1_id
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', otroId)
        .single()

      let prodTitulo: string | null = null
      if (c.producto_id) {
        const { data: prod } = await supabase
          .from('productos')
          .select('titulo')
          .eq('id', c.producto_id)
          .single()
        prodTitulo = prod?.titulo ?? null
      }

      const { count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('conversacion_id', c.id)
        .eq('destinatario_id', user.id)
        .eq('leido', false)

      return {
        ...c,
        otro_nombre: perfil?.nombre ?? 'Usuario',
        producto_titulo: prodTitulo,
        no_leidos: count ?? 0,
      }
    }))

    setConversaciones(enriched)
    setLoading(false)
  }, [user])

  // Auto-select conv from URL params
  useEffect(() => {
    if (!user || !productoId || !vendedorId) return
    const existing = conversaciones.find(c =>
      c.producto_id === productoId &&
      (c.user1_id === vendedorId || c.user2_id === vendedorId)
    )
    if (existing) {
      setConvId(existing.id)
      setShowMobileChat(true)
    }
  }, [user, productoId, vendedorId, conversaciones])

  // Cargar conversaciones
  useEffect(() => { cargarConversaciones() }, [cargarConversaciones])

  // Realtime conversaciones
  useEffect(() => {
    if (!user) return
    const subConv = supabase
      .channel('conv-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversaciones' }, () => {
        cargarConversaciones()
      })
      .subscribe()
    return () => { supabase.removeChannel(subConv) }
  }, [user, cargarConversaciones])

  // Cargar mensajes de una conversacion
  const cargarMensajes = useCallback(async (id: string) => {
    if (!user) return
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', id)
      .order('creado_en', { ascending: true })

    if (!error && data) {
      setMensajes(data)
      // Marcar como leidos
      const noLeidos = data.filter(m => m.destinatario_id === user.id && !m.leido)
      if (noLeidos.length > 0) {
        await supabase
          .from('mensajes')
          .update({ leido: true })
          .in('id', noLeidos.map(m => m.id))
      }
    }
  }, [user])

  // Seleccionar conversacion
  const seleccionarConv = async (id: string) => {
    setConvId(id)
    setShowMobileChat(true)
    await cargarMensajes(id)
  }

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!texto.trim() || !convId || !user) return
    setEnviando(true)

    // Get destinatario from conversacion
    const conv = conversaciones.find(c => c.id === convId)
    if (!conv) return

    const destinatarioId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id

    const { error } = await supabase.from('mensajes').insert({
      conversacion_id: convId,
      remitente_id: user.id,
      destinatario_id: destinatarioId,
      producto_id: conv.producto_id,
      contenido: texto.trim(),
    })

    if (!error) {
      setTexto('')
      // Mensaje se recarga via realtime
    }
    setEnviando(false)
  }

  // Realtime mensajes
  useEffect(() => {
    if (!convId) return
    const sub = supabase
      .channel(`msg-${convId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `conversacion_id=eq.${convId}` }, (payload) => {
        const nuevo = payload.new as Mensaje
        setMensajes(prev => [...prev, nuevo])
        cargarConversaciones() // refresh unread counts
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [convId, cargarConversaciones])

  // Nueva conversacion desde producto
  useEffect(() => {
    if (!user || !productoId || !vendedorId || vendedorId === user.id) return
    const yaExiste = conversaciones.some(c =>
      c.producto_id === productoId &&
      ((c.user1_id === vendedorId || c.user2_id === vendedorId))
    )
    if (!yaExiste) {
      // Start new conversation
      const startConv = async () => {
        const { data: newConv, error } = await supabase
          .from('conversaciones')
          .insert({
            user1_id: user.id,
            user2_id: vendedorId,
            producto_id: productoId,
          })
          .select()
          .single()

        if (newConv) {
          await cargarConversaciones()
          setConvId(newConv.id)
          setShowMobileChat(true)
        }
      }
      startConv()
    }
  }, [user, productoId, vendedorId, conversaciones])

  if (authLoading || !session) return null

  const convsFiltradas = conversaciones.filter(c =>
    c.otro_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.producto_titulo?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
  )

  const convActual = conversaciones.find(c => c.id === convId)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="bg-white rounded-2xl border h-[600px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💬 Mensajes</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Lista de conversaciones */}
          <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100`}>
            <div className="p-3 border-b">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-brand-yellow outline-none transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <User size={48} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No hay conversaciones</p>
                  <p className="text-sm text-gray-400 mt-1">Escribe a un vendedor para iniciar una conversacion</p>
                </div>
              ) : (
                convsFiltradas.map(c => (
                  <button
                    key={c.id}
                    onClick={() => seleccionarConv(c.id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 transition text-left ${convId === c.id ? 'bg-blue-50 border-l-2 border-l-brand-blue' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex-shrink-0 flex items-center justify-center font-bold text-lg">
                      {c.otro_nombre.charAt(0).toUpperCase()}
                    </div>
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

          {/* Area de mensajes */}
          <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {!convId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="font-medium">Selecciona una conversacion</p>
                <p className="text-sm mt-1">O escribe a un vendedor desde un producto</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b bg-white">
                  <button onClick={() => setShowMobileChat(false)} className="md:hidden p-1 hover:bg-gray-100 rounded">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                    {convActual?.otro_nombre.charAt(0).toUpperCase()}
                  </div>
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
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${esMio ? 'bg-brand-blue text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                          <p className="text-sm break-words">{m.contenido}</p>
                          <p className={`text-[10px] mt-1 ${esMio ? 'text-blue-200' : 'text-gray-400'}`}>{formatHora(m.creado_en)}</p>
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
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() } }}
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
