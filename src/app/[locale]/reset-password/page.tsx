'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Supabase redirige al usuario aquí después de hacer clic en el enlace del email.
    // El token viene en el hash de la URL (#access_token=...). Supabase lo procesa
    // automáticamente al cargar la página, así solo verificamos que haya sesión.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // Si no hay sesión, puede que el token aún no se haya procesado.
      // Supabase suele establecer la sesión automáticamente desde el hash.
      // Si no hay sesión después de un momento, mostramos un error.
      if (!session) {
        // Escuchamos cambios de auth (el hash se procesa asíncronamente)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            subscription.unsubscribe()
            setCheckingSession(false)
          }
        })

        // Timeout de 5 segundos — si no llega sesión, asumimos token inválido
        setTimeout(() => {
          setCheckingSession(false)
          subscription.unsubscribe()
        }, 5000)
      } else {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmedPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }

    setLoading(false)
  }

  if (checkingSession) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Verificando enlace de restablecimiento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-brand-primary font-black text-3xl">
            Vende<span className="text-brand-accent">T</span><span className="text-sm ml-1 text-gray-500">-Venezuela</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            {success ? '¡Contraseña actualizada!' : 'Restablecer contraseña'}
          </h1>
          <p className="text-gray-500 mt-1">
            {success
              ? 'Serás redirigido al login en unos segundos...'
              : 'Crea una nueva contraseña para tu cuenta'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-green-700 font-semibold text-lg">Tu contraseña se actualizó correctamente</p>
              <Link
                href="/login"
                className="inline-block mt-6 bg-brand-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-dark transition"
              >
                Ir al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Repetir nueva contraseña</label>
                <input
                  type="password"
                  value={confirmedPassword}
                  onChange={(e) => setConfirmedPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  minLength={8}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent text-gray-900 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-dark transition disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                <Link href="/login" className="text-brand-primary font-semibold hover:underline">
                  Volver al login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
