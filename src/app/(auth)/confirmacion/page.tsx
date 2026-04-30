'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function ConfirmacionContent() {
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    setEmail(sessionStorage.getItem('tempEmail') || 'tu correo electrónico')
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/login'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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

          {/* Bloque de confirmación manual */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-900 font-semibold mb-2">
              🔒 Email de confirmación no enviado aún?
            </p>
            <p className="text-sm text-yellow-800 mb-3">
              Regresa al login y haz clic en<strong> "¿No recibiste el email de confirmación? Reenviarlo"</strong>
            </p>
            <Link
              href="/login"
              className="w-full bg-yellow-500 text-brand-dark font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Ir al login
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center">
            ¿Recibiste el email? Haz clic en el enlace para confirmar.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacionContent
