'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, ExternalLink, Home } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'tu correo electrónico'
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-brand-blue">
            Todo<span className="text-brand-yellow">Anuncios</span>
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
          </div>

          {/* Mensaje principal */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Cuenta creada correctamente!
          </h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 mt-0.5" size={20} />
              <div className="text-left">
                <p className="font-semibold text-blue-900 mb-1">
                  Revisa tu bandeja de entrada
                </p>
                <p className="text-sm text-blue-700">
                  Hemos enviado un email de confirmación a{' '}
                  <strong>{email}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p>
              📧 El email debe tener el asunto: <strong>"Confirma tu cuenta en Todo Anuncios"</strong>
            </p>
            <p>
              🔗 Haz clic en el enlace que viene dentro del email para activar tu cuenta
            </p>
            <p>
              ⚠️ El enlace expira en 24 horas. Si ya no está disponible, solicita uno nuevo en el login.
            </p>
            <p className="text-yellow-700 font-medium">
              📂 Revisa también tu carpeta de SPAM o Correos no deseados
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Link
              href="https://jmbkqelkusxjebsdnjoc.supabase.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-brand-yellow text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition"
            >
              <ExternalLink size={18} />
              Ver mi panel de Supabase
            </Link>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition"
            >
              {countdown > 0 ? `Redirigiendo en ${countdown}s...` : 'Ir al login'}
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 w-full text-gray-600 py-2 hover:text-brand-blue transition"
            >
              <Home size={16} />
              Volver al inicio
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center">
            ¿No recibiste el email? Revisa tu carpeta de spam o solicita uno nuevo en el login.
          </p>
        </div>
      </div>
    </div>
  )
}
