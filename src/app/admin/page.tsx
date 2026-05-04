'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  CreditCard, Shield, Users, BarChart3, ShieldCheck,
  Package, Star, Pause, Play, Trash2, Search, RefreshCw,
  SortAsc, SortDesc, ExternalLink, Zap, ChevronDown,
  Megaphone, Download, Eye
} from 'lucide-react'
import VerificacionTab from './VerificacionTab'

// ← TU EMAIL
const ADMIN_EMAILS = ['gtrespana@gmail.com']

type TabId = 'dashboard' | 'usuarios' | 'publicaciones' | 'verificacion'

const TABS: { id: TabId; label: string; icon: any; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'publicaciones', label: 'Publicaciones', icon: Package },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'verificacion', label: 'Verificación', icon: ShieldCheck },
]

const QUICK_LINKS = [
  { label: 'Moderación', href: '/admin?tab=moderacion', icon: Shield },
  { label: 'Transacciones', href: '/admin?tab=transacciones', icon: CreditCard },
  { label: 'Anuncios', href: '/admin?tab=anuncios', icon: Megaphone },
  { label: 'Categorías', href: '/admin?tab=categorias', icon: ChevronDown },
  { label: 'Exportar', href: '/admin?tab=exportar', icon: Download },
]

interface Notifier {
  notify: (msg: string) => void
}

