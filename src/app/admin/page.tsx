'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  Check, X, CreditCard, Eye, ExternalLink, Loader2, RefreshCw,
  Shield, Users, BarChart3, Megaphone, Settings, Tag, Download,
  Package, Star, Zap, Pause, Play, Trash2, ChevronDown, ChevronUp,
  PlusCircle,
  Search, ShieldCheck
} from 'lucide-react'
import VerificacionTab from './VerificacionTab'
import MetricasTab from './MetricasTab'

// ← TU EMAIL
const ADMIN_EMAILS = ['gtrespana@gmail.com']

const TABS = [
  { id: 'transacciones', label: 'Transacciones', icon: CreditCard },
  { id: 'publicaciones', label: 'Publicaciones', icon: Shield },
  { id: 'moderacion', label: 'Moderación', icon: Shield },
  { id: 'verificacion', label: 'Verificacion', icon: ShieldCheck },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'anuncios', label: 'Anuncios', icon: Megaphone },
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'exportar', label: 'Exportar', icon: Download },
  { id: 'creditos', label: 'Créditos', icon: PlusCircle },
  { id: 'metricas', label: 'Métricas', icon: BarChart3 },
] as const

// ============================ MODERACIÓN TAB ============================
function ModeracionTab({ notify }: { notify: (msg: string) => void }) {
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [productosPendientes, setProductosPendientes] = useState<any[]>([])
  const [tabM, setTabM] = useState<'denuncias' | 'pendientes'>('denuncias')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const [{ data: denies }, { data: pends }] = await Promise.all([
      supabase
        .from('denuncias')
        .select(`*, producto:productos(titulo, user_id, precio_usd, imagen_url), reportante:perfiles!denuncias_reportante_id_fkey(nombre)`)
        .eq('estado', 'activa')
        .order('creada_en', { ascending: false }),
      supabase
        .from('productos')
        .select('*')
        .eq('estado_moderacion', 'pendiente')
        .order('creado_en', { ascending: false }),
    ])
    setDenuncias(denies || [])
    setProductosPendientes(pends || [])
    setCargando(false)
  }

  async function invalidarDenuncia(id: string) {
    const { error } = await supabase.from('denuncias').update({ estado: 'invalidada' }).eq('id', id)
    if (error) notify('Error: ' + error.message)
    else { notify('Denuncia invalidada'); cargar() }
  }

  async function aprobarDenuncia(id: string, productoId: string) {
    await supabase.from('denuncias').update({ estado: 'resuelta' }).eq('id', id)
    await supabase.from('productos').update({ estado_moderacion: 'rechazado', motivo_moderacion: 'Bloqueado por admin', activo: false }).eq('id', productoId)
    notify('Producto bloqueado'); cargar()
  }

  async function aprobarProducto(id: string) {
    const { error } = await supabase.from('productos').update({ estado_moderacion: 'aprobado', motivo_moderacion: null }).eq('id', id)
    if (error) notify('Error: ' + error.message)
    else { notify('Producto aprobado'); cargar() }
  }

  async function rechazarProducto(id: string) {
    const { error } = await supabase.from('productos').update({ estado_moderacion: 'rechazado', motivo_moderacion: 'Bloqueado por admin', activo: false }).eq('id', id)
    if (error) notify('Error: ' + error.message)
    else { notify('Producto rechazado'); cargar() }
  }

  if (cargando) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-blue" /></div>

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setTabM('denuncias')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tabM === 'denuncias' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          🚨 Denuncias ({denuncias.length})
        </button>
        <button onClick={() => setTabM('pendientes')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tabM === 'pendientes' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          ⏳ Pendientes ({productosPendientes.length})
        </button>
      </div>

      {tabM === 'denuncias' && (
        <div className="bg-white rounded-xl border border-gray-100">
          {denuncias.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-medium">Sin denuncias activas</p>
            </div>
          ) : (
            <div className="divide-y">
              {denuncias.map(d => (
                <div key={d.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{d.producto?.titulo || 'N/A'}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{d.motivo}</span>
                        <span className="text-xs text-gray-400">{new Date(d.creada_en).toLocaleDateString('es-ES')} — {d.reportante?.nombre || 'Desconocido'}</span>
                      </div>
                      {d.descripcion && <p className="text-xs text-gray-500 mt-1">{d.descripcion}</p>}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { window.open(`/producto/${d.producto_id}`, '_blank') }} className="text-xs px-2 py-1 border rounded hover:bg-gray-100">Ver</button>
                      <button onClick={() => invalidarDenuncia(d.id)} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Ignorar</button>
                      <button onClick={() => aprobarDenuncia(d.id, d.producto_id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Bloquear</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tabM === 'pendientes' && (
        <div className="bg-white rounded-xl border border-gray-100">
          {productosPendientes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-medium">Sin productos pendientes</p>
            </div>
          ) : (
            <div className="divide-y">
              {productosPendientes.map(p => (
                <div key={p.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {p.imagen_url ? <img src={p.imagen_url} alt="" className="w-16 h-16 rounded-lg object-cover" loading="lazy" decoding="async" /> : null}
                      <div>
                        <p className="font-semibold">{p.titulo}</p>
                        {p.precio_usd && <p className="text-brand-blue font-bold">${Number(p.precio_usd).toLocaleString()}</p>}
                        {p.motivo_moderacion && <p className="text-xs text-orange-600 mt-1">⚠️ {p.motivo_moderacion}</p>}
                        <span className="text-xs text-gray-400">{new Date(p.creado_en).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { window.open(`/producto/${p.id}`, '_blank') }} className="text-xs px-2 py-1 border rounded hover:bg-gray-100">Ver</button>
                      <button onClick={() => aprobarProducto(p.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">Aprobar</button>
                      <button onClick={() => rechazarProducto(p.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Rechazar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('transacciones')
  const [toast, setToast] = useState<string | null>(null)

  // Datos compartidos
  const [perfiles, setPerfiles] = useState<Record<string, any>>({})
  const [cargando, setCargando] = useState(false)

  const isAdmin = ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    if (!session || !user) return
    if (!isAdmin) {
      setToast('No tienes permisos de admin')
      setTimeout(() => router.push('/'), 2000)
      return
    }
    cargarPerfiles()
  }, [user, session, isAdmin])

  async function cargarPerfiles() {
    const { data } = await supabase.from('perfiles').select('id, nombre, telefono')
    if (data) {
      const m: Record<string, any> = {}
      data.forEach(p => { m[p.id] = p })
      setPerfiles(m)
    }
  }

  function notify(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  if (!session) return null
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Acceso denegado</h2>
          <p className="text-gray-500">No tienes permisos para esta página.</p>
          <button onClick={() => router.push('/')} className="mt-4 text-brand-blue hover:underline">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-xs">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-yellow p-3 rounded-xl">
            <Shield size={24} className="text-brand-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Admin Panel</h1>
            <p className="text-gray-500">Control total de VendeT-Venezuela</p>
          </div>
        </div>
        <Link href="/" className="text-sm text-brand-blue hover:underline">
          ← Volver al sitio
        </Link>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 overflow-x-auto pb-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === t.id
                ? 'bg-brand-blue text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      {tab === 'transacciones' && <TabTransacciones perfiles={perfiles} notify={notify} />}
      {tab === 'publicaciones' && <TabPublicaciones perfiles={perfiles} notify={notify} />}
      {tab === 'moderacion' && <ModeracionTab notify={notify} />}
      {tab === 'verificacion' && <VerificacionTab notify={notify} />}
      {tab === 'usuarios' && <TabUsuarios perfiles={perfiles} notify={notify} />}
      {tab === 'dashboard' && <TabDashboard perfiles={perfiles} />}
      {tab === 'anuncios' && <TabAnuncios notify={notify} />}
      {tab === 'categorias' && <TabCategorias notify={notify} />}
      {tab === 'creditos' && <TabCreditos perfiles={perfiles} notify={notify} />}
      {tab === 'exportar' && <TabExportar />}
      {tab === 'metricas' && <MetricasTab />}
    </div>
  )
}

// ============================================================
// TAB: TRANSACCIONES
// ============================================================
function TabTransacciones({ perfiles, notify }: { perfiles: Record<string, any>; notify: (m: string) => void }) {
  const [pendientes, setPendientes] = useState<any[]>([])
  const [historial, setHistorial] = useState<any[]>([])
  const [procesando, setProcesando] = useState<string | null>(null)

  async function cargar() {
    const { data: trans } = await supabase
      .from('transacciones_creditos')
      .select('*')
      .eq('tipo', 'compra')
      .order('creado_en', { ascending: false })
      .limit(50)

    if (!trans) return
    setPendientes(trans.filter(t => t.estado === 'pendiente'))
    setHistorial(trans.filter(t => t.estado !== 'pendiente'))
  }

  useEffect(() => { cargar() }, [])

  async function aprobar(id: string, monto: number, usuarioNombre: string) {
    setProcesando(id)
    const { error } = await supabase.rpc('aprobar_transaccion', { p_transaccion_id: id, p_admin_id: (await supabase.auth.getUser()).data.user?.id })
    setProcesando(null)
    if (error) {
      notify(`Error: ${error.message}`)
    } else {
      notify(`✅ +${monto} créditos aprobados!`)
      // Notificar admin por Telegram
      const mensaje = `✅ VendeT-Venezuela\n\nSe aprobaron ${monto} créditos para ${usuarioNombre}.\nTransacción procesada correctamente.`
      try { await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensaje }) }) } catch {}
      await cargar()
    }
  }

  async function rechazar(id: string) {
    setProcesando(id)
    await supabase.from('transacciones_creditos').update({ estado: 'rechazado' }).eq('id', id)
    setProcesando(null)
    notify('Transacción rechazada')
    await cargar()
  }

  return (
    <div className="space-y-6">
      {/* Pendientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🔴 Pendientes
            <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">{pendientes.length}</span>
          </h2>
          <button onClick={cargar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Refrescar"><RefreshCw size={16} /></button>
        </div>

        {pendientes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">No hay transacciones pendientes 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map((t) => {
              const perfil = perfiles[t.user_id] || {}
              return (
                <div key={t.id} className="bg-white rounded-xl border-2 border-yellow-200 p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-brand-blue">+{t.monto} créditos</span>
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">PENDIENTE</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>👤 <strong>{perfil.nombre || 'Sin nombre'}</strong></p>
                        {perfil.telefono && <p>📱 {perfil.telefono}</p>}
                        <p>💳 Método: <strong>{t.metodo_pago}</strong></p>
                        <p>📅 {new Date(t.creado_en).toLocaleString('es-VE')}</p>
                      </div>
                      {t.comprobante_url && (
                        <a href={t.comprobante_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
                          <Eye size={14} /> Ver comprobante <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => aprobar(t.id, t.monto, perfil.nombre || 'Usuario')} disabled={procesando === t.id} className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50">
                        {procesando === t.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Aprobar
                      </button>
                      <button onClick={() => rechazar(t.id)} disabled={procesando === t.id} className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50">
                        <X size={16} /> Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Historial */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Historial</h2>
        {historial.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">Sin transacciones aún</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-bold">Usuario</th>
                  <th className="text-left py-3 px-4 font-bold">Método</th>
                  <th className="text-center py-3 px-4 font-bold">Créditos</th>
                  <th className="text-center py-3 px-4 font-bold">Estado</th>
                  <th className="text-center py-3 px-4 font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((t) => {
                  const perfil = perfiles[t.user_id] || {}
                  return (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">{perfil.nombre || '...'}</td>
                      <td className="py-3 px-4">{t.metodo_pago || '—'}</td>
                      <td className="py-3 px-4 text-center font-bold text-brand-blue">+{t.monto}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.estado === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">{new Date(t.creado_en).toLocaleDateString('es-VE')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// TAB: MODERACIÓN DE PUBLICACIONES
// ============================================================
function TabPublicaciones({ perfiles, notify }: { perfiles: Record<string, any>; notify: (m: string) => void }) {
  const [publicaciones, setPublicaciones] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(200)
      if (data) setPublicaciones(data)
      setCargando(false)
    }
    load()
  }, [])

  async function toggleActivo(id: string, activo: boolean) {
    setProcesando(id)
    const { error } = await supabase.from('productos').update({ activo }).eq('id', id)
    setProcesando(null)
    if (!error) {
      notify(activo ? '✅ Publicación activada' : '⏸️ Publicación pausada')
      setPublicaciones(prev => prev.map(p => p.id === id ? { ...p, activo } : p))
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta publicación permanentemente?')) return
    setProcesando(id)
    await supabase.from('productos').delete().eq('id', id)
    setProcesando(null)
    notify('🗑️ Publicación eliminada')
    setPublicaciones(prev => prev.filter(p => p.id !== id))
  }

  async function toggleDestacado(id: string, destacado: boolean) {
    setProcesando(id)
    const update: any = { destacado }
    if (destacado) update.destacado_hasta = new Date(Date.now() + 48 * 3600000).toISOString() // 48h
    await supabase.from('productos').update(update).eq('id', id)
    setProcesando(null)
    setPublicaciones(prev => prev.map(p => p.id === id ? { ...p, ...update } : p))
  }

  const filtradas = busqueda
    ? publicaciones.filter(p =>
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.user_id && (perfiles[p.user_id]?.nombre || '').toLowerCase().includes(busqueda.toLowerCase()))
      )
    : publicaciones

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título o usuario..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white"
          />
        </div>
        <button onClick={() => { setCargando(true); setPublicaciones([]); setTimeout(async () => {
          const { data } = await supabase.from('productos').select('*').order('creado_en', { ascending: false }).limit(200)
          if (data) setPublicaciones(data); setCargando(false)
        }, 100) }} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50" title="Refrescar">
          <RefreshCw size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-500">{filtradas.length} publicaciones {busqueda && `(filtradas)`}</p>

      {cargando ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((p) => {
            const perfil = perfiles[p.user_id] || {}
            return (
              <div key={p.id} className={`bg-white rounded-xl border p-4 transition ${!p.activo ? 'opacity-50 border-gray-200' : 'border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Miniatura */}
                  <Link href={`/producto/${p.id}`} className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/producto/${p.id}`} className="font-semibold text-gray-800 hover:text-brand-blue truncate">
                        {p.titulo}
                      </Link>
                      {p.destacado && p.destacado_hasta > new Date().toISOString() && (
                        <span className="text-[10px] bg-brand-yellow/20 text-brand-blue px-2 py-0.5 rounded-full">⭐ Destacado</span>
                      )}
                      {p.boosteado_en && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">⚡ Boosted</span>
                      )}
                      {!p.activo && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Pausado</span>}
                    </div>
                    <p className="text-sm text-gray-500">${Number(p.precio_usd || 0).toLocaleString()} · {p.ubicacion_ciudad || 'Venezuela'}</p>
                    <p className="text-xs text-gray-400">👤 {perfil.nombre || 'Anónimo'} · 👀 {p.visitas || 0} vistas · {new Date(p.creado_en).toLocaleDateString('es-VE')}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => toggleActivo(p.id, !p.activo)} disabled={procesando === p.id} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title={p.activo ? 'Pausar' : 'Activar'}>
                      {p.activo ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={() => toggleDestacado(p.id, !p.destacado)} disabled={procesando === p.id} className={`p-2 rounded-lg transition ${p.destacado ? 'bg-brand-yellow/20 text-brand-yellow' : 'hover:bg-gray-100 text-yellow-500'}`} title={p.destacado ? 'Quitar destacado' : 'Destacar 48h'}>
                      <Star size={16} />
                    </button>
                    <button onClick={() => eliminar(p.id)} disabled={procesando === p.id} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtradas.length === 0 && (
            <div className="text-center py-12 text-gray-400">No hay publicaciones</div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// TAB: USUARIOS
// ============================================================
function TabUsuarios({ perfiles, notify }: { perfiles: Record<string, any>; notify: (m: string) => void }) {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(500)
      if (data) setUsuarios(data)
      setCargando(false)
    }
    load()
  }, [])

  const filtrados = busqueda
    ? usuarios.filter(u =>
        (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.telefono || '').includes(busqueda) ||
        (u.ciudad || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.estado || '').toLowerCase().includes(busqueda.toLowerCase())
      )
    : usuarios

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono, ciudad..."
          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white"
        />
      </div>

      {cargando ? (
        <div className="text-center py-12 text-gray-400">Cargando usuarios...</div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{filtrados.length} usuarios registrados</p>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold">Nombre</th>
                    <th className="text-left py-3 px-4 font-bold hidden sm:table-cell">Teléfono</th>
                    <th className="text-left py-3 px-4 font-bold hidden md:table-cell">Ubicación</th>
                    <th className="text-center py-3 px-4 font-bold">Créditos</th>
                    <th className="text-center py-3 px-4 font-bold hidden sm:table-cell">Fecha registro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.slice(0, 100).map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{u.nombre || 'Sin nombre'}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">{u.telefono || '—'}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{u.ciudad && u.estado ? `${u.ciudad}, ${u.estado}` : '—'}</td>
                      <td className="py-3 px-4 text-center font-bold text-brand-blue">{u.credito_balance || 0}</td>
                      <td className="py-3 px-4 text-center text-gray-500 hidden sm:table-cell">{new Date(u.creado_en).toLocaleDateString('es-VE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================
// TAB: DASHBOARD (estadísticas)
// ============================================================
function TabDashboard({ perfiles }: { perfiles: Record<string, any> }) {
  const [stats, setStats] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function load() {
      // Total usuarios
      const { count: totalUsuarios } = await supabase.from('perfiles').select('*', { count: 'exact' })
      // Total productos
      const { count: totalProductos } = await supabase.from('productos').select('*', { count: 'exact' })
      const { count: productosActivos } = await supabase.from('productos').select('*', { count: 'exact' }).eq('activo', true)
      // Transacciones
      const { data: transacciones } = await supabase.from('transacciones_creditos').select('monto, estado, tipo, creado_en')
      const ingresos = transacciones?.filter(t => t.estado === 'aprobado' && t.tipo === 'compra').reduce((s, t) => s + t.monto, 0) || 0
      const creditosVendidos = transacciones?.filter(t => t.estado === 'aprobado' && t.tipo === 'compra').reduce((s, t) => s + t.monto, 0) || 0
      // Hoy
      const hoy = new Date().toISOString().split('T')[0]
      const nuevosHoy = transacciones?.filter(t => t.creado_en?.startsWith(hoy) && t.estado === 'aprobado') || []

      setStats({
        totalUsuarios,
        totalProductos,
        productosActivos,
        creditosVendidos,
        ingresosUSD: new Intl.NumberFormat('en-US').format(ingresos),
        nuevosHoy: nuevosHoy.length,
      })
      setCargando(false)
    }
    load()
  }, [])

  if (cargando) return <div className="text-center py-12 text-gray-400">Cargando estadísticas...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios', value: stats.totalUsuarios, icon: Users, color: 'bg-blue-50 text-brand-blue' },
          { label: 'Publicaciones', value: stats.productosActivos, icon: Package, color: 'bg-green-50 text-green-700' },
          { label: 'Créditos vendidos', value: stats.creditosVendidos, icon: CreditCard, color: 'bg-yellow-50 text-brand-yellow' },
          { label: 'Ingresos (est.)', value: `$${stats.ingresosUSD}`, icon: BarChart3, color: 'bg-purple-50 text-purple-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon size={20} /></div>
              <div>
                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Productos pausados/inactivos</p>
          <p className="text-3xl font-black text-gray-400">{stats.totalProductos - stats.productosActivos}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Ventas hoy</p>
          <p className="text-3xl font-black text-green-500">{stats.nuevosHoy} transacciones</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TAB: ANUNCIOS GLOBALES
// ============================================================
function TabAnuncios({ notify }: { notify: (m: string) => void }) {
  const [anuncio, setAnuncio] = useState('')

  const anunciosGuardados = [
    { texto: '🎉 ¡Nuevo! Ahora puedes destacar tus publicaciones con créditos', fecha: new Date().toLocaleDateString('es-VE') },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Megaphone size={20} /> Publicar anuncio global
        </h3>
        <p className="text-sm text-gray-500 mb-4">Añade un mensaje que aparecerá en la página principal (banner informativo).</p>
        <textarea
          value={anuncio}
          onChange={e => setAnuncio(e.target.value)}
          placeholder="Escribe tu anuncio..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm min-h-[100px] resize-y bg-white"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { if (anuncio.trim()) { notify('✅ Anuncio publicado! (falta conectar con la web)'); setAnuncio('') } }}
            className="bg-brand-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition"
          >
            Publicar anuncio
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">📢 Anuncios anteriores</h3>
        {anunciosGuardados.map((a, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3">
            <p className="text-sm text-gray-800">{a.texto}</p>
            <p className="text-xs text-gray-400 mt-1">{a.fecha}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// TAB: CATEGORÍAS
// ============================================================
function TabCategorias({ notify }: { notify: (m: string) => void }) {
  const [categorias, setCategorias] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [nuevaCat, setNuevaCat] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('categorias').select('*').order('id')
      if (data) setCategorias(data)
      setCargando(false)
    }
    load()
  }, [])

  async function agregarCategoria() {
    if (!nuevaCat.trim()) return
    await supabase.from('categorias').insert([{ nombre: nuevaCat.trim().toLowerCase() }])
    notify('✅ Categoría añadida')
    setNuevaCat('')
    const { data } = await supabase.from('categorias').select('*').order('id')
    if (data) setCategorias(data)
  }

  if (cargando) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4"><Tag size={20} className="inline mr-2" />Categorías actuales ({categorias.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {categorias.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="font-bold text-gray-800 capitalize">{c.nombre}</p>
              <p className="text-xs text-gray-400">ID: {c.id}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaCat}
            onChange={e => setNuevaCat(e.target.value)}
            placeholder="Nombre de nueva categoría"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
            onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
          />
          <button onClick={agregarCategoria} className="bg-brand-blue text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition">
            Añadir
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TAB: EXPORTAR
// ============================================================
function TabExportar() {
  const [exportando, setExportando] = useState(false)

  async function exportarProductos() {
    setExportando(true)
    const { data } = await supabase.from('productos').select('*')
    if (!data) { setExportando(false); return }

    const headers = ['id', 'titulo', 'precio_usd', 'estado', 'categoria_id', 'subcategoria', 'marca', 'ubicacion_ciudad', 'activo', 'visitas', 'creado_en']
    const csv = [headers.join(','), ...data.map(p => headers.map(h => `"${(p as any)[h] || ''}"`).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `productos_vendet_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportando(false)
  }

  async function exportarUsuarios() {
    setExportando(true)
    const { data } = await supabase.from('perfiles').select('*')
    if (!data) { setExportando(false); return }

    const headers = ['id', 'nombre', 'telefono', 'estado', 'ciudad', 'credito_balance', 'creado_en']
    const csv = [headers.join(','), ...data.map(u => headers.map(h => `"${(u as any)[h] || ''}"`).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `usuarios_vendet_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportando(false)
  }

  async function exportarTransacciones() {
    setExportando(true)
    const { data } = await supabase.from('transacciones_creditos').select('*')
    if (!data) { setExportando(false); return }

    const headers = ['id', 'user_id', 'tipo', 'monto', 'metodo_pago', 'estado', 'creado_en']
    const csv = [headers.join(','), ...data.map(t => headers.map(h => `"${(t as any)[h] || ''}"`).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `transacciones_vendet_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportando(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Download size={20} /> Exportar datos a CSV
        </h3>
        <p className="text-sm text-gray-500 mb-6">Descarga toda la información de tu plataforma en formato CSV, compatible con Excel y Google Sheets.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={exportarProductos} disabled={exportando} className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center hover:border-brand-blue transition disabled:opacity-50">
            <Package size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="font-bold text-gray-800">Productos</p>
            <p className="text-xs text-gray-400">Todas las publicaciones</p>
          </button>
          <button onClick={exportarUsuarios} disabled={exportando} className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center hover:border-brand-blue transition disabled:opacity-50">
            <Users size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="font-bold text-gray-800">Usuarios</p>
            <p className="text-xs text-gray-400">Perfiles registrados</p>
          </button>
          <button onClick={exportarTransacciones} disabled={exportando} className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center hover:border-brand-blue transition disabled:opacity-50">
            <CreditCard size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="font-bold text-gray-800">Transacciones</p>
            <p className="text-xs text-gray-400">Pagos y créditos</p>
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TAB: CREDITOS (añadir manualmente)
// ============================================================
function TabCreditos({ perfiles, notify }: { perfiles: Record<string, any>; notify: (m: string) => void }) {
  const [busqueda, setBusqueda] = useState('')
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [usuarioSel, setUsuarioSel] = useState<string>('')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    // Load users and manual credit history in parallel
    const [{ data: userData }, { data: histData }] = await Promise.all([
      supabase.from('perfiles').select('id, nombre, telefono, email, credito_balance, creado_en').order('creado_en', { ascending: false }).limit(500),
      supabase.from('transacciones_creditos').select('*').in('tipo', ['admin_manual', 'bienvenida', 'referido', 'emprendedor']).order('creado_en', { ascending: false }).limit(200),
    ])
    if (userData) setUsuarios(userData)
    if (histData) setHistorial(histData)
  }

  const filtrados = busqueda
    ? usuarios.filter(u =>
        (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.telefono || '').includes(busqueda) ||
        (u.email || '').toLowerCase().includes(busqueda.toLowerCase())
      )
    : usuarios

  async function añadirCreditos() {
    if (!usuarioSel || !cantidad || parseInt(cantidad) < 1) return
    setProcesando(true)

    try {
      // 1. Update perfil credit balance
      const { data: perfilData } = await supabase
        .from('perfiles')
        .select('credito_balance')
        .eq('id', usuarioSel)
        .single()
      
      const nuevoBalance = (perfilData?.credito_balance || 0) + parseInt(cantidad)

      const { error: updateErr } = await supabase
        .from('perfiles')
        .update({ credito_balance: nuevoBalance })
        .eq('id', usuarioSel)

      if (updateErr) throw updateErr

      // 2. Record transaction
      const { error: transErr } = await supabase
        .from('transacciones_creditos')
        .insert({
          user_id: usuarioSel,
          tipo: 'admin_manual',
          monto: parseInt(cantidad),
          estado: 'aprobado',
          motivo_registro: motivo || null,
        })

      if (transErr) throw transErr

      // Success
      notify(`✅ +${cantidad} créditos añadidos a ${usuarioSel}`)
      
      // Notify via Telegram
      const perfil = perfiles[usuarioSel] || {}
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensaje: `💰 Creditos Admin\n+${cantidad} créditos añadidos a ${perfil.nombre || 'Usuario'}\nMotivo: ${motivo || 'N/A'}`,
          }),
        })
      } catch {}

      setUsuarioSel('')
      setCantidad('')
      setMotivo('')
      cargar()
    } catch (err: any) {
      notify('❌ Error: ' + (err.message || 'desconocido'))
    }

    setProcesando(false)
  }

  const tipoLabels: Record<string, string> = {
    admin_manual: '🔧 Manual',
    bienvenida: '🎁 Bienvenida',
    referido: '🤝 Referido',
    emprendedor: '💼 Emprendedor',
  }

  return (
    <div className="space-y-6">
      {/* Añadir créditos */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <PlusCircle size={20} className="text-brand-blue" /> Añadir créditos manualmente
        </h3>

        <div className="space-y-4 max-w-lg">
          {/* Buscador de usuarios */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Buscar usuario</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Nombre, email o teléfono..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white"
              />
            </div>

            {/* Resultados */}
            {busqueda && filtrados.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg bg-gray-50">
                {filtrados.slice(0, 10).map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setUsuarioSel(u.id); setBusqueda(u.nombre || u.id) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white border-b last:border-b-0 flex justify-between items-center ${
                      usuarioSel === u.id ? 'bg-blue-50 border-l-2 border-l-brand-blue' : ''
                    }`}
                  >
                    <span className="font-medium truncate">{u.nombre || u.id}</span>
                    <span className="text-xs text-gray-400 ml-2">{u.credito_balance || 0} cr.</span>
                  </button>
                ))}
              </div>
            )}
            {usuarioSel && (
              <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-brand-blue">
                  ✅ {perfiles[usuarioSel]?.nombre || 'Usuario seleccionado'}
                </span>
                <button onClick={() => { setUsuarioSel(''); setBusqueda('') }} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cantidad de créditos</label>
            <input
              type="number"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="Ej: 5"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motivo (opcional)</label>
            <input
              type="text"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: Bonus manual, corrección, regalo..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white"
            />
          </div>

          <button onClick={añadirCreditos} disabled={!usuarioSel || !cantidad || procesando} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            <PlusCircle size={18} />
            {procesando ? 'Añadiendo...' : `Añadir ${cantidad || '?'} créditos`}
          </button>
        </div>
      </div>

      {/* Historial de créditos especiales */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">📋 Historial de créditos especiales</h3>
        {historial.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Sin registros aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-bold">Usuario</th>
                  <th className="text-left py-3 px-4 font-bold">Tipo</th>
                  <th className="text-center py-3 px-4 font-bold">Créditos</th>
                  <th className="text-left py-3 px-4 font-bold hidden sm:table-cell">Motivo</th>
                  <th className="text-center py-3 px-4 font-bold hidden md:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.slice(0, 50).map((t) => {
                  const perfil = perfiles[t.user_id] || {}
                  return (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium truncate max-w-[200px]">{perfil.nombre || t.user_id.slice(0, 8)}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                          {tipoLabels[t.tipo] || t.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-green-600">+{t.monto}</td>
                      <td className="py-3 px-4 hidden sm:table-cell text-gray-500 text-xs">{t.motivo_registro || '—'}</td>
                      <td className="py-3 px-4 hidden md:table-cell text-gray-400 text-xs">{new Date(t.creado_en).toLocaleDateString('es-VE')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
