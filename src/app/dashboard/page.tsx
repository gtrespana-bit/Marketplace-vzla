'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  Plus, Package, MessageSquare, CreditCard, Settings,
  Eye, Heart, LogOut, ChevronRight, X, Pause, Play, Edit, User, Zap, Star, ShieldCheck
} from 'lucide-react'
import SolicitarVerificacion from '@/components/SolicitarVerificacion'
import BadgeVerificado from '@/components/BadgeVerificado'

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('productos')
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [visitasTotales, setVisitasTotales] = useState(0)
  const [favoritos, setFavoritos] = useState<any[]>([])
  const [favoritosCount, setFavoritosCount] = useState(0)
  const [creditos, setCreditos] = useState(0)
  const [boostModal, setBoostModal] = useState<{ productId: string; titulo: string } | null>(null)
  const [destacadoModal, setDestacadoModal] = useState<{ productId: string; titulo: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    Promise.all([
      supabase.from('productos').select('*').eq('user_id', user.id).order('creado_en', { ascending: false }).then(({ data }) => setProductos(data || [])),
      supabase.from('productos').select('visitas').eq('user_id', user.id).then(({ data }) => {
        const total = data?.reduce((sum: number, p: any) => sum + (p.visitas || 0), 0) || 0
        setVisitasTotales(total)
      }),
      supabase.from('favoritos').select('producto_id, creado_en, productos!inner(id, titulo, precio_usd, imagen_url, activo, user_id, ubicacion_ciudad)').eq('user_id', user.id).order('creado_en', { ascending: false }).then(({ data }) => {
        setFavoritos(data || [])
        setFavoritosCount(data?.length || 0)
      }),
      supabase.from('perfiles').select('credito_balance').eq('id', user.id).single().then(({ data }) => setCreditos(data?.credito_balance ?? 0)),
    ]).finally(() => setLoading(false))
  }, [user, authLoading])

  // Realtime: notificación cuando el saldo de créditos cambia (admin aprueba compra)
  useEffect(() => {
    if (!user) return
    const sub = supabase
      .channel('credit-notif')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'perfiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const newBalance = payload.new?.credito_balance
          const oldBalance = payload.old?.credito_balance
          if (typeof newBalance === 'number' && typeof oldBalance === 'number' && newBalance > oldBalance) {
            const diff = newBalance - oldBalance
            setCreditos(newBalance)
            setToast(`✅ +${diff} créditos añadidos a tu cuenta`)
            setTimeout(() => setToast(null), 6000)
          } else if (typeof newBalance === 'number') {
            // Para otros casos (boost, destacado), actualizar en silencio
            setCreditos(newBalance)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [user])

  async function handleBoost(productId: string) {
    const { data, error } = await supabase.rpc('usar_boost', { p_producto_id: productId, p_user_id: user!.id })
    if (error || !data?.ok) {
      setToast(`Error: ${data?.error || error?.message || 'No se pudo hacer boost'}`)
    } else {
      setCreditos(data.balance)
      setToast('⚡ Boost aplicado! Tu publicación ahora está #1')
      // Refresh products
      const { data: prods } = await supabase.from('productos').select('*').eq('user_id', user!.id).order('creado_en', { ascending: false })
      setProductos(prods || [])
    }
    setBoostModal(null)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleDestacar(productId: string, horas: number) {
    const { data, error } = await supabase.rpc('usar_destacado', { p_producto_id: productId, p_user_id: user!.id, p_horas: horas })
    if (error || !data?.ok) {
      setToast(`Error: ${data?.error || error?.message || 'No se pudo destacar'}`)
    } else {
      setCreditos(data.balance)
      setToast(`⭐ Destacado activado por ${horas} horas!`)
      const { data: prods } = await supabase.from('productos').select('*').eq('user_id', user!.id).order('creado_en', { ascending: false })
      setProductos(prods || [])
    }
    setDestacadoModal(null)
    setTimeout(() => setToast(null), 4000)
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Inicia sesión</h2>
          <p className="text-gray-500 mb-6">Necesitas una cuenta para acceder al panel</p>
          <Link href="/login" className="inline-block bg-brand-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 transition">Iniciar sesión</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium animate-bounce max-w-xs">
          {toast}
        </div>
      )}

      {/* Boost Modal */}
      {boostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setBoostModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">⚡ Boost — Subir al #1</h3>
              <button onClick={() => setBoostModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4"><strong>{boostModal.titulo}</strong></p>
            <p className="text-sm text-gray-600 mb-2">Esto subirá tu publicación a la <strong>posición #1</strong> de la lista.</p>
            <p className="text-sm text-gray-600 mb-4">Si otra persona hace boost después, tomará tu lugar.</p>
            <div className="flex items-center gap-2 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <Zap size={20} className="text-yellow-600" />
              <span className="font-bold text-brand-blue">Costo: 1 crédito</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBoostModal(null)} className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleBoost(boostModal.productId)} className="flex-1 py-3 bg-brand-yellow text-brand-blue rounded-lg font-bold hover:bg-yellow-400">⚡ Boost (1 crédito)</button>
            </div>
          </div>
        </div>
      )}

      {/* Destacado Modal */}
      {destacadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDestacadoModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">⭐ Destacar publicación</h3>
              <button onClick={() => setDestacadoModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4"><strong>{destacadoModal.titulo}</strong></p>
            <p className="text-sm text-gray-600 mb-4">Tu publicación aparecerá:</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-6">
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-yellow" /> En la <strong>página principal</strong> como destacado</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-brand-yellow" /> Con <strong>prioridad</strong> en resultados de búsqueda</li>
            </ul>
            <div className="space-y-2 mb-6">
              {[
                { horas: 12, creditos: 4 },
                { horas: 24, creditos: 6 },
                { horas: 48, creditos: 10 },
              ].map(op => (
                <button
                  key={op.horas}
                  onClick={() => handleDestacar(destacadoModal.productId, op.horas)}
                  disabled={creditos < op.creditos}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition ${
                    creditos >= op.creditos
                      ? 'border-gray-200 hover:border-brand-yellow hover:bg-yellow-50'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="font-bold text-gray-800">{op.horas} horas</span>
                  <span className="text-sm font-bold text-brand-blue">{op.creditos} créditos</span>
                  {creditos < op.creditos && <span className="text-[10px] text-red-500">insuficiente</span>}
                </button>
              ))}
            </div>
            <Link href="/creditos" className="block text-center text-sm text-brand-blue hover:underline">
              ¿Necesitas más créditos? Comprar →
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mi Panel</h1>
          <p className="text-gray-500">Gestiona tus publicaciones y créditos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/mi-perfil" className="flex items-center gap-2 border px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
            <User size={16} /> Ver Mi Perfil
          </Link>
          <Link href="/publicar" className="flex items-center gap-2 bg-brand-yellow text-brand-blue px-5 py-2.5 rounded-lg font-bold hover:bg-yellow-400 transition">
            <Plus size={18} /> Publicar
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Publicaciones', value: productos.length, icon: Package, color: 'bg-blue-50 text-brand-blue' },
          { label: 'Visitas totales', value: visitasTotales, icon: Eye, color: 'bg-green-50 text-green-700' },
          { label: 'Favoritos', value: favoritosCount, icon: Heart, color: 'bg-red-50 text-red-600' },
          { label: 'Créditos', value: loading ? '...' : creditos, icon: CreditCard, color: 'bg-yellow-50 text-brand-yellow' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {[
              { id: 'productos', label: 'Mis publicaciones', icon: Package },
              { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
              { id: 'creditos', label: 'Comprar créditos', icon: CreditCard },
              { id: 'favoritos', label: 'Mis favoritos', icon: Heart },
              { id: 'verificacion', label: 'Verificacion', icon: ShieldCheck },
              { id: 'configuracion', label: 'Configuracion', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                  activeTab === item.id ? 'bg-brand-blue text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'productos' && <MisProductos productos={productos} onBoost={setBoostModal} onDestacar={setDestacadoModal} />}
          {activeTab === 'mensajes' && <MensajesPlaceholder />}
          {activeTab === 'creditos' && (
            <CompraCreditos
              creditos={creditos}
              refreshCreditos={() => {
                if (user) supabase.from('perfiles').select('credito_balance').eq('id', user.id).single().then(({ data }) => setCreditos(data?.credito_balance ?? 0))
              }}
            />
          )}
          {activeTab === 'favoritos' && <FavoritosPlaceholder favoritos={favoritos} />}
          {activeTab === 'verificacion' && <SolicitarVerificacion />}
          {activeTab === 'configuracion' && <ConfiguracionPlaceholder />}
        </div>
      </div>
    </div>
  )
}

function MisProductos({ productos, onBoost, onDestacar }: { productos: any[]; onBoost: (m: { productId: string; titulo: string }) => void; onDestacar: (m: { productId: string; titulo: string }) => void }) {
  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Package size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes publicaciones</h3>
        <p className="text-gray-500 mb-6">Publica tu primer producto en segundos. ¡Es gratis!</p>
        <Link href="/publicar" className="inline-block bg-brand-yellow text-brand-blue px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">Publicar ahora</Link>
      </div>
    )
  }

  const now = new Date().toISOString()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-bold text-lg mb-4">Mis publicaciones ({productos.length})</h3>
      <div className="space-y-3">
        {productos.map((p) => {
          const isBoosted = p.boosteado_en != null
          const isFeatured = p.destacado && p.destacado_hasta && p.destacado_hasta > now
          return (
            <div key={p.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
              <Link href={`/producto/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate group-hover:text-brand-blue transition">
                    {isBoosted && '⚡ '}{isFeatured && !isBoosted && '⭐ '}{p.titulo}
                  </h4>
                  <p className="text-sm text-brand-blue font-bold">${p.precio_usd?.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>👀 {p.visitas || 0} vistas</span>
                    <span>{p.activo ? '✅ Activo' : '⏸️ Pausado'}</span>
                    {isFeatured && (
                      <span className="text-brand-blue">⭐ Hasta {new Date(p.destacado_hasta).toLocaleDateString('es-VE')}</span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/producto/editar/${p.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition text-brand-blue" title="Editar">
                  <Edit size={16} />
                </Link>
                <button onClick={async () => { const ns = !p.activo; await supabase.from('productos').update({ activo: ns }).eq('id', p.id); window.location.reload() }} className="p-2 hover:bg-gray-100 rounded-lg transition" title={p.activo ? 'Pausar' : 'Activar'}>
                  {p.activo ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={() => onBoost({ productId: p.id, titulo: p.titulo })} className="p-2 hover:bg-yellow-50 rounded-lg transition text-yellow-600" title="Boost">
                  <Zap size={16} />
                </button>
                <button onClick={() => onDestacar({ productId: p.id, titulo: p.titulo })} className="p-2 hover:bg-yellow-50 rounded-lg transition text-brand-blue" title="Destacar">
                  <Star size={16} />
                </button>
                <button onClick={async () => { if (confirm('¿Eliminar esta publicacion permanentemente?')) { await supabase.from('productos').delete().eq('id', p.id); window.location.reload() } }} className="p-2 hover:bg-red-50 rounded-lg transition text-red-500" title="Eliminar">
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MensajesPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Chat en tiempo real</h3>
      <p className="text-gray-500">Gestiona tus conversaciones con compradores y vendedores.</p>
      <Link href="/chat" className="inline-block mt-4 bg-brand-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-900 transition">Abrir Chat</Link>
    </div>
  )
}

function CompraCreditos({ creditos, refreshCreditos }: { creditos: number; refreshCreditos: () => void }) {
  const [paso, setPaso] = useState<'paquetes' | 'comprobante' | null>(null)
  const [paqueteSel, setPaqueteSel] = useState<{ creditos: number; precio: number } | null>(null)
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [metodoPago, setMetodoPago] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const paquetes = [
    { creditos: 2, precio: 1, desc: 'Para probar' },
    { creditos: 15, precio: 5, desc: 'Más popular', popular: true },
    { creditos: 40, precio: 10, desc: 'Vendedor activo' },
    { creditos: 100, precio: 20, desc: 'Máximo ahorro' },
  ]

  const datosPago = [
    { metodo: 'Pago Móvil', datos: '0412-1234567 · CI 12345678 · Banesco' },
    { metodo: 'Zelle', datos: 'tuemail@ejemplo.com' },
    { metodo: 'Binance Pay', datos: 'Pay ID: 123456789' },
    { metodo: 'PayPal', datos: 'paypal@ejemplo.com' },
    { metodo: 'Transferencia', datos: 'Banesco · 0134 · CI 12345678 · 0134-1234-56-1234567890' },
  ]

  async function enviarComprobante() {
  if (!comprobante || !metodoPago || !paqueteSel) return
  setEnviando(true)

  // subir comprobante a Supabase Storage
  let fileUrl = ''
  const fileName = `${Date.now()}-${comprobante.name}`
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('comprobantes')
    .upload(fileName, comprobante)

  if (!uploadErr) {
    const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(fileName)
    fileUrl = urlData.publicUrl
  }

  // obtener perfil para el nombre
  const { data: perfilData } = await supabase.from('perfiles').select('nombre').eq('id', (await supabase.auth.getUser()).data.user?.id).single()
  const nombreUsuario = perfilData?.nombre || 'Usuario'

  // crear transaccion
  const { error: dbErr } = await supabase
    .from('transacciones_creditos')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      tipo: 'compra',
      monto: paqueteSel.creditos,
      metodo_pago: metodoPago,
      comprobante_url: fileUrl || null,
      estado: 'pendiente',
    })

  // Notificar admin por Telegram (fire and forget)
  if (!dbErr) {
    const mensaje = `🔔 <b>Nuevo pago pendiente</b>\n\n👤 ${nombreUsuario}\n💰 <b>${paqueteSel.creditos} créditos</b> por $${paqueteSel.precio} USD\n💳 Método: ${metodoPago}\n\nRevisa el admin para aprobar o rechazar.`
    try { await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensaje }) }) } catch (e) { console.error('Error notificando:', e) }
  }

  setEnviando(false)
  if (dbErr) {
    setToast('Error al enviar. Intenta de nuevo.')
  } else {
    setToast('✅ Comprobante enviado! Recibirás tus créditos pronto.')
    setPaso(null)
    setComprobante(null)
    setMetodoPago('')
    setPaqueteSel(null)
    setTimeout(() => setToast(null), 5000)
  }
}

  return (
    <div className="space-y-6">
      {/* Balance actual */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-900 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Tu balance actual</p>
          <p className="text-4xl font-black">{creditos} créditos</p>
        </div>
        <CreditCard size={40} className="opacity-50" />
      </div>

      {/* Info rápida */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-3">¿Para qué sirven?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="font-bold text-brand-blue flex items-center gap-2"><Zap size={18} className="text-yellow-500" /> Boost — 1 crédito</p>
            <p className="text-sm text-gray-600 mt-1">Sube tu publicación al #1 de la lista</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-bold text-brand-blue flex items-center gap-2"><Star size={18} className="text-brand-yellow" /> Destacado</p>
            <p className="text-sm text-gray-600 mt-1">4cr/12h · 6cr/24h · 10cr/48h</p>
          </div>
        </div>
      </div>

      {/* Paquetes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paquetes.map((pkg) => (
          <button
            key={pkg.creditos}
            onClick={() => { setPaqueteSel(pkg); setPaso('comprobante') }}
            className={`bg-white rounded-xl shadow-sm border-2 p-5 text-left hover:-translate-y-1 transition ${
              pkg.popular ? 'border-brand-yellow' : 'border-transparent hover:border-gray-300'
            }`}
          >
            {pkg.popular && (
              <div className="text-[10px] font-bold text-brand-yellow bg-brand-yellow/10 rounded-full px-2 py-0.5 inline-block mb-2">⭐ Más popular</div>
            )}
            <p className="text-3xl font-black text-gray-800">{pkg.creditos}</p>
            <p className="text-xs text-gray-500">créditos</p>
            <p className="text-2xl font-black text-brand-blue mt-2">${pkg.precio}</p>
            <p className="text-xs text-gray-400">≈ Bs. {(pkg.precio * 64).toLocaleString('es-VE')}</p>
          </button>
        ))}
      </div>

      {/* Datos de pago */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-4">📱 Datos de pago</h3>
        <div className="space-y-2">
          {datosPago.map((dp) => (
            <div key={dp.metodo} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <p className="font-bold text-sm text-gray-800 min-w-[120px]">{dp.metodo}:</p>
              <p className="text-sm text-gray-600">{dp.datos}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">⚠️ Actualiza los datos de pago en el código con los reales</p>
      </div>

      {/* Modal comprobante */}
      {paso === 'comprobante' && paqueteSel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setPaso(null); setPaqueteSel(null) }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Enviar comprobante</h3>
              <button onClick={() => { setPaso(null); setPaqueteSel(null) }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-brand-blue">
                Comprando <strong>{paqueteSel.creditos} créditos</strong> por <strong>${paqueteSel.precio} USD</strong>
              </p>
            </div>

            {/* Método de pago */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Método de pago usado:</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white">
                <option value="">Selecciona...</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="zelle">Zelle</option>
                <option value="binance">Binance Pay</option>
                <option value="paypal">PayPal</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            {/* Comprobante */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Captura del pago:</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={e => setComprobante(e.target.files?.[0] || null)}
                className="w-full text-sm bg-gray-50 border rounded-lg p-2"
              />
            </div>

            <button
              onClick={enviarComprobante}
              disabled={enviando || !comprobante || !metodoPago}
              className="w-full bg-brand-yellow text-brand-blue py-3 rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Enviar comprobante'}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  )
}

function FavoritosPlaceholder({ favoritos }: { favoritos: any[] }) {
  if (favoritos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <Heart size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Tus favoritos</h3>
        <p className="text-gray-500">Guarda publicaciones que te interesen para verlas después.</p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-bold text-lg mb-4">Mis favoritos ({favoritos.length})</h3>
      <div className="space-y-3">
        {favoritos.map((fav: any) => {
          const p = fav.productos
          return (
            <div key={fav.producto_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
              <Link href={`/producto/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{p.titulo}</h4>
                  <p className="text-sm text-brand-blue font-bold">${p.precio_usd?.toLocaleString()}</p>
                  {p.ubicacion_ciudad && <p className="text-xs text-gray-500">{p.ubicacion_ciudad}</p>}
                </div>
              </Link>
              <button onClick={async () => { await supabase.from('favoritos').delete().eq('producto_id', p.id); window.location.reload() }} className="p-2 hover:bg-red-50 rounded-lg transition text-red-500" title="Quitar de favoritos">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConfiguracionPlaceholder() {
  const router = useRouter()
  const { user } = useAuth()
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Configuración</h3>
      <p className="text-gray-500 text-sm mb-6">Gestiona tu perfil y preferencias</p>
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">📝 Métodos de contacto</h4>
          <p className="text-sm text-gray-500">Los métodos de contacto se configuran <b>por publicación</b>.</p>
          <Link href="/publicar" className="inline-block mt-3 text-brand-blue hover:underline text-sm font-medium">Crear publicación →</Link>
        </div>
        <div className="pt-4 border-t flex items-center gap-4">
          <Link href="/mi-perfil" className="flex items-center gap-2 border px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm"><User size={16} /> Editar mi perfil</Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg transition text-sm"><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </div>
    </div>
  )
}