// ============================ METRICAS TAB ============================
function MetricasTab() {
  const [stats, setStats] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count: totalUsuarios }, { count: totalProductos }, { count: activos }] = await Promise.all([
        supabase.from('perfiles').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
      ])

      const { data: trans } = await supabase
        .from('transacciones_creditos')
        .select('monto, estado, tipo, creado_en')
        .limit(1000)

      const ingresos = trans?.filter(t => t.estado === 'aprobado' && t.tipo === 'compra').reduce((s, t) => s + t.monto, 0) || 0
      const hoy = new Date().toISOString().split('T')[0]
      const nuevosHoy = trans?.filter(t => t.creado_en?.startsWith(hoy) && t.estado === 'aprobado').length || 0

      setStats({
        totalUsuarios: totalUsuarios || 0,
        totalProductos: totalProductos || 0,
        productosActivos: activos || 0,
        ingresosUSD: ingresos,
        nuevosHoy,
      })
      setCargando(false)
    }
    load()
  }, [])

  if (cargando) return <div className="text-center py-12 text-gray-400">Cargando métricas...</div>

  const cards = [
    { label: 'Usuarios', value: stats.totalUsuarios, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Productos', value: stats.totalProductos, icon: Package, color: 'bg-green-50 text-green-600' },
    { label: 'Activos', value: stats.productosActivos, icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Créditos vendidos', value: stats.ingresosUSD.toLocaleString(), icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
    { label: 'Ventas hoy', value: stats.nuevosHoy, icon: Star, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pausados', value: stats.totalProductos - stats.productosActivos, icon: Pause, color: 'bg-gray-50 text-gray-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg ${c.color} mb-2`}><c.icon size={20} /></div>
            <p className="text-2xl font-black text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================ USUARIOS TAB ============================
type SortField = 'nombre' | 'creado_en' | 'credito_balance' | 'verificado' | 'ultima_actividad'
type SortDir = 'asc' | 'desc'

function UsuariosTab({ notify }: Notifier) {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('creado_en')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [cargando, setCargando] = useState(true)
  const [creditModal, setCreditModal] = useState<string | null>(null)
  const [creditCantidad, setCreditCantidad] = useState('')
  const [creditMotivo, setCreditMotivo] = useState('')
  const [creditProcesando, setCreditProcesando] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .limit(1000)
      if (data) setUsuarios(data)
      setCargando(false)
    }
    load()
  }, [])

  const filtrados = useMemo(() => {
    let list = [...usuarios]
    if (busqueda) {
      const q = busqueda.toLowerCase()
      list = list.filter(u =>
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.email_publico || '').toLowerCase().includes(q) ||
        (u.telefono || '').toLowerCase().includes(q) ||
        (u.ciudad || '').toLowerCase().includes(q) ||
        (u.estado || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      const aVal = a[sortBy] ?? ''
      const bVal = b[sortBy] ?? ''
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [usuarios, busqueda, sortBy, sortDir])

  async function toggleSort(field: SortField) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  async function añadirCreditos(userId: string) {
    if (!creditCantidad || parseInt(creditCantidad) < 1) return
    setCreditProcesando(true)
    try {
      const { data: perfilData } = await supabase
        .from('perfiles').select('credito_balance').eq('id', userId).single()
      const nuevoBalance = (perfilData?.credito_balance || 0) + parseInt(creditCantidad)

      await supabase.from('perfiles').update({ credito_balance: nuevoBalance }).eq('id', userId)
      await supabase.from('transacciones_creditos').insert({
        user_id: userId, tipo: 'admin_manual', monto: parseInt(creditCantidad),
        estado: 'aprobado', motivo_registro: creditMotivo || 'Manual admin',
      })

      const perfil = usuarios.find(u => u.id === userId)
      notify(`✅ +${creditCantidad} créditos a ${perfil?.nombre || 'usuario'}`)

      // Telegram notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensaje: `💰 Creditos Admin\n+${creditCantidad} créditos a ${perfil?.nombre || 'Usuario'}\nMotivo: ${creditMotivo || 'N/A'}`,
          }),
        })
      } catch {}

      setCreditModal(null)
      setCreditCantidad('')
      setCreditMotivo('')
      // reload user list
      await supabase.from('perfiles').select('*').limit(1000).then(({data}) => {
        if (data) setUsuarios(data)
      })
    } catch (err: any) {
      notify('❌ Error: ' + (err.message || 'desconocido'))
    }
    setCreditProcesando(false)
  }

  async function toggleVerificado(userId: string, estado: boolean) {
    const { error } = await supabase.from('perfiles').update({ verificado: estado }).eq('id', userId)
    if (!error) {
      notify(estado ? '✅ Usuario verificado' : '⏸️ Verificación removida')
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, verificado: estado } : u))
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <SortAsc size={14} className="text-gray-300" />
    return sortDir === 'asc' ? <SortAsc size={14} className="text-brand-primary" /> : <SortDesc size={14} className="text-brand-primary" />
  }

  if (cargando) return <div className="text-center py-12 text-gray-400">Cargando usuarios...</div>

  return (
    <div className="space-y-4">
      {/* Buscador + filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Nombre, email, teléfono, ciudad..."
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm" />
        </div>
        <button onClick={async () => {
          setCargando(true)
          const { data } = await supabase.from('perfiles').select('*').limit(1000)
          if (data) setUsuarios(data); setCargando(false)
        }} className="p-2.5 rounded-xl border hover:bg-gray-50" title="Refrescar">
          <RefreshCw size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-500">{filtrados.length} usuarios {busqueda && `(filtrados de ${usuarios.length})`}</p>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-bold">Nombre</th>
                <th className="text-left py-3 px-4 font-bold hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-bold hidden sm:table-cell">Teléfono</th>
                <th className="text-left py-3 px-4 font-bold hidden lg:table-cell">Ubicación</th>
                <th
                  className="py-3 px-4 font-bold text-center cursor-pointer hover:text-brand-primary"
                  onClick={() => toggleSort('credito_balance')}
                >
                  <span className="inline-flex items-center gap-1">Créditos <SortIcon field="credito_balance" /></span>
                </th>
                <th
                  className="py-3 px-4 font-bold text-center hidden sm:table-cell cursor-pointer hover:text-brand-primary"
                  onClick={() => toggleSort('verificado')}
                >
                  <span className="inline-flex items-center gap-1">Verificado</span>
                </th>
                <th
                  className="py-3 px-4 font-bold text-center hidden lg:table-cell cursor-pointer hover:text-brand-primary"
                  onClick={() => toggleSort('creado_en')}
                >
                  <span className="inline-flex items-center gap-1">Registro <SortIcon field="creado_en" /></span>
                </th>
                <th className="py-3 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice(0, 200).map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{u.nombre || 'Sin nombre'}</span>
                      {u.verificado && <span className="text-blue-500">✓</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-gray-500 text-xs">{u.email_publico || '—'}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">{u.telefono || '—'}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-500 text-xs">{u.ciudad && u.estado ? `${u.ciudad}, ${u.estado}` : '—'}</td>
                  <td className="py-3 px-4 text-center font-bold text-brand-primary">{u.credito_balance || 0}</td>
                  <td className="py-3 px-4 text-center hidden sm:table-cell">
                    <button onClick={() => toggleVerificado(u.id, !u.verificado)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${u.verificado ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                      {u.verificado ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400 text-xs hidden lg:table-cell">{u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-VE') : '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setCreditModal(u.id); setCreditCantidad(''); setCreditMotivo('') }}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Añadir créditos">
                        <CreditCard size={14} />
                      </button>
                      <button onClick={() => window.open(`/vendedor/${u.id}`, '_blank')}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Ver perfil">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal créditos */}
      {creditModal && (() => {
        const user = usuarios.find(u => u.id === creditModal)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setCreditModal(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">💰 Añadir créditos a {user?.nombre || 'usuario'}</h3>
              <p className="text-sm text-gray-500 mb-4">Balance actual: <span className="font-bold text-brand-primary">{user?.credito_balance || 0} créditos</span></p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad</label>
                  <input type="number" value={creditCantidad} onChange={e => setCreditCantidad(e.target.value)}
                    placeholder="Ej: 5" min="1" className="w-full border rounded-lg px-4 py-2.5 text-sm" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo (opcional)</label>
                  <input type="text" value={creditMotivo} onChange={e => setCreditMotivo(e.target.value)}
                    placeholder="Ej: Bonus, corrección..." className="w-full border rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCreditModal(null)} className="flex-1 border py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => añadirCreditos(creditModal!)} disabled={!creditCantidad || parseInt(creditCantidad) < 1 || creditProcesando}
                    className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50">
                    {creditProcesando ? 'Añadiendo...' : `Añadir ${creditCantidad || '?'} créditos`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ============================ PUBLICACIONES TAB ============================
function PublicacionesTab({ notify }: Notifier) {
  const [publicaciones, setPublicaciones] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'pausadas' | 'pendientes'>('todas')
  const [sortBy, setSortBy] = useState<'creado_en' | 'precio_usd' | 'visitas' | 'titulo'>('creado_en')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('productos').select('*').order('creado_en', { ascending: false }).limit(500)
      if (data) setPublicaciones(data)
      setCargando(false)
    }
    load()
  }, [])

  const filtradas = useMemo(() => {
    let list = [...publicaciones]
    if (filtro === 'activas') list = list.filter(p => p.activo && p.estado_moderacion === 'aprobado')
    else if (filtro === 'pausadas') list = list.filter(p => !p.activo)
    else if (filtro === 'pendientes') list = list.filter(p => p.estado_moderacion === 'pendiente')
    
    if (busqueda) {
      const q = busqueda.toLowerCase()
      list = list.filter(p =>
        (p.titulo || '').toLowerCase().includes(q) ||
        (p.ubicacion_ciudad || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      const aVal = a[sortBy] ?? ''
      const bVal = b[sortBy] ?? ''
      const cmp = typeof aVal === 'number' && typeof bVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [publicaciones, busqueda, filtro, sortBy, sortDir])

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
    if (destacado) update.destacado_hasta = new Date(Date.now() + 48 * 3600000).toISOString()
    const { error } = await supabase.from('productos').update(update).eq('id', id)
    setProcesando(null)
    if (!error) setPublicaciones(prev => prev.map(p => p.id === id ? { ...p, ...update } : p))
    notify(destacado ? '⭐ Destacado 48h' : '☆ Destacado quitado')
  }

  async function boost(id: string) {
    setProcesando(id)
    const { error } = await supabase
      .from('productos')
      .update({ boosteado_en: new Date().toISOString() })
      .eq('id', id)
    setProcesando(null)
    if (!error) {
      setPublicaciones(prev => prev.map(p => p.id === id ? { ...p, boosteado_en: new Date().toISOString() } : p))
      notify('⚡ Publicación boosted!')
    }
  }

  const filtros = [
    { id: 'todas' as const, label: `Todas (${publicaciones.length})` },
    { id: 'activas' as const, label: `Activas (${publicaciones.filter(p => p.activo && p.estado_moderacion === 'aprobado').length})` },
    { id: 'pausadas' as const, label: `Pausadas (${publicaciones.filter(p => !p.activo).length})` },
    { id: 'pendientes' as const, label: `Pendientes (${publicaciones.filter(p => p.estado_moderacion === 'pendiente').length})` },
  ]

  if (cargando) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-4">
      {/* Buscador + filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título, ciudad..."
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm" />
        </div>
        <button onClick={async () => {
          setCargando(true)
          const { data } = await supabase.from('productos').select('*').order('creado_en', { ascending: false }).limit(500)
          if (data) setPublicaciones(data); setCargando(false)
        }} className="p-2.5 rounded-xl border hover:bg-gray-50">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 flex-wrap">
        {filtros.map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filtro === f.id ? 'bg-brand-primary text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex gap-1.5 flex-wrap">
        {(['creado_en', 'precio_usd', 'visitas', 'titulo'] as const).map(f => (
          <button key={f} onClick={() => {
            if (sortBy === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
            else { setSortBy(f); setSortDir('asc') }
          }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${sortBy === f ? 'bg-gray-800 text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {f === 'creado_en' ? 'Fecha' : f === 'precio_usd' ? 'Precio' : f === 'visitas' ? 'Vistas' : 'Título'} {sortBy === f ? (sortDir === 'asc' ? '↑' : '↓') : ''}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.slice(0, 200).map(p => (
          <div key={p.id} className={`bg-white rounded-xl border p-4 transition ${!p.activo ? 'opacity-60' : ''}`}>
            <div className="flex gap-4">
              {/* Miniatura */}
              <Link href={`/producto/${p.id}`} className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/producto/${p.id}`} className="font-semibold text-gray-800 hover:text-brand-primary truncate max-w-[300px]">{p.titulo}</Link>
                  {p.destacado && <span className="text-[10px] bg-brand-accent/20 text-brand-primary px-2 py-0.5 rounded-full">⭐</span>}
                  {p.boosteado_en && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">⚡</span>}
                  {!p.activo && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Pausado</span>}
                  {p.estado_moderacion === 'pendiente' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pendiente</span>}
                </div>
                <p className="text-sm text-brand-primary font-bold mt-0.5">${Number(p.precio_usd || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">👀 {p.visitas || 0} · 📍 {p.ubicacion_ciudad || 'VE'} · {new Date(p.creado_en).toLocaleDateString('es-VE')}</p>
              </div>

              {/* Acciones */}
              <div className="flex gap-1 flex-shrink-0 flex-wrap items-start">
                <button onClick={() => toggleActivo(p.id, !p.activo)} disabled={procesando === p.id}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title={p.activo ? 'Pausar' : 'Activar'}>
                  {p.activo ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => toggleDestacado(p.id, !p.destacado)} disabled={procesando === p.id}
                  className={`p-2 rounded-lg transition ${p.destacado ? 'bg-brand-accent/20 text-brand-accent' : 'hover:bg-gray-100 text-yellow-500'}`}
                  title={p.destacado ? 'Quitar destacado' : 'Destacar 48h'}>
                  <Star size={14} />
                </button>
                <button onClick={() => boost(p.id)} disabled={procesando === p.id}
                  className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Boostear">
                  <Zap size={14} />
                </button>
                <button onClick={() => window.open(`/producto/${p.id}`, '_blank')}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" title="Ver">
                  <Eye size={14} />
                </button>
                <button onClick={() => eliminar(p.id)} disabled={procesando === p.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && <div className="text-center py-12 text-gray-400">No hay publicaciones</div>}
      </div>
    </div>
  )
}

// ============================ ADMIN PAGE ============================
export default function AdminPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  const isAdmin = ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    if (!session || !user) return
    if (!isAdmin) {
      setToast('No tienes permisos de admin')
      setTimeout(() => router.push('/'), 2000)
      return
    }
    // Read tab from URL
    const urlTab = searchParams?.get('tab')
    if (urlTab && TABS.some(t => t.id === urlTab)) {
      setTab(urlTab as TabId)
    }
  }, [user, session, isAdmin, searchParams])

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
          <button onClick={() => router.push('/')} className="mt-4 text-brand-primary hover:underline">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-accent p-3 rounded-xl"><Shield size={24} className="text-brand-primary" /></div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Admin Panel</h1>
            <p className="text-gray-500">Control total de VendeT-Venezuela</p>
          </div>
        </div>
        <Link href="/" className="text-sm text-brand-primary hover:underline">← Volver al sitio</Link>
      </div>

      {/* Tabs principales */}
      <nav className="flex gap-1 overflow-x-auto pb-2 mb-4 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); router.replace(`/admin?tab=${t.id}`) }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === t.id ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Quick links */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {QUICK_LINKS.map(q => (
          <Link key={q.label} href={q.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border hover:bg-gray-50 text-gray-600 transition">
            <q.icon size={12} /> {q.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      {tab === 'dashboard' && <MetricasTab />}
      {tab === 'usuarios' && <UsuariosTab notify={notify} />}
      {tab === 'publicaciones' && <PublicacionesTab notify={notify} />}
      {tab === 'verificacion' && <VerificacionTab notify={notify} />}
    </div>
  )
}
