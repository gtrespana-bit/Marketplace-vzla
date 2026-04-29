'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Check, X, CreditCard, Eye, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

// ← PON TU EMAIL DE SUPABASE AQUI ↑
const ADMIN_EMAILS = ['tuemail@ejemplo.com']

export default function AdminPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [pendientes, setPendientes] = useState<any[]>([])
  const [historial, setHistorial] = useState<any[]>([])
  const [perfiles, setPerfiles] = useState<Record<string, any>>({})
  const [procesando, setProcesando] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const isAdmin = ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    if (!session || !user) return
    if (!isAdmin) {
      setToast('No tienes permisos de admin')
      setTimeout(() => router.push('/'), 2000)
      return
    }
    cargar()
  }, [user, session, isAdmin])

  async function cargar() {
    const { data: transacciones } = await supabase
      .from('transacciones_creditos')
      .select('*')
      .eq('tipo', 'compra')
      .order('creado_en', { ascending: false })
      .limit(50)

    if (!transacciones) return

    // Perfiles de estos usuarios
    const userIds = Array.from(new Set(transacciones.map(t => t.user_id)))
    const { data: perfilesData } = await supabase
      .from('perfiles')
      .select('id, nombre, telefono')
      .in('id', userIds)

    const pMap: Record<string, any> = {}
    perfilesData?.forEach(p => { pMap[p.id] = p })
    setPerfiles(pMap)

    // Separar pendientes y historial
    const pend = transacciones.filter(t => t.estado === 'pendiente')
    const hist = transacciones.filter(t => t.estado !== 'pendiente')

    setPendientes(pend)
    setHistorial(hist)
  }

  async function aprobar(id: string, monto: number) {
    setProcesando(id)
    const { error } = await supabase.rpc('aprobar_transaccion', {
      p_transaccion_id: id,
      p_admin_id: user!.id,
    })
    setProcesando(null)

    if (error) {
      setToast(`Error: ${error.message}`)
    } else {
      setToast(`✅ +${monto} créditos aprobados!`)
      await cargar()
      setTimeout(() => setToast(null), 4000)
    }
  }

  async function rechazar(id: string) {
    setProcesando(id)
    await supabase.from('transacciones_creditos').update({ estado: 'rechazado' }).eq('id', id)
    setProcesando(null)
    setToast('Transacción rechazada')
    await cargar()
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-xs">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-brand-yellow p-3 rounded-xl">
            <CreditCard size={24} className="text-brand-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Admin</h1>
            <p className="text-gray-500">Aprueba pagos y entrega créditos</p>
          </div>
        </div>
        <button onClick={cargar} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Actualizar">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Pendientes */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🔴 Pendientes
          <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">{pendientes.length}</span>
        </h2>

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
                      <button onClick={() => aprobar(t.id, t.monto)} disabled={procesando === t.id} className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50">
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
