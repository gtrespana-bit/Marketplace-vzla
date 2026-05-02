'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'
import { ESTADOS, CIUDADES_POR_ESTADO } from '@/lib/ubicaciones'

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

  const ciudades = estado ? CIUDADES_POR_ESTADO[estado] || [] : []

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
      // Mostrar mensaje de confirmación y redirigir a pantalla de confirmación
      sessionStorage.setItem('tempEmail', email)
      router.push('/confirmacion')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-brand-blue font-black text-3xl">
            Vende<span className="text-brand-yellow">T</span><span className="text-sm ml-1 text-gray-500">-Venezuela</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Crea tu cuenta</h1>
          <p className="text-gray-500 mt-1">Únete gratis. Empieza a vender hoy.</p>

          {/* Banner: credito gratis */}
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="font-bold text-green-800 text-sm">1 crédito GRATIS al registrarte</p>
              <p className="text-green-600 text-xs">Publica 10 anuncios y recibe 5 créditos más. ¡Así de simple!</p>
            </div>
          </div>
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
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-900"
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
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono (opcional)</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+58 412 1234567"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-900"
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
                  {ESTADOS.map((e) => (
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
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-900"
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
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-gray-900"
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
