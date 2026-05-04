"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import SolicitarVerificacion from '@/components/SolicitarVerificacion'
import { getTasaBCVClient, actualizarTasaClient } from '@/lib/tasaBCV'
import {
  Package, MessageSquare, CreditCard,
  Eye, Heart, LogOut, X, Zap, Star, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

// Components
import DashboardHeader from './components/DashboardHeader'
import TabProductos from './components/tabs/TabProductos'
import TabMensajes from './components/tabs/TabMensajes'
import TabCreditos from './components/tabs/TabCreditos'
import TabFavoritos from './components/tabs/TabFavoritos'
import TabReputacion from './components/tabs/TabReputacion'
import BoostModal from './components/modals/BoostModal'
import DestacadoModal from './components/modals/DestacadoModal'

// Hooks
import { useDashboard } from './hooks/useDashboard'
import { supabase } from '@/lib/supabase'

function PasswordModal({ user, setToast, onClose }: { user: any; setToast: (s: string | null) => void; onClose: () => void }) {
  const [pwActual, setPwActual] = useState('')
  const [pwNueva, setPwNueva] = useState('')
  const [pwRepetir, setPwRepetir] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwGuardando, setPwGuardando] = useState(false)

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (pwNueva !== pwRepetir) { setPwError('Las contraseñas no coinciden'); return }
    if (pwNueva.length < 8) { setPwError('La contraseña debe tener al menos 8 caracteres'); return }
    setPwGuardando(true)

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
    }
    setPwGuardando(false)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Cambiar contraseña</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        {pwError && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">⚠️ {pwError}</div>}
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
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={pwGuardando} className="flex-1 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-dark disabled:opacity-50">{pwGuardando ? 'Guardando...' : 'Cambiar contraseña'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const data = useDashboard()
  const [activeTab, setActiveTab] = useState('productos')
  const [cambiarPw, setCambiarPw] = useState(false)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [boostTarget, setBoostTarget] = useState<{ productId: string; titulo: string } | null>(null)
  const [destacadoTarget, setDestacadoTarget] = useState<{ productId: string; titulo: string } | null>(null)
  const [tasaBs, setTasaBs] = useState(0)

  // Read tab from URL
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

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) { data.setToast('La imagen debe ser menor a 2MB'); return }
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${user.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage.from('foto_perfil').upload(filePath, file, { upsert: true, cacheControl: '3600' })
    if (uploadErr) { data.setToast('Error subiendo foto: ' + uploadErr.message); return }
    const { data: urlData } = supabase.storage.from('foto_perfil').getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl
    await supabase.from('perfiles').update({ foto_perfil_url: publicUrl }).eq('id', user.id)
    data.setFotoUrl(publicUrl)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleBoost(productId: string) {
    const { data: result, error } = await supabase.rpc('usar_boost', { p_producto_id: productId, p_user_id: user!.id })
    if (error || !result?.ok) {
      data.setToast(`Error: ${result?.error || error?.message || 'No se pudo hacer boost'}`)
    } else {
      data.setCreditos(result.balance)
      data.setToast('⚡ Boost aplicado! Tu publicación ahora está #1')
      const { data: prods } = await supabase.from('productos').select('*').eq('user_id', user!.id).order('creado_en', { ascending: false })
      data.setProductos(prods || [])
    }
    setBoostTarget(null)
    setTimeout(() => data.setToast(null), 4000)
  }

  async function handleDestacar(productId: string, horas: number) {
    const { data: result, error } = await supabase.rpc('usar_destacado', { p_producto_id: productId, p_user_id: user!.id, p_horas: horas })
    if (error || !result?.ok) {
      data.setToast(`Error: ${result?.error || error?.message || 'No se pudo destacar'}`)
    } else {
      data.setCreditos(result.balance)
      data.setToast(`⭐ Destacado activado por ${horas} horas!`)
      const { data: prods } = await supabase.from('productos').select('*').eq('user_id', user!.id).order('creado_en', { ascending: false })
      data.setProductos(prods || [])
    }
    setDestacadoTarget(null)
    setTimeout(() => data.setToast(null), 4000)
  }

  if (authLoading) return null

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Inicia sesión</h2>
          <p className="text-gray-500 mb-6">Necesitas una cuenta para acceder al panel</p>
          <Link href="/login" className="inline-block bg-brand-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-dark transition">Iniciar sesión</Link>
        </div>
      </div>
    )
  }

  const numPubsVendidas = data.productos.filter((p: any) => !p.activo && p.estado_moderacion !== 'rechazado').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast */}
      {data.toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium animate-bounce max-w-xs">
          {data.toast}
        </div>
      )}

      {/* Modals */}
      {boostTarget && (
        <BoostModal
          titulo={boostTarget.titulo}
          onClose={() => setBoostTarget(null)}
          onBoost={() => handleBoost(boostTarget.productId)}
        />
      )}
      {destacadoTarget && (
        <DestacadoModal
          titulo={destacadoTarget.titulo}
          creditos={data.creditos}
          onClose={() => setDestacadoTarget(null)}
          onDestacar={(h) => handleDestacar(destacadoTarget.productId, h)}
        />
      )}
      {cambiarPw && (
        <PasswordModal user={user} setToast={data.setToast} onClose={() => setCambiarPw(false)} />
      )}

      {/* Header */}
      <DashboardHeader
        user={user}
        nombre={data.nombre} setNombre={data.setNombre}
        telefono={data.telefono} setTelefono={data.setTelefono}
        estado={data.estado} setEstado={data.setEstado}
        ciudad={data.ciudad} setCiudad={data.setCiudad}
        fotoUrl={data.fotoUrl} setFotoUrl={data.setFotoUrl}
        verificado={data.verificado}
        nivelConfianza={data.nivelConfianza}
        resenasCount={data.resenas.length}
        promedioResenas={data.promedioResenas}
        setToast={data.setToast}
        setGuardando={setGuardandoPerfil}
        onPassword={() => setCambiarPw(true)}
        onLogout={handleLogout}
        onFotoChange={handleFoto}
      />

      {/* Resumen */}
      <div className="bg-gradient-to-r from-brand-primary to-blue-800 rounded-xl p-5 text-white mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">📊 Resumen de rendimiento</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div>
            <p className="text-2xl font-black">{data.visitasTotales}</p>
            <p className="text-xs text-blue-200">Vistas totales</p>
          </div>
          <div>
            <p className="text-2xl font-black">{data.productos.length ? Math.round(data.visitasTotales / data.productos.length) : 0}</p>
            <p className="text-xs text-blue-200">Promedio por producto</p>
          </div>
          <div>
            <p className="text-2xl font-black">{data.pubCount}</p>
            <p className="text-xs text-blue-200">Productos activos</p>
          </div>
          <div>
            <p className="text-2xl font-black">{data.productos.filter((p: any) => p.boosteado_en || (p.destacado && p.destacado_hasta > new Date().toISOString())).length}</p>
            <p className="text-xs text-blue-200">Promocionados ahora</p>
          </div>
          <div>
            <p className="text-2xl font-black">{data.favoritosCount}</p>
            <p className="text-xs text-blue-200">Favoritos</p>
          </div>
          <div>
            <p className="text-2xl font-black">{data.creditos}</p>
            <p className="text-xs text-blue-200">Créditos</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>🎁 1 crédito gratis al registrarte</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>🎯 {data.pubCount}/10 publicaciones → 5 créditos gratis</span>
              <div className="w-24 bg-white/30 rounded-full h-1.5">
                <div className="bg-brand-accent h-1.5 rounded-full transition-all" style={{ width: `${Math.min((data.pubCount / 10) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar mb-6 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'productos', label: 'Mis publicaciones', icon: Package },
          { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
          { id: 'creditos', label: 'Créditos', icon: CreditCard },
          { id: 'favoritos', label: 'Favoritos', icon: Heart },
          { id: 'verificacion', label: 'Verificación', icon: ShieldCheck },
          { id: 'reputacion', label: 'Mi reputación', icon: Star },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === item.id ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'productos' && (
        <TabProductos
          productos={data.productos}
          onBoost={setBoostTarget}
          onDestacar={setDestacadoTarget}
        />
      )}
      {activeTab === 'mensajes' && <TabMensajes />}
      {activeTab === 'creditos' && (
        <TabCreditos creditos={data.creditos} tasaBs={tasaBs} refreshCreditos={data.refreshAll} />
      )}
      {activeTab === 'favoritos' && <TabFavoritos favoritos={data.favoritos} />}
      {activeTab === 'verificacion' && <SolicitarVerificacion />}
      {activeTab === 'reputacion' && (
        <TabReputacion
          verificado={data.verificado}
          nivelConfianza={data.nivelConfianza}
          badgesAuto={data.badgesAuto}
          resenas={data.resenas}
          promedioResenas={data.promedioResenas}
          numPubsActivas={data.pubCount}
          numPubsVendidas={numPubsVendidas}
          creadoEn={data.creadoEn}
          ultimaActividad={data.ultimaActividad}
        />
      )}
    </div>
  )
}
