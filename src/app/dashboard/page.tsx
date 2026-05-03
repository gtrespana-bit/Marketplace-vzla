"use client"

import { useEffect, useState } from 'react'
import { getTasaBCVClient, actualizarTasaClient } from '@/lib/tasaBCV'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  Plus, Package, MessageSquare, CreditCard,
  Eye, Heart, LogOut, X, Pause, Play, Edit, Zap, Star, ShieldCheck, Key,
  Camera, Phone, Mail, MapPin, Save, CheckCircle, Copy, Upload, Loader2
} from 'lucide-react'
import SolicitarVerificacion from '@/components/SolicitarVerificacion'
import Avatar from '@/components/Avatar'
import { getMunicipiosNombres, ESTADOS } from '@/lib/ubicaciones'

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
  const [pubCount, setPubCount] = useState(0)
  const [boostModal, setBoostModal] = useState<{ productId: string; titulo: string } | null>(null)
  const [destacadoModal, setDestacadoModal] = useState<{ productId: string; titulo: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [tasaBs, setTasaBs] = useState(0)

  // Profile state
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [estado, setEstado] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cambiarPw, setCambiarPw] = useState(false)
  const [pwActual, setPwActual] = useState('')
  const [pwNueva, setPwNueva] = useState('')
  const [pwRepetir, setPwRepetir] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwGuardando, setPwGuardando] = useState(false)

  // Read tab from URL (for redirect from /mi-perfil)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab) setActiveTab(tab)
  }, [])

  useEffect(() => {
    const t = getTasaBCVClient()
    setTasaBs(t.tasa)
    actualizarTasaClient().then(d => setTasaBs(d.tasa))
  }, [])

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
      supabase.from('perfiles').select('credito_balance, nombre, telefono, estado, ciudad, foto_perfil_url').eq('id', user.id).single().then(({ data }) => {
        setCreditos(data?.credito_balance ?? 0)
        if (data) {
          setNombre(data.nombre || '')
          setTelefono(data.telefono || '')
          setEstado(data.estado || '')
          setCiudad(data.ciudad || '')
          setFotoUrl(data.foto_perfil_url || null)
        }
      }),
      supabase.from('productos').select('*', { count: 'exact' }).eq('user_id', user.id).eq('activo', true).then(({ count }) => setPubCount(count || 0)),
    ]).finally(() => setLoading(false))
  }, [user, authLoading])

  // Realtime credit notification
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

  async function handleGuardar() {
    if (!nombre.trim() || !user) return
    setGuardando(true)
    const { error } = await supabase.from('perfiles').upsert({ id: user.id, nombre, telefono, estado, ciudad }).eq('id', user.id)
    if (error) {
      setToast('Error al guardar: ' + error.message)
    } else {
      setEditando(false)
      setToast('✅ Perfil guardado correctamente')
    }
    setGuardando(false)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (pwNueva !== pwRepetir) { setPwError('Las contraseñas no coinciden'); return }
    if (pwNueva.length < 8) { setPwError('La contraseña debe tener al menos 8 caracteres'); return }
    setPwGuardando(true)

    // Primero verificamos que la contraseña actual sea correcta re-login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: pwActual,
    })
    if (signInError || !signInData.user) {
      setPwError('La contraseña actual es incorrecta')
      setPwGuardando(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: pwNueva })
    if (error) {
      setPwError(error.message)
    } else {
      setToast('✅ Contraseña actualizada correctamente')
      setCambiarPw(false)
      setPwActual('')
      setPwNueva('')
      setPwRepetir('')
    }
    setPwGuardando(false)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) { setToast('La imagen debe ser menor a 2MB'); return }
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${user.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage.from('foto_perfil').upload(filePath, file, { upsert: true, cacheControl: '3600' })
    if (uploadErr) { setToast('Error subiendo foto: ' + uploadErr.message); return }
    const { data: urlData } = supabase.storage.from('foto_perfil').getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl
    await supabase.from('perfiles').update({ foto_perfil_url: publicUrl }).eq('id', user.id)
    setFotoUrl(publicUrl)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const municipiosDisponibles = estado ? getMunicipiosNombres(estado) : []

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
                <button key={op.horas} onClick={() => handleDestacar(destacadoModal.productId, op.horas)} disabled={creditos < op.creditos}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition ${creditos >= op.creditos ? 'border-gray-200 hover:border-brand-yellow hover:bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}>
                  <span className="font-bold text-gray-800">{op.horas} horas</span>
                  <span className="text-sm font-bold text-brand-blue">{op.creditos} créditos</span>
                  {creditos < op.creditos && <span className="text-[10px] text-red-500">insuficiente</span>}
                </button>
              ))}
            </div>
            <Link href="/creditos" className="block text-center text-sm text-brand-blue hover:underline">¿Necesitas más créditos? Comprar →</Link>
          </div>
        </div>
      )}

      {/* ===== CAMBIAR CONTRASEÑA MODAL ===== */}
      {cambiarPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCambiarPw(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Cambiar contraseña</h3>
              <button onClick={() => { setCambiarPw(false); setPwError(''); setPwActual(''); setPwNueva(''); setPwRepetir('') }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            {pwError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                ⚠️ {pwError}
              </div>
            )}
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                <input type="password" value={pwActual} onChange={e => setPwActual(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm bg-white" placeholder="Tu contraseña actual" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input type="password" value={pwNueva} onChange={e => setPwNueva(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm bg-white" placeholder="Mínimo 8 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repetir nueva contraseña</label>
                <input type="password" value={pwRepetir} onChange={e => setPwRepetir(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm bg-white" placeholder="Repite la nueva contraseña" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setCambiarPw(false)} className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={pwGuardando} className="flex-1 py-3 bg-brand-blue text-white rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50">{pwGuardando ? 'Guardando...' : 'Cambiar contraseña'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ZONA 1: PERFIL DEL USUARIO ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <label className="relative group cursor-pointer flex-shrink-0">
            <Avatar nombre={nombre} fotoUrl={fotoUrl} size="lg" />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
          </label>
          <div className="flex-1 min-w-0">
            {editando ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                    <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="+58 412 1234567" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Estado</label>
                    <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="">Selecciona...</option>
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Municipio</label>
                    <select value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-white" disabled={!estado}>
                      <option value="">Selecciona...</option>
                      {municipiosDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleGuardar} disabled={guardando} className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    <Save size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditando(false)} className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <X size={14} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {nombre || <button onClick={() => setEditando(true)} className="text-sm font-medium text-brand-blue hover:underline">Añadir nombre →</button>}
                  </h2>
                  {user?.email && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail size={12} /> {user.email}</p>}
                  {(ciudad || estado) && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12} /> {[ciudad, estado].filter(Boolean).join(', ')}</p>}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setEditando(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 border px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    <Edit size={14} /> Editar perfil
                  </button>
                  <button onClick={() => setCambiarPw(true)} className="flex items-center gap-1 text-brand-blue hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    <Key size={14} /> Cambiar contraseña
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    <LogOut size={14} /> Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== ZONA 2: RESUMEN DE RENDIMIENTO ===== */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-800 rounded-xl p-5 text-white mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">📊 Resumen de rendimiento</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div>
            <p className="text-2xl font-black">{visitasTotales}</p>
            <p className="text-xs text-blue-200">Vistas totales</p>
          </div>
          <div>
            <p className="text-2xl font-black">{productos.length ? Math.round(visitasTotales / productos.length) : 0}</p>
            <p className="text-xs text-blue-200">Promedio por producto</p>
          </div>
          <div>
            <p className="text-2xl font-black">{pubCount}</p>
            <p className="text-xs text-blue-200">Productos activos</p>
          </div>
          <div>
            <p className="text-2xl font-black">{productos.filter((p: any) => p.boosteado_en || (p.destacado && p.destacado_hasta > new Date().toISOString())).length}</p>
            <p className="text-xs text-blue-200">Promocionados ahora</p>
          </div>
          <div>
            <p className="text-2xl font-black">{favoritosCount}</p>
            <p className="text-xs text-blue-200">Favoritos</p>
          </div>
          <div>
            <p className="text-2xl font-black">{creditos}</p>
            <p className="text-xs text-blue-200">Créditos</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>🎁 1 crédito gratis al registrarte</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>🎯 {pubCount}/10 publicaciones → 5 créditos gratis</span>
              <div className="w-24 bg-white/30 rounded-full h-1.5">
                <div className="bg-brand-yellow h-1.5 rounded-full transition-all" style={{ width: `${Math.min((pubCount / 10) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ZONA 3: TABS + CONTENIDO ===== */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar mb-6 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'productos', label: 'Mis publicaciones', icon: Package },
          { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
          { id: 'creditos', label: 'Créditos', icon: CreditCard },
          { id: 'favoritos', label: 'Favoritos', icon: Heart },
          { id: 'verificacion', label: 'Verificación', icon: ShieldCheck },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === item.id ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {activeTab === 'productos' && <MisProductos productos={productos} onBoost={setBoostModal} onDestacar={setDestacadoModal} />}
      {activeTab === 'mensajes' && <MensajesPlaceholder />}
      {activeTab === 'creditos' && (
        <CompraCreditos
          creditos={creditos}
          tasaBs={tasaBs}
          refreshCreditos={() => {
            if (user) supabase.from('perfiles').select('credito_balance').eq('id', user.id).single().then(({ data }) => setCreditos(data?.credito_balance ?? 0))
          }}
        />
      )}
      {activeTab === 'favoritos' && <FavoritosPlaceholder favoritos={favoritos} />}
      {activeTab === 'verificacion' && <SolicitarVerificacion />}

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
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-4">Mis publicaciones</h3>
      </div>
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
                    {p.activo ? '✅ Activo' : '⏸️ Pausado'}
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

function CompraCreditos({ creditos, tasaBs, refreshCreditos }: { creditos: number; tasaBs: number; refreshCreditos: () => void }) {
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<any>(null)
  const [tasa, setTasa] = useState<number>(tasaBs || 487.12)

  useEffect(() => {
    fetch('/api/tasa-bcv').then(r => r.json()).then(d => { if (d.tasa) setTasa(d.tasa) }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-900 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Tu balance actual</p>
          <p className="text-4xl font-black">{creditos} créditos</p>
        </div>
        <CreditCard size={40} className="opacity-50" />
      </div>

      {/* Info */}
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
      <h3 className="text-xl font-bold text-gray-800 text-center">Elige tu paquete</h3>
      <p className="text-center text-sm text-gray-500">Tasa BCV: <span className="font-bold text-brand-blue">Bs. {tasa.toFixed(2)} por $</span></p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { creditos: 2, precio: 1, descripcion: 'Para empezar', popular: false },
          { creditos: 15, precio: 5, descripcion: '¡El más elegido!', popular: true },
          { creditos: 40, precio: 10, descripcion: 'Para vendedores activos', popular: false },
          { creditos: 100, precio: 20, descripcion: 'Máximo ahorro', popular: false },
        ].map((pkg) => {
          const porCredito = (pkg.precio / pkg.creditos).toFixed(2)
          const precioBs = (pkg.precio * tasa).toFixed(2)
          return (
            <div key={pkg.creditos} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition hover:-translate-y-1 ${pkg.popular ? 'border-brand-yellow' : 'border-transparent'}`}>
              {pkg.popular && <div className="bg-brand-yellow text-brand-blue text-center py-1.5 text-xs font-bold">⭐ MÁS POPULAR</div>}
              <div className="bg-gradient-to-br from-brand-blue to-blue-800 p-6 text-white text-center">
                <p className="text-5xl font-black">{pkg.creditos}</p>
                <p className="text-sm opacity-80">créditos</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-3xl font-black text-gray-800 mb-1">${pkg.precio} <span className="text-sm font-normal text-gray-500">USD</span></p>
                <p className="text-sm text-gray-400 mb-4">≈ Bs. {precioBs}</p>
                <p className="text-xs text-gray-500 mb-5 bg-gray-50 rounded-lg py-1 px-2 inline-block">${porCredito} por crédito</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 flex-shrink-0" /><strong>{pkg.creditos}</strong> boost(s) al #1</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 flex-shrink-0" />o {Math.floor(pkg.creditos / 4)}× destacado 12h</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 flex-shrink-0" />Sin expiración</li>
                </ul>
                <button onClick={() => setPaqueteSeleccionado(pkg)} className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition cursor-pointer">Comprar</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Métodos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-4 text-center">Métodos de pago aceptados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { nombre: 'Pago Móvil', emoji: '📱', ok: true },
            { nombre: 'Binance Pay', emoji: '🟡', ok: true },
            { nombre: 'Transferencia', emoji: '🏦', ok: true },
          ].map((m) => (
            <div key={m.nombre} className="rounded-xl p-4 text-center bg-gray-50">
              <span className="text-3xl block mb-2">{m.emoji}</span>
              <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {paqueteSeleccionado && (
        <ModalCompraCreditos
          paquete={paqueteSeleccionado}
          tasa={tasa}
          onClose={() => setPaqueteSeleccionado(null)}
          onCompraExitosa={refreshCreditos}
        />
      )}
    </div>
  )
}

const metodosPagoCreditos = [
  {
    id: 'pagomovil', nombre: 'Pago Móvil', emoji: '📱',
    instrucciones: { telefono: '04126443099', cedula: 'V20794917', banco: 'Banco Provincial BBVA' },
  },
  { id: 'binance', nombre: 'Binance Pay', emoji: '🟡', instrucciones: { id: '204147542' } },
]

function ModalCompraCreditos({ paquete, tasa, onClose, onCompraExitosa }: { paquete: any; tasa: number; onClose: () => void; onCompraExitosa: () => void }) {
  const router = useRouter()
  const [metodo, setMetodo] = useState('')
  const [copiado, setCopiado] = useState('')
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const precioBs = (paquete.precio * tasa).toFixed(2)
  const selectedMetodo = metodosPagoCreditos.find(m => m.id === metodo)
  const isPagoMovil = metodo === 'pagomovil'

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiado(label)
    setTimeout(() => setCopiado(''), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return }
    setComprobanteFile(file)
    setComprobantePreview(URL.createObjectURL(file))
  }

  const procesarCompra = async () => {
    if (!metodo) { alert('Selecciona un método de pago'); return }
    if (!comprobanteFile) { alert('Sube el comprobante'); return }

    setEnviando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/login?redirect=/dashboard?tab=creditos`); return }

      const fileExt = comprobanteFile.name.split('.').pop()
      const fileName = `comprobante_${user.id}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, comprobanteFile, { contentType: comprobanteFile.type })
      if (uploadError) { alert('Error subiendo: ' + uploadError.message); setEnviando(false); return }

      const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName)

      const res = await fetch('/api/comprar-creditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          creditos: paquete.creditos,
          precioUsd: paquete.precio,
          metodoPago: selectedMetodo?.nombre || metodo,
          comprobanteUrl: publicUrl,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        setEnviado(true)
        onCompraExitosa()
      } else {
        alert('Error: ' + (data.error || 'Error procesando'))
      }
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Error desconocido'))
    }
    setEnviando(false)
  }

  if (enviado) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center">
        <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-brand-blue" />
          </div>
          <h3 className="text-xl font-bold text-brand-blue mb-2">¡Comprobante enviado!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Tu pago será revisado en breve. Recibirás <strong>{paquete.creditos} créditos</strong> cuando se confirme.
          </p>
          <button onClick={onClose} className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition">Cerrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{paquete.creditos} créditos — ${paquete.precio} USD</h3>
            <p className="text-sm text-gray-500">≈ Bs. {precioBs}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Método de pago */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3">1. Elige cómo vas a pagar</h4>
            <div className="grid grid-cols-2 gap-3">
              {metodosPagoCreditos.map(m => (
                <button key={m.id} onClick={() => setMetodo(m.id)}
                  className={`p-4 rounded-xl border-2 text-center transition ${metodo === m.id ? 'border-brand-yellow bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-3xl block">{m.emoji}</span>
                  <span className="text-sm font-medium text-gray-700 mt-1 block">{m.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monto a pagar en Bs — solo Pago Móvil */}
          {isPagoMovil && (
            <div className="bg-brand-blue/5 border-2 border-brand-blue/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1 text-center">Monto a pagar (Pago Móvil)</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-black text-brand-blue">Bs. {precioBs}</p>
                <button
                  onClick={() => copyToClipboard(precioBs, 'precioBs')}
                  className="flex items-center gap-1 bg-white border border-brand-blue/30 rounded-lg px-3 py-2 text-sm text-brand-blue hover:bg-brand-blue/5 transition"
                >
                  {copiado === 'precioBs' ? '✓' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">Tasa BCV: Bs. {tasa.toFixed(2)} / ${paquete.precio}</p>
            </div>
          )}

          {/* Datos de pago */}
          {selectedMetodo && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">2. Datos de pago</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {Object.entries(selectedMetodo.instrucciones).map(([key, value]) => {
                  const labelMap: Record<string, string> = { telefono: 'Teléfono', cedula: 'Cédula', banco: 'Banco', id: 'Binance ID' }
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">{labelMap[key] || key}</span>
                        <p className="text-sm font-medium text-gray-800">{value as string}</p>
                      </div>
                      <button onClick={() => copyToClipboard(value as string, key)} className="text-xs bg-white border rounded-md px-2 py-1 hover:bg-gray-100 transition ml-2">
                        {copiado === key ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comprobante */}
          {selectedMetodo && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">3. Sube tu comprobante de pago</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-blue transition cursor-pointer"
                onClick={() => document.getElementById('comprobante-input-dash')?.click()}>
                <input type="file" accept="image/*" id="comprobante-input-dash" onChange={handleFileChange} className="hidden" />
                {comprobantePreview ? (
                  <div>
                    <img src={comprobantePreview} alt="Comprobante" className="max-h-48 mx-auto rounded-lg mb-3" />
                    <button onClick={(e) => { e.stopPropagation(); setComprobanteFile(null); setComprobantePreview('') }} className="text-sm text-red-500 hover:underline">Quitar imagen</button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Toca para subir captura del pago</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG — máx 5MB</p>
                  </>
                )}
              </div>
              <button onClick={procesarCompra} disabled={enviando || !comprobanteFile}
                className="w-full mt-4 bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {enviando ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : <><Upload size={18} /> Enviar comprobante</>}
              </button>
            </div>
          )}

          {!metodo && (
            <div className="text-center py-4 text-sm text-gray-400">
              Selecciona un método de pago para continuar ↓
            </div>
          )}
        </div>
      </div>
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
