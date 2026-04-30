'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos. Verifica tus datos.'
        : error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendLoading(true)
    setResendSuccess(false)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setError(error.message === 'User not found'
        ? 'No existe una cuenta con este email'
        : error.message)
    } else {
      setResendSuccess(true)
    }
    setResendLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-brand-yellow font-black text-3xl">
            Tu<span className="text-brand-blue">Cambalo</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Bienvenido de vuelta</h1>
          <p className="text-gray-500 mt-1">Inicia sesión para gestionar tus publicaciones</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-brand-blue font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </p>

          {/* Botón para reenviar email de confirmación */}
          {!showResend ? (
            <p className="text-center text-sm text-gray-500 mt-3">
              ¿No recibiste el email de confirmación?
              <button
                type="button"
                onClick={() => setShowResend(true)}
                className="text-brand-blue font-semibold hover:underline ml-1"
              >
                Reenviarlo
              </button>
            </p>
          ) : (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              {resendSuccess ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-2">
                    ✅ Email reenviado con éxito
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Hemos enviado un nuevo email de confirmación a
                    <strong> {email}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowResend(false)}
                    className="text-brand-blue font-semibold hover:underline text-sm"
                  >
                    Volver al login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResendConfirmation} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50 text-sm"
                  >
                    {resendLoading ? 'Enviando...' : 'Reenviar email de confirmación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResend(false)}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
