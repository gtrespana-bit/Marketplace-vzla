'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import { Camera, MapPin, Phone, User, Mail, Star, LogOut, Edit3, X, Save, MessageSquare } from 'lucide-react'

export default function MiPerfilPage() {
  const { user, session } = useAuth()
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [estado, setEstado] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  // Reseñas — del usuario como comprador (sus calificaciones a vendedores)
  const [resenas, setResenas] = useState<any[]>([])
  const [promedio, setPromedio] = useState(0)
  const [totalResenas, setTotalResenas] = useState(0)

  // Cargar perfil desde DB
  useEffect(() => {
    if (!user) { router.push('/login'); return }
    const uid = user.id
    async function loadPerfil() {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', uid)
        .single()
      if (data) {
        setNombre(data.nombre || '')
        setTelefono(data.telefono || '')
        setEstado(data.estado || '')
        setCiudad(data.ciudad || '')
        setFotoUrl(data.foto_perfil_url || null)
      }
      // Cargar reseñas dadas por el usuario (a vendedores)
      const { data: res } = await supabase
        .from('resenas')
        .select('*')
        .eq('comprador_id', uid)
        .order('creado_en', { ascending: false })
      if (res) {
        // Fetch product titles for context
        const prodIds = [...new Set(res.map(r => r.producto_id).filter(Boolean))]
        let prodMap = new Map<string, string>()
        if (prodIds.length > 0) {
          const { data: prods } = await supabase
            .from('productos')
            .select('id, titulo')
            .in('id', prodIds)
          prods?.forEach(p => prodMap.set(p.id, p.titulo))
        }
        setResenas(res.map(r => ({ ...r, producto_titulo: r.producto_id ? (prodMap.get(r.producto_id) || 'Producto eliminado') : null })))
        setTotalResenas(res.length)
        if (res.length > 0) {
          const avg = res.reduce((sum, r) => sum + r.puntuacion, 0) / res.length
          setPromedio(Math.round(avg * 10) / 10)
        }
      }
    }
    loadPerfil()
  }, [user])

  if (!session) return null
  if (!user) return null

  const uid = user.id

  const handleGuardar = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    const { error } = await supabase
      .from('perfiles')
      .update({ nombre, telefono, estado, ciudad })
      .eq('id', uid)
    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      setEditando(false)
    }
    setGuardando(false)
  }

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB')
      return
    }
    setSubiendoFoto(true)
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${uid}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('foto_perfil')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' })
    if (uploadErr) {
      alert('Error subiendo foto: ' + uploadErr.message)
      setSubiendoFoto(false)
      return
    }
    const { data: urlData } = supabase.storage.from('foto_perfil').getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl
    await supabase.from('perfiles').update({ foto_perfil_url: publicUrl }).eq('id', uid)
    setFotoUrl(publicUrl)
    setSubiendoFoto(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const estrellasRender = (rating: number, size = 16) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))
  }

  const estadosVE = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
    'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
    'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
    'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia',
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Perfil</h1>

      {/* ─── Tarjeta de perfil ─── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar clickable */}
          <label className="relative group cursor-pointer">
            <Avatar nombre={nombre} fotoUrl={fotoUrl} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
            {subiendoFoto && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleSubirFoto}
              className="hidden"
              disabled={subiendoFoto}
            />
          </label>

          {/* Info */}
          <div className="flex-1">
            {editando ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="+58 412 1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Estado</label>
                    <select
                      value={estado}
                      onChange={e => setEstado(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Selecciona...</option>
                      {estadosVE.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Tu ciudad"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <Save size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditando(false)}
                    className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <X size={14} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{nombre || 'Sin nombre'}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail size={12} /> {user.email}</p>
                    {(ciudad || estado) && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {[ciudad, estado].filter(Boolean).join(', ')}</p>
                    )}
                    {telefono && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={12} /> {telefono}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditando(true)}
                    className="flex items-center gap-2 text-brand-blue hover:underline text-sm font-medium ml-4"
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Reseñas que he dado ─── */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Star size={20} className="text-yellow-400 fill-yellow-400" />
          Mis Reseñas Dadas
          {totalResenas > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">({totalResenas})</span>
          )}
        </h3>
        {totalResenas === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Star size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Aún no has dejado reseñas</p>
            <p className="text-sm mt-1">Califica vendedores después de comprar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resenas.map(r => (
              <div key={r.id} className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {estrellasRender(r.puntuacion, 16)}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(r.creado_en).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {r.comentario && <p className="text-sm text-gray-600">{r.comentario}</p>}
                {r.producto_titulo && <p className="text-xs text-gray-400 mt-2">Sobre: {r.producto_titulo}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Cerrar sesión ─── */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
