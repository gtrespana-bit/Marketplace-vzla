'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'

const estadosVenezuela = [
  'Distrito Capital', 'Miranda', 'Carabobo', 'Lara', 'Zulia',
  'Aragua', 'Anzoátegui', 'Bolívar', 'Mérida', 'Táchira',
  'Trujillo', 'Portuguesa', 'Barinas', 'Apure', 'Guárico',
  'Cojedes', 'Yaracuy', 'Sucre', 'Monagas', 'Nueva Esparta',
  'Amazonas', 'Delta Amacuro', 'Vargas',
]

const ciudadesPorEstado: Record<string, string[]> = {
  'Distrito Capital': ['Caracas'],
  'Miranda': ['Los Teques', 'Guarenas', 'Guatire', 'Petare', 'Baruta'],
  'Carabobo': ['Valencia', 'Puerto Cabello', 'Guacara', 'Mariara', 'San Joaquín'],
  'Lara': ['Barquisimeto', 'Cabudare', 'El Tocuyo', 'Carora'],
  'Zulia': ['Maracaibo', 'San Francisco', 'Cabimas', 'Ciudad Ojeda'],
  'Aragua': ['Maracay', 'Turmero', 'La Victoria', 'Palo Negro'],
  'Anzoátegui': ['Barcelona', 'Puerto La Cruz', 'El Tigre', 'Anaco'],
  'Bolívar': ['Ciudad Guayana', 'Ciudad Bolívar', 'Puerto Ordaz', 'San Félix'],
  'Mérida': ['Mérida', 'Ejido', 'El Vigía'],
  'Táchira': ['San Cristóbal', 'Táriba', 'Rubio', 'San Antonio'],
  'Trujillo': ['Trujillo', 'Valera', 'Boconó'],
  'Portuguesa': ['Acarigua', 'Araure', 'Guanare'],
  'Barinas': ['Barinas', 'Ciudad Bolivia'],
  'Guárico': ['San Juan de los Morros', 'Calabozo', 'Valle de la Pascua'],
  'Yaracuy': ['San Felipe', 'Yaritagua', 'Chivacoa'],
  'Sucre': ['Cumaná', 'Carúpano', 'Güiria'],
  'Monagas': ['Maturín', 'Punta de Mata'],
  'Nueva Esparta': ['Porlamar', 'La Asunción', 'Pampatar'],
}

export default function RegisterPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [estado, setEstado] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ciudades = estado ? ciudadesPorEstado[estado] || [] : []

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          telefono,
          estado,
          ciudad,
        },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Ya existe una cuenta con este email'
        : error.message)
    } else {
      // Redirigir a dashboard si no requiere verificación email
      // o mostrar mensaje de confirmación
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-brand-yellow font-black text-3xl">
            Tu<span className="text-brand-blue">Cambalo</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Crea tu cuenta</h1>
          <p className="text-gray-500 mt-1">Únete gratis. Empieza a vender hoy.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono (opcional)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => { setEstado(e.target.value); setCiudad('') }}
                  required
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                >
                  <option value="">Selecciona...</option>
                  {estadosVenezuela.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                <select
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                >
                  <option value="">Selecciona...</option>
                  {ciudades.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Repetir contraseña</label>
              <input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brand-blue font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
