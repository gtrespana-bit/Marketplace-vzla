'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Supabase envía el token en el hash de la URL: #access_token=xxx&type=signup
    const hash = window.location.hash
    if (!hash || hash.length < 2) {
      setStatus('error')
      setErrorMsg('No se encontró el token de confirmación. ¿Quizás ya confirmaste tu cuenta?')
      return
    }

    const params = new URLSearchParams(hash.substring(1))
    const type = params.get('type')
    const token = params.get('access_token')

    async function confirmAccount() {
      // Verificar token con Supabase
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token || '',
        type: (type as 'signup') || 'signup',
      })

      if (error) {
        setStatus('error')
        setErrorMsg(error.message)
      } else {
        setStatus('success')
        // Actualizar la sesión del AuthProvider
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    if (type && token) {
      confirmAccount()
    } else {
      // Sin tipo/token específico, intentar getSession por si supabase ya lo procesó
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email_confirmed_at) {
          setStatus('success')
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setStatus('error')
          setErrorMsg('No se pudo confirmar tu cuenta. Intenta de nuevo.')
        }
      })
    }
  }, [router])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-brand-yellow font-black text-3xl">
            Vende<span className="text-white">T</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="text-brand-blue animate-spin" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Confirmando tu cuenta...
              </h2>
              <p className="text-gray-500 text-center">Un momento, estamos verificando tu email</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                ¡Email confirmado con éxito!
              </h2>
              <p className="text-green-700 text-center mb-6">
                Tu cuenta está lista. Redirigiendo al login...
              </p>
              <Link
                href="/login"
                className="block w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition text-center"
              >
                Ir al login ahora
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <XCircle className="text-red-600" size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                No se pudo confirmar
              </h2>
              <p className="text-red-600 text-center mb-6 text-sm">
                {errorMsg || 'El enlace puede haber expirado. Solicita uno nuevo desde el login.'}
              </p>
              <Link
                href="/login"
                className="block w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition text-center"
              >
                Ir al login para reenviar
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
