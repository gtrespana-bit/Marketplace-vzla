'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Camera, User, Phone, MapPin, LogOut } from 'lucide-react'

export default function MiPerfilPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [nombre, setNombre] = useState(user?.user_metadata?.nombre || '')
  const [telefono, setTelefono] = useState(user?.user_metadata?.telefono || '')
  const [estado, setEstado] = useState(user?.user_metadata?.estado || '')
  const [ciudad, setCiudad] = useState(user?.user_metadata?.ciudad || '')

  // Opciones de contacto
  const [contacto, setContacto] = useState({
    whatsapp: false,
    telefonoVisible: false,
    emailVisible: false,
  })

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const handleSave = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.updateUser({
      data: {
        nombre,
        telefono,
        estado,
        ciudad,
        contacto,
      },
    })
    alert('Perfil guardado correctamente')
  }

  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Perfil</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-4xl font-bold relative">
          {nombre ? nombre.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
          <button className="absolute -bottom-1 -right-1 bg-brand-yellow rounded-full p-1.5 shadow-md hover:bg-yellow-400 transition">
            <Camera size={16} className="text-brand-blue" />
          </button>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">{nombre || 'Sin nombre'}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">Registrado {new Date(user?.created_at || '').toLocaleDateString('es-VE')}</p>
        </div>
      </div>

      {/* Info personal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <User size={20} className="text-brand-blue" />
          Información personal
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Phone size={16} /> Teléfono
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+58 412 1234567"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <MapPin size={16} /> Estado
            </label>
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>
        </div>
      </div>

      {/* Preferencias de contacto */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
        <h2 className="font-bold text-lg">Cómo pueden contactarte</h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={contacto.whatsapp} onChange={(e) => setContacto(prev => ({...prev, whatsapp: e.target.checked}))} className="w-5 h-5 rounded text-brand-blue" />
            <div>
              <p className="font-medium text-gray-800">💚 WhatsApp</p>
              <p className="text-xs text-gray-500">Los visitantes pueden abrir un chat de WhatsApp directo</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={contacto.telefonoVisible} onChange={(e) => setContacto(prev => ({...prev, telefonoVisible: e.target.checked}))} className="w-5 h-5 rounded text-brand-blue" />
            <div>
              <p className="font-medium text-gray-800">📱 Mostrar teléfono</p>
              <p className="text-xs text-gray-500">Tu número de teléfono se mostrará en tus publicaciones</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={contacto.emailVisible} onChange={(e) => setContacto(prev => ({...prev, emailVisible: e.target.checked}))} className="w-5 h-5 rounded text-brand-blue" />
            <div>
              <p className="font-medium text-gray-800">📧 Mostrar email</p>
              <p className="text-xs text-gray-500">Tu email se mostrará en tus publicaciones</p>
            </div>
          </label>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button onClick={handleSave} className="flex-1 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">
          Guardar cambios
        </button>
        <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition">
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </div>
  )
}
